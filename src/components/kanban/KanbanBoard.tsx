"use client";

import type { Board as BoardType, Column as ColumnType, Task } from "@/lib/types";
import { KanbanColumn } from "./KanbanColumn";
import { CreateTaskForm } from "./CreateTaskForm";
import { ShareBoardDialog } from "./ShareBoardDialog";
import { BoardHeader } from "./BoardHeader";
import { useState, useEffect } from "react";
import { rankTasks, RankTasksInput } from "@/ai/flows/rank-tasks";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns"; // For formatting dates for AI

// Initial hardcoded data
const initialBoardData: BoardType = {
  id: "board-1",
  name: "KanbanAI Project",
  tasks: {
    "task-1": { id: "task-1", title: "Setup project structure", description: "Initialize Next.js app, install dependencies.", deadline: "2024-08-01" },
    "task-2": { id: "task-2", title: "Design UI components", description: "Create TaskCard, KanbanColumn, KanbanBoard components.", deadline: "2024-08-05" },
    "task-3": { id: "task-3", title: "Implement drag and drop", description: "Allow tasks to be moved between columns.", deadline: "2024-08-10" },
    "task-4": { id: "task-4", title: "Integrate AI task ranker", description: "Connect to GenAI flow for task prioritization.", deadline: "2024-08-15" },
    "task-5": { id: "task-5", title: "Add share board feature (mock)", description: "Implement UI for sharing boards.", deadline: "2024-08-20" },
    "task-6": { id: "task-6", title: "Write documentation", description: "Document components and features.", deadline: "2024-08-25" },
  },
  columns: [
    { id: "col-1", title: "Backlog", taskIds: ["task-5"] },
    { id: "col-2", title: "To Do", taskIds: ["task-3", "task-4", "task-6"] },
    { id: "col-3", title: "In Progress", taskIds: ["task-2"] },
    { id: "col-4", title: "Done", taskIds: ["task-1"] },
  ],
};


