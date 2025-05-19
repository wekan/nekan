
"use client";

import type { Board as BoardType, Column as ColumnType, Task, Swimlane as SwimlaneType } from "@/lib/types";
import { KanbanSwimlane } from "./KanbanSwimlane";
import { CreateTaskForm } from "./CreateTaskForm";
import { ShareBoardDialog } from "./ShareBoardDialog";
import { BoardHeader } from "./BoardHeader";
import { useState, useEffect } from "react";
import { rankTasks, RankTasksInput } from "@/ai/flows/rank-tasks";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Initial hardcoded data with swimlanes
const initialBoardData: BoardType = {
  id: "board-1",
  name: "KanbanAI Project",
  tasks: {
    "task-1": { id: "task-1", title: "Setup project structure", description: "Initialize Next.js app, install dependencies.", deadline: "2024-08-01", order: 0 },
    "task-2": { id: "task-2", title: "Design UI components", description: "Create TaskCard, KanbanColumn, KanbanBoard components.", deadline: "2024-08-05", order: 0 },
    "task-3": { id: "task-3", title: "Implement drag and drop for tasks", description: "Allow tasks to be moved between columns.", deadline: "2024-08-10", order: 0 },
    "task-4": { id: "task-4", title: "Integrate AI task ranker", description: "Connect to GenAI flow for task prioritization.", deadline: "2024-08-15", order: 1 },
    "task-5": { id: "task-5", title: "Add share board feature (mock)", description: "Implement UI for sharing boards.", deadline: "2024-08-20", order: 0 },
    "task-6": { id: "task-6", title: "Write documentation", description: "Document components and features.", deadline: "2024-08-25", order: 2 },
  },
  columns: {
    "col-1": { id: "col-1", title: "Backlog", taskIds: ["task-5"], order: 0 },
    "col-2": { id: "col-2", title: "To Do", taskIds: ["task-3", "task-4", "task-6"], order: 0 },
    "col-3": { id: "col-3", title: "In Progress", taskIds: ["task-2"], order: 1 },
    "col-4": { id: "col-4", title: "Done", taskIds: ["task-1"], order: 1 },
  },
  swimlanes: {
    "swim-1": { id: "swim-1", name: "Core Features", columnIds: ["col-2", "col-3"], order: 0, color: "#E0E7FF" }, // Light Indigo
    "swim-2": { id: "swim-2", name: "Support & Documentation", columnIds: ["col-1", "col-4"], order: 1, color: "#FEF3C7" }, // Light Amber
  },
  swimlaneOrder: ["swim-1", "swim-2"],
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
    const targetColumn = board.columns[selectedColumnIdForNewTask];
    const newTaskOrder = targetColumn ? targetColumn.taskIds.length : 0;

    const newTask: Task = {
      id: newTaskId,
      title: values.title,
      description: values.description,
      deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : undefined,
      order: newTaskOrder,
    };

    setBoard(prevBoard => {
      const updatedBoard = { ...prevBoard };
      updatedBoard.tasks = { ...updatedBoard.tasks, [newTaskId]: newTask };
      
      const newColumns = { ...prevBoard.columns };
      if (newColumns[selectedColumnIdForNewTask]) {
        newColumns[selectedColumnIdForNewTask] = {
          ...newColumns[selectedColumnIdForNewTask],
          taskIds: [...newColumns[selectedColumnIdForNewTask].taskIds, newTaskId],
        };
      }
      updatedBoard.columns = newColumns;
      return updatedBoard;
    });

    toast({ title: "Task Created", description: `"${newTask.title}" added to column "${board.columns[selectedColumnIdForNewTask]?.title}".` });
  };

  const handleAddSwimlane = () => {
    const newSwimlaneId = `swim-${Date.now()}`;
    const newSwimlaneName = `New Swimlane ${Object.keys(board.swimlanes).length + 1}`;
    const newSwimlane: SwimlaneType = {
      id: newSwimlaneId,
      name: newSwimlaneName,
      columnIds: [],
      order: board.swimlaneOrder.length,
      // color: // default color or let user choose later
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      swimlanes: {
        ...prevBoard.swimlanes,
        [newSwimlaneId]: newSwimlane,
      },
      swimlaneOrder: [...prevBoard.swimlaneOrder, newSwimlaneId],
    }));
    toast({ title: "Swimlane Added", description: `"${newSwimlaneName}" has been added.` });
  };

  const handleDeleteSwimlane = (swimlaneId: string) => {
    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      const swimlaneToDelete = newBoard.swimlanes[swimlaneId];
      if (!swimlaneToDelete) return prevBoard;

      // Remove columns associated with the swimlane and tasks within those columns
      const newColumns = { ...newBoard.columns };
      const newTasks = { ...newBoard.tasks };
      swimlaneToDelete.columnIds.forEach(colId => {
        const column = newColumns[colId];
        if (column) {
          column.taskIds.forEach(taskId => {
            delete newTasks[taskId];
          });
        }
        delete newColumns[colId];
      });
      
      delete newBoard.swimlanes[swimlaneId];
      newBoard.swimlaneOrder = newBoard.swimlaneOrder.filter(id => id !== swimlaneId);
      newBoard.columns = newColumns;
      newBoard.tasks = newTasks;

      return newBoard;
    });
    toast({ title: "Swimlane Deleted", description: `Swimlane and its contents have been deleted.` });
  };
  
  const handleOpenCard = (taskId: string) => {
    const task = board.tasks[taskId];
    if (task) {
      toast({
        title: `Card Clicked: ${task.title}`,
        description: `ID: ${taskId}. Further actions (e.g. opening a dialog) can be implemented here.`,
      });
      // Placeholder: In a real app, you'd open a modal/dialog here
      // e.g., setSelectedTask(task); setIsCardDetailOpen(true);
    }
  };


  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    // Find the source column by iterating through all columns in all swimlanes
    let sourceColumnId: string | undefined;
    for (const swimlane of Object.values(board.swimlanes)) {
        for (const colId of swimlane.columnIds) {
            if (board.columns[colId]?.taskIds.includes(taskId)) {
                sourceColumnId = colId;
                break;
            }
        }
        if (sourceColumnId) break;
    }

    if (sourceColumnId) {
      event.dataTransfer.setData("taskId", taskId);
      event.dataTransfer.setData("sourceColumnId", sourceColumnId);
      setDraggingTaskId(taskId);
      setDraggedTaskInfo({taskId, sourceColumnId: sourceColumnId});
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
      newBoard.columns = { ...prevBoard.columns }; // Shallow copy columns object
      
      // Ensure source and target columns are also shallow copied if they exist
      const sourceColData = prevBoard.columns[sourceColumnId];
      const targetColData = prevBoard.columns[targetColumnId];

      if (!sourceColData || !targetColData) return prevBoard;

      newBoard.columns[sourceColumnId] = { ...sourceColData, taskIds: [...sourceColData.taskIds] };
      newBoard.columns[targetColumnId] = { ...targetColData, taskIds: [...targetColData.taskIds] };
      
      const sourceCol = newBoard.columns[sourceColumnId];
      const targetCol = newBoard.columns[targetColumnId];

      // Remove from source
      const taskIndexInSource = sourceCol.taskIds.indexOf(movedTaskId);
      if (taskIndexInSource > -1) {
        sourceCol.taskIds.splice(taskIndexInSource, 1);
      }

      // Add to target and update order
      let newOrderIndex;
      if (targetTaskId) {
        const taskIndexInTarget = targetCol.taskIds.indexOf(targetTaskId);
        if (taskIndexInTarget > -1) {
            targetCol.taskIds.splice(taskIndexInTarget, 0, movedTaskId);
            newOrderIndex = taskIndexInTarget;
        } else { 
            targetCol.taskIds.push(movedTaskId);
            newOrderIndex = targetCol.taskIds.length -1;
        }
      } else { 
        targetCol.taskIds.push(movedTaskId);
        newOrderIndex = targetCol.taskIds.length -1;
      }
      
      // Update order for all tasks in target column
      targetCol.taskIds.forEach((tId, index) => {
        if (newBoard.tasks[tId]) {
          newBoard.tasks[tId] = { ...newBoard.tasks[tId], order: index };
        }
      });
       // Update order for tasks in source column if it's different from target
      if (sourceColumnId !== targetColumnId) {
        sourceCol.taskIds.forEach((tId, index) => {
            if (newBoard.tasks[tId]) {
                newBoard.tasks[tId] = { ...newBoard.tasks[tId], order: index };
            }
        });
      }
      
      return newBoard;
    });
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
  };

  const handleRankTasks = async () => {
    // For simplicity, let's assume AI ranking applies to the first "To Do" type column found
    // This needs to be more robust in a real app, perhaps by selecting a column or swimlane.
    let todoColumnId: string | undefined;
    let todoColumn: ColumnType | undefined;

    for (const swimlaneId of board.swimlaneOrder) {
        const swimlane = board.swimlanes[swimlaneId];
        for (const colId of swimlane.columnIds) {
            if (board.columns[colId]?.title.toLowerCase() === "to do") {
                todoColumnId = colId;
                todoColumn = board.columns[colId];
                break;
            }
        }
        if (todoColumn) break;
    }

    if (!todoColumn || !todoColumnId || todoColumn.taskIds.length === 0) {
      toast({ title: "No Tasks to Rank", description: "Could not find a 'To Do' column with tasks." });
      return;
    }
    const finalTodoColumnId = todoColumnId; // To satisfy TypeScript in closure

    setIsRanking(true);
    try {
      const tasksToRank: RankTasksInput["tasks"] = todoColumn.taskIds
        .map(taskId => board.tasks[taskId])
        .filter(task => task) 
        .map(task => ({
          id: task.id,
          description: task.description || task.title,
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
        const newColumns = { ...newBoard.columns };
        const targetCol = newColumns[finalTodoColumnId];
        if (!targetCol) return prevBoard;

        const currentTodoTaskIds = [...targetCol.taskIds];
        const rankedTaskIds = rankedResults
          .sort((a, b) => a.rank - b.rank)
          .map(r => r.id);
        
        const newOrderedTaskIds = rankedTaskIds.filter(id => currentTodoTaskIds.includes(id));
        const unrankedTasks = currentTodoTaskIds.filter(id => !newOrderedTaskIds.includes(id));
        
        const finalTaskIds = [...newOrderedTaskIds, ...unrankedTasks];
        newColumns[finalTodoColumnId] = { ...targetCol, taskIds: finalTaskIds };

        // Update order property for tasks in the ranked column
        const newTasks = { ...newBoard.tasks };
        finalTaskIds.forEach((taskId, index) => {
          if (newTasks[taskId]) {
            newTasks[taskId] = { ...newTasks[taskId], order: index };
          }
        });
        
        newBoard.columns = newColumns;
        newBoard.tasks = newTasks;
        return newBoard;
      });

      toast({ title: "Tasks Ranked", description: `Tasks in "${todoColumn.title}" column have been reordered by AI.` });
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
        onAddSwimlane={handleAddSwimlane}
        isRanking={isRanking}
      />
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto overflow-x-hidden p-1"> {/* Changed to flex-col for vertical swimlanes */}
        {board.swimlaneOrder.map(swimlaneId => {
          const swimlane = board.swimlanes[swimlaneId];
          if (!swimlane) return null;
          
          const columnsInSwimlane = swimlane.columnIds
            .map(colId => board.columns[colId])
            .filter(Boolean) as ColumnType[];
          
          // Sort columns by their order property
          columnsInSwimlane.sort((a, b) => a.order - b.order);

          return (
            <KanbanSwimlane
              key={swimlane.id}
              swimlane={swimlane}
              columns={columnsInSwimlane}
              tasks={board.tasks}
              onOpenCreateTaskForm={handleOpenCreateTaskForm}
              onDropTask={handleDropTask}
              onDragTaskStart={handleDragStart}
              onDragTaskEnd={handleDragEnd}
              draggingTaskId={draggingTaskId}
              onDeleteSwimlane={handleDeleteSwimlane}
              onOpenCard={handleOpenCard}
            />
          );
        })}
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
