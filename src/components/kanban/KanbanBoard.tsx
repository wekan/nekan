
"use client";

import type { Board as BoardType, List as ListType, Task, Swimlane as SwimlaneType } from "@/lib/types";
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
    "task-1": { id: "task-1", title: "Setup project structure", description: "Initialize Next.js app, install dependencies.", deadline: "2024-08-01", order: 0, color: "#FFFFFF" },
    "task-2": { id: "task-2", title: "Design UI components", description: "Create TaskCard, KanbanList, KanbanBoard components.", deadline: "2024-08-05", order: 0, color: "#FFFFFF" },
    "task-3": { id: "task-3", title: "Implement drag and drop for tasks", description: "Allow tasks to be moved between lists.", deadline: "2024-08-10", order: 0, color: "#FFFFFF" },
    "task-4": { id: "task-4", title: "Integrate AI task ranker", description: "Connect to GenAI flow for task prioritization.", deadline: "2024-08-15", order: 1, color: "#FFFFFF" },
    "task-5": { id: "task-5", title: "Add share board feature (mock)", description: "Implement UI for sharing boards.", deadline: "2024-08-20", order: 0, color: "#FFF5E1" }, // Example color
    "task-6": { id: "task-6", title: "Write documentation", description: "Document components and features.", deadline: "2024-08-25", order: 2, color: "#FFFFFF" },
  },
  lists: {
    "list-1": { id: "list-1", title: "Backlog", taskIds: ["task-5"], order: 0, color: "#F3F4F6" }, // Example color
    "list-2": { id: "list-2", title: "To Do", taskIds: ["task-3", "task-4", "task-6"], order: 0, color: "#FFFFFF" },
    "list-3": { id: "list-3", title: "In Progress", taskIds: ["task-2"], order: 1, color: "#FFFFFF" },
    "list-4": { id: "list-4", title: "Done", taskIds: ["task-1"], order: 1, color: "#E0F2FE" }, // Example color
  },
  swimlanes: {
    "swim-1": { id: "swim-1", name: "Core Features", listIds: ["list-2", "list-3"], order: 0, color: "#E0E7FF" },
    "swim-2": { id: "swim-2", name: "Support & Documentation", listIds: ["list-1", "list-4"], order: 1, color: "#FEF3C7" },
  },
  swimlaneOrder: ["swim-1", "swim-2"],
};