export function KanbanBoard() {
  const [board, setBoard] = useState<BoardType>(initialBoardData);
  const [isCreateTaskFormOpen, setCreateTaskFormOpen] = useState(false);
  const [selectedColumnIdForNewTask, setSelectedColumnIdForNewTask] = useState<string | null>(null);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const { toast } = useToast();

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{taskId: string, sourceColumnId: string} | null>(null);


  const handleOpenCreateTaskForm = (columnId: string) => {
    setSelectedColumnIdForNewTask(columnId);
    setCreateTaskFormOpen(true);
  };

  const handleCreateTask = (values: { title: string; description?: string; deadline?: Date }) => {
    if (!selectedColumnIdForNewTask) return;

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newTaskId,
      title: values.title,
      description: values.description,
      deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : undefined,
    };

    setBoard(prevBoard => {
      const updatedBoard = { ...prevBoard };
      updatedBoard.tasks = { ...updatedBoard.tasks, [newTaskId]: newTask };
      updatedBoard.columns = updatedBoard.columns.map(col => {
        if (col.id === selectedColumnIdForNewTask) {
          return { ...col, taskIds: [...col.taskIds, newTaskId] };
        }
        return col;
      });
      return updatedBoard;
    });

    toast({ title: "Task Created", description: `"${newTask.title}" added to the board.` });
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    const sourceColumn = board.columns.find(col => col.taskIds.includes(taskId));
    if (sourceColumn) {
      event.dataTransfer.setData("taskId", taskId);
      event.dataTransfer.setData("sourceColumnId", sourceColumn.id);
      setDraggingTaskId(taskId);
      setDraggedTaskInfo({taskId, sourceColumnId: sourceColumn.id});
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
  };

  const handleDropTask = (event: React.DragEvent<HTMLDivElement>, targetColumnId: string, targetTaskId?: string) => {
    event.preventDefault();
    if (!draggedTaskInfo) return;

    const {taskId: movedTaskId, sourceColumnId} = draggedTaskInfo;

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      newBoard.columns = prevBoard.columns.map(col => ({ ...col, taskIds: [...col.taskIds] }));

      const sourceCol = newBoard.columns.find(col => col.id === sourceColumnId);
      const targetCol = newBoard.columns.find(col => col.id === targetColumnId);

      if (!sourceCol || !targetCol) return prevBoard;

      // Remove from source
      const taskIndexInSource = sourceCol.taskIds.indexOf(movedTaskId);
      if (taskIndexInSource > -1) {
        sourceCol.taskIds.splice(taskIndexInSource, 1);
      }

      // Add to target
      if (targetTaskId) { // Dropped on a specific task for reordering
        const taskIndexInTarget = targetCol.taskIds.indexOf(targetTaskId);
        if (taskIndexInTarget > -1) {
            // Insert before the target task
            targetCol.taskIds.splice(taskIndexInTarget, 0, movedTaskId);
        } else { // Target task ID not found (should not happen if logic is correct)
            targetCol.taskIds.push(movedTaskId);
        }
      } else { // Dropped on the column itself (empty space)
        targetCol.taskIds.push(movedTaskId);
      }
      
      return newBoard;
    });
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
  };

  const handleRankTasks = async () => {
    const todoColumn = board.columns.find(col => col.title === "To Do");
    if (!todoColumn || todoColumn.taskIds.length === 0) {
      toast({ title: "No Tasks to Rank", description: "The 'To Do' column is empty." });
      return;
    }

    setIsRanking(true);
    try {
      const tasksToRank: RankTasksInput["tasks"] = todoColumn.taskIds
        .map(taskId => board.tasks[taskId])
        .filter(task => task) // Ensure task exists
        .map(task => ({
          id: task.id,
          description: task.description || task.title, // Use title if description is missing
          deadline: task.deadline,
        }));

      if (tasksToRank.length === 0) {
         toast({ title: "No Tasks to Rank", description: "No valid tasks found in 'To Do' column." });
         setIsRanking(false);
         return;
      }

      const rankedResults = await rankTasks({ tasks: tasksToRank });

      setBoard(prevBoard => {
        const newBoard = { ...prevBoard };
        const todoColIndex = newBoard.columns.findIndex(col => col.id === todoColumn.id);
        if (todoColIndex === -1) return prevBoard;

        const currentTodoTaskIds = [...newBoard.columns[todoColIndex].taskIds];
        const rankedTaskIds = rankedResults
          .sort((a, b) => a.rank - b.rank)
          .map(r => r.id);
        
        // Filter out tasks that were not part of the ranking (e.g. if some tasks were added/removed during API call)
        // and preserve tasks not in ranked results at the end
        const newTodoTaskIds = rankedTaskIds.filter(id => currentTodoTaskIds.includes(id));
        const unrankedTasks = currentTodoTaskIds.filter(id => !newTodoTaskIds.includes(id));
        
        newBoard.columns[todoColIndex].taskIds = [...newTodoTaskIds, ...unrankedTasks];
        return newBoard;
      });

      toast({ title: "Tasks Ranked", description: "Tasks in 'To Do' column have been reordered by AI." });
    } catch (error) {
      console.error("Error ranking tasks:", error);
      toast({ variant: "destructive", title: "Ranking Failed", description: "Could not rank tasks. Please try again." });
    } finally {
      setIsRanking(false);
    }
  };


  return (
    <div className="flex flex-col h-full">
      <BoardHeader
        boardName={board.name}
        onRankTasks={handleRankTasks}
        onShareBoard={() => setShareDialogOpen(true)}
        isRanking={isRanking}
      />
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {board.columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={column.taskIds.map(taskId => board.tasks[taskId]).filter(Boolean) as Task[]}
            onAddTask={handleOpenCreateTaskForm}
            onDropTask={handleDropTask}
            onDragTaskStart={handleDragStart}
            onDragTaskEnd={handleDragEnd}
            draggingTaskId={draggingTaskId}
          />
        ))}
      </div>
      <CreateTaskForm
        isOpen={isCreateTaskFormOpen}
        onOpenChange={setCreateTaskFormOpen}
        onSubmit={handleCreateTask}
      />
      <ShareBoardDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setShareDialogOpen}
        boardName={board.name}
      />
    </div>
  );
}