export function KanbanBoard() {
  const [board, setBoard] = useState<BoardType>(initialBoardData);
  const [isCreateTaskFormOpen, setCreateTaskFormOpen] = useState(false);
  const [selectedListIdForNewTask, setSelectedListIdForNewTask] = useState<string | null>(null);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const { toast } = useToast();

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{taskId: string, sourceListId: string} | null>(null);

  const handleOpenCreateTaskForm = (listId: string) => {
    setSelectedListIdForNewTask(listId);
    setCreateTaskFormOpen(true);
  };

  const handleCreateTask = (values: { title: string; description?: string; deadline?: Date }) => {
    if (!selectedListIdForNewTask) return;

    const newTaskId = `task-${Date.now()}`;
    const targetList = board.lists[selectedListIdForNewTask];
    const newTaskOrder = targetList ? targetList.taskIds.length : 0;

    const newTask: Task = {
      id: newTaskId,
      title: values.title,
      description: values.description,
      deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : undefined,
      order: newTaskOrder,
      color: "#FFFFFF", // Default color for new tasks
    };

    setBoard(prevBoard => {
      const updatedBoard = { ...prevBoard };
      updatedBoard.tasks = { ...updatedBoard.tasks, [newTaskId]: newTask };
      
      const newLists = { ...prevBoard.lists };
      if (newLists[selectedListIdForNewTask]) {
        newLists[selectedListIdForNewTask] = {
          ...newLists[selectedListIdForNewTask],
          taskIds: [...newLists[selectedListIdForNewTask].taskIds, newTaskId],
        };
      }
      updatedBoard.lists = newLists;
      return updatedBoard;
    });

    toast({ title: "Task Created", description: `"${newTask.title}" added to list "${board.lists[selectedListIdForNewTask]?.title}".` });
  };

  const handleAddSwimlane = () => {
    const newSwimlaneId = `swim-${Date.now()}`;
    const newSwimlaneName = `New Swimlane ${Object.keys(board.swimlanes).length + 1}`;
    const newSwimlane: SwimlaneType = {
      id: newSwimlaneId,
      name: newSwimlaneName,
      listIds: [],
      order: board.swimlaneOrder.length,
      color: "#F9FAFB", // Default color for new swimlanes
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

      const newLists = { ...newBoard.lists };
      const newTasks = { ...newBoard.tasks };
      swimlaneToDelete.listIds.forEach(listId => {
        const list = newLists[listId];
        if (list) {
          list.taskIds.forEach(taskId => {
            delete newTasks[taskId];
          });
        }
        delete newLists[listId];
      });
      
      delete newBoard.swimlanes[swimlaneId];
      newBoard.swimlaneOrder = newBoard.swimlaneOrder.filter(id => id !== swimlaneId);
      newBoard.lists = newLists;
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
    }
  };


  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    let sourceListId: string | undefined;
    // Find the source list by iterating through swimlanes and their lists
    for (const swimlane of Object.values(board.swimlanes)) {
        for (const listId of swimlane.listIds) {
            if (board.lists[listId]?.taskIds.includes(taskId)) {
                sourceListId = listId;
                break;
            }
        }
        if (sourceListId) break;
    }

    if (sourceListId) {
      event.dataTransfer.setData("taskId", taskId);
      event.dataTransfer.setData("sourceListId", sourceListId); // Though we use state, this can be useful
      setDraggingTaskId(taskId);
      setDraggedTaskInfo({taskId, sourceListId: sourceListId});
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
  };

  const handleDropTask = (event: React.DragEvent<HTMLDivElement>, currentTargetListId: string, currentTargetTaskId?: string) => {
    event.preventDefault();
    if (!draggedTaskInfo) {
      console.warn("draggedTaskInfo is null in handleDropTask");
      return;
    }
  
    const { taskId: movedTaskId, sourceListId: currentSourceListId } = draggedTaskInfo;
  
    setBoard(prevBoard => {
      const newBoardState = { ...prevBoard };
      const newListsState = { ...newBoardState.lists }; // Shallow copy of the lists map
  
      // Get task IDs from the source list
      const sourceListTaskIdsCopy = [...newListsState[currentSourceListId].taskIds];
      const taskIndexInSource = sourceListTaskIdsCopy.indexOf(movedTaskId);
  
      if (taskIndexInSource === -1) {
        // This should ideally not happen if dragStart was correct
        console.warn(`Task ${movedTaskId} not found in source list ${currentSourceListId}. Aborting drop.`);
        return prevBoard;
      }
  
      // 1. Remove task from (copied) source task IDs
      sourceListTaskIdsCopy.splice(taskIndexInSource, 1);
  
      let finalTaskIdsForTargetList;
  
      if (currentSourceListId === currentTargetListId) {
        // Moving within the same list
        // Operate on the array that already had the task removed
        finalTaskIdsForTargetList = [...sourceListTaskIdsCopy]; 
  
        if (currentTargetTaskId) { // Dropping onto an existing task in the same list
          const insertAtIndex = finalTaskIdsForTargetList.indexOf(currentTargetTaskId);
          if (insertAtIndex > -1) {
            finalTaskIdsForTargetList.splice(insertAtIndex, 0, movedTaskId);
          } else {
            // If currentTargetTaskId is not found (e.g., it was the movedTaskId itself and now removed, or some other edge case)
            finalTaskIdsForTargetList.push(movedTaskId); // Append to be safe
          }
        } else { // Dropping into an empty area of the same list
          finalTaskIdsForTargetList.push(movedTaskId);
        }
        newListsState[currentTargetListId] = { ...newListsState[currentTargetListId], taskIds: finalTaskIdsForTargetList };
      } else {
        // Moving to a different list
        // First, update the source list with the task removed
        newListsState[currentSourceListId] = { ...newListsState[currentSourceListId], taskIds: sourceListTaskIdsCopy };
  
        // Now, prepare the target list
        finalTaskIdsForTargetList = [...newListsState[currentTargetListId].taskIds];
        if (currentTargetTaskId) { // Dropping onto an existing task in the new list
          const insertAtIndex = finalTaskIdsForTargetList.indexOf(currentTargetTaskId);
          if (insertAtIndex > -1) {
            finalTaskIdsForTargetList.splice(insertAtIndex, 0, movedTaskId);
          } else {
            finalTaskIdsForTargetList.push(movedTaskId); // Fallback: append if target not found
          }
        } else { // Dropping into an empty area of the new list
          finalTaskIdsForTargetList.push(movedTaskId);
        }
        newListsState[currentTargetListId] = { ...newListsState[currentTargetListId], taskIds: finalTaskIdsForTargetList };
      }
  
      newBoardState.lists = newListsState;
  
      // Update task 'order' property for all tasks in affected lists
      const affectedListIds = new Set([currentSourceListId, currentTargetListId]);
      const newTasksState = { ...newBoardState.tasks };
  
      affectedListIds.forEach(listId => {
        const list = newBoardState.lists[listId];
        if (list) {
          list.taskIds.forEach((tId, index) => {
            if (newTasksState[tId]) {
              newTasksState[tId] = { ...newTasksState[tId], order: index };
            }
          });
        }
      });
      newBoardState.tasks = newTasksState;
      
      return newBoardState;
    });
  
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
  };
  

  const handleRankTasks = async () => {
    let todoListId: string | undefined;
    let todoList: ListType | undefined;

    // Find "To Do" list across all swimlanes
    for (const swimlaneId of board.swimlaneOrder) {
        const swimlane = board.swimlanes[swimlaneId];
        for (const listId of swimlane.listIds) {
            if (board.lists[listId]?.title.toLowerCase() === "to do") {
                todoListId = listId;
                todoList = board.lists[listId];
                break;
            }
        }
        if (todoList) break;
    }

    if (!todoList || !todoListId || todoList.taskIds.length === 0) {
      toast({ title: "No Tasks to Rank", description: "Could not find a 'To Do' list with tasks." });
      return;
    }
    const finalTodoListId = todoListId; // Capture for use in closure

    setIsRanking(true);
    try {
      const tasksToRank: RankTasksInput["tasks"] = todoList.taskIds
        .map(taskId => board.tasks[taskId])
        .filter(task => task) // Ensure task exists
        .map(task => ({
          id: task.id,
          description: task.description || task.title, // Use title if description is empty
          deadline: task.deadline,
        }));

      if (tasksToRank.length === 0) {
         toast({ title: "No Tasks to Rank", description: "No valid tasks found in 'To Do' list." });
         setIsRanking(false);
         return;
      }

      const rankedResults = await rankTasks({ tasks: tasksToRank });

      setBoard(prevBoard => {
        const newBoard = { ...prevBoard };
        const newLists = { ...newBoard.lists };
        const targetList = newLists[finalTodoListId]; // Use captured list ID
        if (!targetList) return prevBoard; // Should not happen

        // Get current task IDs in the "To Do" list to ensure only existing tasks are reordered
        const currentTodoTaskIds = [...targetList.taskIds];
        
        // Create a map of rank per task ID for easier lookup
        const rankMap = new Map(rankedResults.map(r => [r.id, r.rank]));

        // Sort existing task IDs based on AI rank, unranked tasks go to the bottom
        const newOrderedTaskIds = [...currentTodoTaskIds].sort((aId, bId) => {
            const rankA = rankMap.get(aId);
            const rankB = rankMap.get(bId);

            if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
            if (rankA !== undefined) return -1; // a is ranked, b is not -> a comes first
            if (rankB !== undefined) return 1;  // b is ranked, a is not -> b comes first
            return 0; // neither is ranked by AI, keep original relative order (or could use task.order)
        });
        
        newLists[finalTodoListId] = { ...targetList, taskIds: newOrderedTaskIds };

        // Update order property for tasks in the sorted list
        const newTasks = { ...newBoard.tasks };
        newOrderedTaskIds.forEach((taskId, index) => {
          if (newTasks[taskId]) {
            newTasks[taskId] = { ...newTasks[taskId], order: index };
          }
        });
        
        newBoard.lists = newLists;
        newBoard.tasks = newTasks;
        return newBoard;
      });

      toast({ title: "Tasks Ranked", description: `Tasks in "${todoList.title}" list have been reordered by AI.` });
    } catch (error) {
      console.error("Error ranking tasks:", error);
      toast({ variant: "destructive", title: "Ranking Failed", description: "Could not rank tasks. Please try again." });
    } finally {
      setIsRanking(false);
    }
  };

  const handleSetSwimlaneColor = (swimlaneId: string, color: string) => {
    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      if (newBoard.swimlanes[swimlaneId]) {
        newBoard.swimlanes = {
          ...newBoard.swimlanes,
          [swimlaneId]: { ...newBoard.swimlanes[swimlaneId], color }
        };
      }
      return newBoard;
    });
    toast({ title: "Swimlane color updated" });
  };

  const handleSetListColor = (listId: string, color: string) => {
    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      if (newBoard.lists[listId]) {
        newBoard.lists = {
          ...newBoard.lists,
          [listId]: { ...newBoard.lists[listId], color }
        };
      }
      return newBoard;
    });
    toast({ title: "List color updated" });
  };

  const handleSetTaskColor = (taskId: string, color: string) => {
    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      if (newBoard.tasks[taskId]) {
         newBoard.tasks = {
          ...newBoard.tasks,
          [taskId]: { ...newBoard.tasks[taskId], color }
        };
      }
      return newBoard;
    });
    toast({ title: "Task color updated" });
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
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto overflow-x-hidden p-1">
        {board.swimlaneOrder.map(swimlaneId => {
          const swimlane = board.swimlanes[swimlaneId];
          if (!swimlane) return null;
          
          const listsInSwimlane = swimlane.listIds
            .map(listId => board.lists[listId])
            .filter(Boolean) as ListType[]; // Ensure list exists
          
          // Sort lists based on their order property, if available
          listsInSwimlane.sort((a, b) => a.order - b.order);

          return (
            <KanbanSwimlane
              key={swimlane.id}
              swimlane={swimlane}
              lists={listsInSwimlane}
              tasks={board.tasks}
              onOpenCreateTaskForm={handleOpenCreateTaskForm}
              onDropTask={handleDropTask}
              onDragTaskStart={handleDragStart}
              onDragTaskEnd={handleDragEnd}
              draggingTaskId={draggingTaskId}
              onDeleteSwimlane={handleDeleteSwimlane}
              onOpenCard={handleOpenCard}
              onSetSwimlaneColor={handleSetSwimlaneColor}
              onSetListColor={handleSetListColor}
              onSetTaskColor={handleSetTaskColor}
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

