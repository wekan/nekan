
"use client";

import type { Board as BoardType, List as ListType, Task, Swimlane as SwimlaneType } from "@/lib/types";
import { KanbanSwimlane } from "./KanbanSwimlane"; // Changed from Swimlane to KanbanSwimlane
import { CreateTaskForm } from "./CreateTaskForm";
import { ShareBoardDialog } from "./ShareBoardDialog";
import { BoardHeader } from "./BoardHeader";
import React, { useState, useEffect } from "react";
import { rankTasks, RankTasksInput } from "@/ai/flows/rank-tasks";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AddSwimlaneDialog } from "./AddSwimlaneDialog"; 

// Initial hardcoded data with swimlanes
const initialBoardData: BoardType = {
  id: "board-1",
  name: "KanbanAI Project",
  tasks: {
    "task-1": { id: "task-1", title: "Setup project structure", description: "Initialize Next.js app, install dependencies.", deadline: "2024-08-01", order: 0, color: "#FFFFFF" },
    "task-2": { id: "task-2", title: "Design UI components", description: "Create Card, List, Swimlane components.", deadline: "2024-08-05", order: 0, color: "#FFFFFF" },
    "task-3": { id: "task-3", title: "Implement drag and drop for tasks", description: "Allow tasks to be moved between lists.", deadline: "2024-08-10", order: 0, color: "#FFFFFF" },
    "task-4": { id: "task-4", title: "Integrate AI task ranker", description: "Connect to GenAI flow for task prioritization.", deadline: "2024-08-15", order: 1, color: "#FFFFFF" },
    "task-5": { id: "task-5", title: "Add share board feature (mock)", description: "Implement UI for sharing boards.", deadline: "2024-08-20", order: 0, color: "#FFF5E1" },
    "task-6": { id: "task-6", title: "Write documentation", description: "Document components and features.", deadline: "2024-08-25", order: 2, color: "#FFFFFF" },
  },
  lists: {
    "list-1": { id: "list-1", title: "Backlog", taskIds: ["task-5"], order: 0, color: "#F3F4F6" },
    "list-2": { id: "list-2", title: "To Do", taskIds: ["task-3", "task-4", "task-6"], order: 0, color: "#FFFFFF" },
    "list-3": { id: "list-3", title: "In Progress", taskIds: ["task-2"], order: 1, color: "#FFFFFF" },
    "list-4": { id: "list-4", title: "Done", taskIds: ["task-1"], order: 2, color: "#E0F2FE" },
  },
  swimlanes: {
    "swim-1": { id: "swim-1", name: "Core Features", listIds: ["list-2", "list-3"], order: 0, color: "#E0E7FF" },
    "swim-2": { id: "swim-2", name: "Support & Docs", listIds: ["list-1", "list-4"], order: 1, color: "#FEF3C7" },
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

  // State for D&D
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggedTaskInfo, setDraggedTaskInfo] = useState<{taskId: string, sourceListId: string} | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ listId: string; beforeTaskId: string | null } | null>(null);
  
  const [draggingListId, setDraggingListId] = useState<string | null>(null);
  const [draggedListInfo, setDraggedListInfo] = useState<{ listId: string; sourceSwimlaneId: string; sourceListIndex: number } | null>(null);
  const [dropTargetListId, setDropTargetListId] = useState<string | null>(null); 
  
  const [draggingSwimlaneId, setDraggingSwimlaneId] = useState<string | null>(null);
  const [dropTargetSwimlaneId, setDropTargetSwimlaneId] = useState<string | null>(null);


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
      color: "#FFFFFF", 
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

  // This adds a swimlane to the very end of the board, triggered by BoardHeader
  const handleAddSwimlaneToEnd = () => { 
    const newSwimlaneId = `swim-${Date.now()}`;
    const newSwimlaneName = `New Swimlane ${Object.keys(board.swimlanes).length + 1}`;
    const newSwimlane: SwimlaneType = {
      id: newSwimlaneId,
      name: newSwimlaneName,
      listIds: [],
      order: board.swimlaneOrder.length,
      color: "#F9FAFB", 
    };

    setBoard(prevBoard => ({
      ...prevBoard,
      swimlanes: {
        ...prevBoard.swimlanes,
        [newSwimlaneId]: newSwimlane,
      },
      swimlaneOrder: [...prevBoard.swimlaneOrder, newSwimlaneId],
    }));
    toast({ title: "Swimlane Added", description: `"${newSwimlaneName}" has been added to the end of the board.` });
  };

  // This adds a swimlane below a reference swimlane, triggered from within a Swimlane component
  const handleAddSwimlaneBelow = (name: string, referenceSwimlaneId: string) => {
    const newSwimlaneId = `swim-${Date.now()}`;
    const newSwimlane: SwimlaneType = {
      id: newSwimlaneId,
      name: name || `New Swimlane ${Object.keys(board.swimlanes).length + 1}`,
      listIds: [],
      order: 0, 
      color: "#F9FAFB",
    };

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      let newSwimlaneOrder = [...newBoard.swimlaneOrder];
      const referenceIndex = newSwimlaneOrder.indexOf(referenceSwimlaneId);

      if (referenceIndex === -1) { 
        newSwimlaneOrder.push(newSwimlaneId); // Fallback, add to end
      } else {
        newSwimlaneOrder.splice(referenceIndex + 1, 0, newSwimlaneId);
      }
      
      newBoard.swimlaneOrder = newSwimlaneOrder;
      newBoard.swimlanes = { ...newBoard.swimlanes, [newSwimlaneId]: newSwimlane };

      // Re-order all swimlanes
      newBoard.swimlaneOrder.forEach((sId, index) => {
        if (newBoard.swimlanes[sId]) {
          newBoard.swimlanes[sId].order = index;
        }
      });
      
      return newBoard;
    });
    toast({ title: "Swimlane Added", description: `"${newSwimlane.name}" added below "${board.swimlanes[referenceSwimlaneId]?.name}".` });
  };

  const handleAddSwimlaneFromTemplate = (referenceSwimlaneId: string) => {
    toast({
      title: "Feature Not Implemented",
      description: "Adding swimlanes from templates is coming soon!",
    });
  };


  const handleDeleteSwimlane = (swimlaneId: string) => {
    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      const swimlaneToDelete = newBoard.swimlanes[swimlaneId];
      if (!swimlaneToDelete) return prevBoard;

      // Clean up lists and tasks associated with the swimlane
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

      // Re-order remaining swimlanes
      newBoard.swimlaneOrder.forEach((sId, index) => {
        if (newBoard.swimlanes[sId]) {
          newBoard.swimlanes[sId].order = index;
        }
      });

      return newBoard;
    });
    toast({ title: "Swimlane Deleted", description: `Swimlane and its contents have been deleted.` });
  };
  
  const handleOpenCard = (taskId: string) => {
    const task = board.tasks[taskId];
    if (task) {
      toast({
        title: `Card Clicked: ${task.title}`,
        description: `ID: ${taskId}. Details: ${task.description || 'No description'}. Deadline: ${task.deadline || 'None'}`,
      });
    }
  };

  // Task D&D Handlers
  const handleDragTaskStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    let sourceListId: string | undefined;
    // Find the source list ID
    for (const swimlaneId of board.swimlaneOrder) {
        const swimlane = board.swimlanes[swimlaneId];
        if (swimlane) {
            for (const listId of swimlane.listIds) {
                if (board.lists[listId]?.taskIds.includes(taskId)) {
                    sourceListId = listId;
                    break;
                }
            }
        }
        if (sourceListId) break;
    }
  
    if (sourceListId) {
      event.dataTransfer.setData("taskId", taskId);
      event.dataTransfer.setData("sourceListId", sourceListId); 
      setDraggingTaskId(taskId);
      setDraggedTaskInfo({ taskId, sourceListId }); 
      event.dataTransfer.effectAllowed = "move";
    }
  };
  

  const handleDragTaskEnd = () => {
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
    setDropIndicator(null);
  };

  const handleDropTask = (event: React.DragEvent<HTMLDivElement>, currentTargetListId: string, currentTargetTaskId?: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!draggedTaskInfo) return; 
  
    const { taskId: movedTaskId, sourceListId: currentSourceListId } = draggedTaskInfo;
  
    setBoard(prevBoard => {
      const newBoardState = { ...prevBoard };
      const newListsState = { ...newBoardState.lists };
  
      let sourceListTaskIdsCopy = [...newListsState[currentSourceListId].taskIds];
      const taskIndexInSource = sourceListTaskIdsCopy.indexOf(movedTaskId);
      if (taskIndexInSource > -1) {
        sourceListTaskIdsCopy.splice(taskIndexInSource, 1);
      }
  
      let finalTaskIdsForTargetList;
      if (currentSourceListId === currentTargetListId) {
        finalTaskIdsForTargetList = [...sourceListTaskIdsCopy]; // Use the already modified array
      } else {
        newListsState[currentSourceListId] = { ...newListsState[currentSourceListId], taskIds: sourceListTaskIdsCopy };
        finalTaskIdsForTargetList = newListsState[currentTargetListId] ? [...newListsState[currentTargetListId].taskIds] : [];
      }
      
      const taskIndexInTargetPreInsert = finalTaskIdsForTargetList.indexOf(movedTaskId);
      if (taskIndexInTargetPreInsert > -1) {
         finalTaskIdsForTargetList.splice(taskIndexInTargetPreInsert, 1);
      }

      const insertAtIndex = currentTargetTaskId ? finalTaskIdsForTargetList.indexOf(currentTargetTaskId) : -1;
      if (insertAtIndex > -1) {
        finalTaskIdsForTargetList.splice(insertAtIndex, 0, movedTaskId);
      } else {
        finalTaskIdsForTargetList.push(movedTaskId); 
      }
      newListsState[currentTargetListId] = { ...newListsState[currentTargetListId], taskIds: finalTaskIdsForTargetList };
      
      newBoardState.lists = newListsState;
  
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
  
    setDropIndicator(null); 
  };

  const handleTaskDragOverList = (event: React.DragEvent, targetListId: string, targetTaskId?: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggingTaskId) {
      setDropIndicator({ listId: targetListId, beforeTaskId: targetTaskId || null });
      event.dataTransfer.dropEffect = "move";
    }
  };
  
  
  // Swimlane D&D Handlers
  const handleSwimlaneDragStart = (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => {
    event.dataTransfer.setData("swimlaneId", swimlaneId);
    setDraggingSwimlaneId(swimlaneId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSwimlaneDragOver = (event: React.DragEvent<HTMLDivElement>, hoverSwimlaneId: string) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingSwimlaneId && draggingSwimlaneId !== hoverSwimlaneId) {
      setDropTargetSwimlaneId(hoverSwimlaneId); 
    }
    event.dataTransfer.dropEffect = "move";
  };
  
  const handleBoardAreaDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingSwimlaneId) { 
        setDropTargetSwimlaneId("end-of-board");
    } else if (draggingListId) {
        // If dragging a list over the main board area (not a swimlane), clear list drop target.
        // This helps if the user drags a list out of a swimlane and into "no man's land".
        // It prevents the list from trying to drop onto the board itself.
        setDropTargetListId(null); // No specific list target here
    }
    event.dataTransfer.dropEffect = "move";
  };

  const handleSwimlaneDrop = (event: React.DragEvent<HTMLDivElement>, beforeSwimlaneId?: string) => { 
    event.preventDefault();
    event.stopPropagation();
    const movedSwimlaneId = event.dataTransfer.getData("swimlaneId") || draggingSwimlaneId;


    if (!movedSwimlaneId || (beforeSwimlaneId && movedSwimlaneId === beforeSwimlaneId)) {
      setDropTargetSwimlaneId(null);
      // setDraggingSwimlaneId(null); // Keep draggingSwimlaneId until dragEnd
      return;
    }

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      let newSwimlaneOrder = [...newBoard.swimlaneOrder];
      
      const sourceIndex = newSwimlaneOrder.indexOf(movedSwimlaneId);
      if (sourceIndex === -1) return prevBoard; 

      newSwimlaneOrder.splice(sourceIndex, 1); 

      if (beforeSwimlaneId) { 
        const targetIndex = newSwimlaneOrder.indexOf(beforeSwimlaneId);
        if (targetIndex !== -1) {
          newSwimlaneOrder.splice(targetIndex, 0, movedSwimlaneId); 
        } else { 
          newSwimlaneOrder.push(movedSwimlaneId); 
        }
      } else { 
        newSwimlaneOrder.push(movedSwimlaneId); 
      }
      
      newBoard.swimlaneOrder = newSwimlaneOrder;
      newBoard.swimlaneOrder.forEach((id, index) => {
        if (newBoard.swimlanes[id]) newBoard.swimlanes[id].order = index;
      });
      return newBoard;
    });

    setDropTargetSwimlaneId(null); // Clear visual target after drop
    // setDraggingSwimlaneId(null); // Keep draggingSwimlaneId until dragEnd for consistent styling
  };

  const handleSwimlaneDragEnd = () => {
    setDraggingSwimlaneId(null);
    setDropTargetSwimlaneId(null);
  };


  // List D&D Handlers
  const handleListDragStart = (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => {
    const sourceSwimlane = board.swimlanes[sourceSwimlaneId];
    if (!sourceSwimlane) return;
    const sourceListIndex = sourceSwimlane.listIds.indexOf(listId);

    event.dataTransfer.setData("listId", listId);
    event.dataTransfer.setData("sourceSwimlaneId", sourceSwimlaneId);
    setDraggingListId(listId);
    setDraggedListInfo({ listId, sourceSwimlaneId, sourceListIndex });
    event.dataTransfer.effectAllowed = "move";
  };

  const handleListDragOver = (event: React.DragEvent<HTMLDivElement>, targetListId: string) => {
    event.preventDefault(); 
    event.stopPropagation();
    if (draggingListId && draggingListId !== targetListId) {
      setDropTargetListId(targetListId); 
    } else if (draggingListId && draggingListId === targetListId) {
      setDropTargetListId(null); // Clear if dragging over itself (no move)
    }
    event.dataTransfer.dropEffect = "move";
  };
  
  const handleSwimlaneAreaDragOverForList = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => {
    event.preventDefault(); 
    event.stopPropagation();
    if (draggingListId) {
        const targetSwimlane = board.swimlanes[targetSwimlaneId];
        if (targetSwimlane) { 
            // If there's no specific list being targeted (like an empty area), set target to end of swimlane.
            if (!dropTargetListId || !targetSwimlane.listIds.includes(dropTargetListId)) {
                 setDropTargetListId(`end-of-swimlane-${targetSwimlaneId}`);
            }
        }
    }
    event.dataTransfer.dropEffect = "move";
  };


  const handleListDropOnList = (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => {
    event.preventDefault();
    event.stopPropagation(); 
    const movedListId = event.dataTransfer.getData("listId") || draggingListId;
    const sourceSwimlaneId = event.dataTransfer.getData("sourceSwimlaneId") || draggedListInfo?.sourceSwimlaneId;

    if (!movedListId || !sourceSwimlaneId || movedListId === targetListId) {
      // setDraggingListId(null); // Handled by dragEnd
      // setDraggedListInfo(null);
      setDropTargetListId(null);
      return;
    }

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      const newSwimlanes = { ...newBoard.swimlanes };

      const sourceSwimlaneCopy = { ...newSwimlanes[sourceSwimlaneId] };
      sourceSwimlaneCopy.listIds = sourceSwimlaneCopy.listIds.filter(id => id !== movedListId);
      newSwimlanes[sourceSwimlaneId] = sourceSwimlaneCopy;

      const targetSwimlaneCopy = { ...newSwimlanes[targetSwimlaneId] };
      const targetIndex = targetSwimlaneCopy.listIds.indexOf(targetListId);
      if (targetIndex !== -1) {
        targetSwimlaneCopy.listIds.splice(targetIndex, 0, movedListId); 
      } else { 
        targetSwimlaneCopy.listIds.push(movedListId); 
      }
      newSwimlanes[targetSwimlaneId] = targetSwimlaneCopy;
      
      [sourceSwimlaneId, targetSwimlaneId].forEach(sId => {
        if (newSwimlanes[sId]) { 
            newSwimlanes[sId].listIds.forEach((lId, index) => {
            if (newBoard.lists[lId]) newBoard.lists[lId].order = index;
            });
        }
      });

      newBoard.swimlanes = newSwimlanes;
      return newBoard;
    });
    // setDraggingListId(null); // Handled by dragEnd
    // setDraggedListInfo(null);
    setDropTargetListId(null);
  };

  const handleListDropOnSwimlaneArea = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => {
    event.preventDefault();
    event.stopPropagation(); 
    const movedListId = event.dataTransfer.getData("listId") || draggingListId;
    const sourceSwimlaneId = event.dataTransfer.getData("sourceSwimlaneId") || draggedListInfo?.sourceSwimlaneId;
    
    if (!movedListId || !sourceSwimlaneId) return;

    // Prevent dropping a list onto its own swimlane area if it's the only list (no reorder possible)
    if (sourceSwimlaneId === targetSwimlaneId && board.swimlanes[sourceSwimlaneId].listIds.length <=1 && board.swimlanes[sourceSwimlaneId].listIds[0] === movedListId) {
      // setDraggingListId(null); // Handled by dragEnd
      // setDraggedListInfo(null);
      setDropTargetListId(null);
      return;
    }

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      const newSwimlanes = { ...newBoard.swimlanes };

      const sourceSwimlaneCopy = { ...newSwimlanes[sourceSwimlaneId] };
      sourceSwimlaneCopy.listIds = sourceSwimlaneCopy.listIds.filter(id => id !== movedListId);
      newSwimlanes[sourceSwimlaneId] = sourceSwimlaneCopy;

      const targetSwimlaneCopy = { ...newSwimlanes[targetSwimlaneId] };
      if (!targetSwimlaneCopy.listIds.includes(movedListId)) {
         targetSwimlaneCopy.listIds.push(movedListId); 
      }
      newSwimlanes[targetSwimlaneId] = targetSwimlaneCopy;

      [sourceSwimlaneId, targetSwimlaneId].forEach(sId => {
         if (newSwimlanes[sId]) { 
            newSwimlanes[sId].listIds.forEach((lId, index) => {
            if (newBoard.lists[lId]) newBoard.lists[lId].order = index;
            });
        }
      });
      
      newBoard.swimlanes = newSwimlanes;
      return newBoard;
    });
    // setDraggingListId(null); // Handled by dragEnd
    // setDraggedListInfo(null);
    setDropTargetListId(null);
  };

  const handleListDragEnd = () => {
    setDraggingListId(null);
    setDraggedListInfo(null);
    setDropTargetListId(null);
  };


  const handleRankTasks = async () => {
    let todoListId: string | undefined;
    let todoList: ListType | undefined;

    for (const swimlaneId of board.swimlaneOrder) {
        const swimlane = board.swimlanes[swimlaneId];
        if (!swimlane) continue;
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
    const finalTodoListId = todoListId; 

    setIsRanking(true);
    try {
      const tasksToRank: RankTasksInput["tasks"] = todoList.taskIds
        .map(taskId => board.tasks[taskId])
        .filter(task => task) 
        .map(task => ({
          id: task.id,
          description: task.description || task.title, 
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
        const targetList = newLists[finalTodoListId]; 
        if (!targetList) return prevBoard; 

        const currentTodoTaskIds = [...targetList.taskIds];
        const rankMap = new Map(rankedResults.map(r => [r.id, r.rank]));
        
        const newOrderedTaskIds = [...currentTodoTaskIds].sort((aId, bId) => {
            const rankA = rankMap.get(aId);
            const rankB = rankMap.get(bId);
            if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
            if (rankA !== undefined) return -1; 
            if (rankB !== undefined) return 1;  
            return 0; 
        });
        
        newLists[finalTodoListId] = { ...targetList, taskIds: newOrderedTaskIds };
        
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
        onAddSwimlane={handleAddSwimlaneToEnd} 
        isRanking={isRanking}
      />
      <div 
        className="flex-1 flex flex-col gap-6 overflow-y-auto overflow-x-hidden p-1" 
        onDragOver={handleBoardAreaDragOver} 
        onDrop={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            if (draggingSwimlaneId && dropTargetSwimlaneId === "end-of-board") { 
                handleSwimlaneDrop(e); 
            }
        }}
      >
        {board.swimlaneOrder.map((swimlaneId) => {
          const swimlane = board.swimlanes[swimlaneId];
          if (!swimlane) return null;
          
          const listsInSwimlane = swimlane.listIds
            .map(listId => board.lists[listId])
            .filter(Boolean) as ListType[]; 
          
          listsInSwimlane.sort((a, b) => a.order - b.order);

          return (
            <React.Fragment key={swimlane.id}>
              {draggingSwimlaneId && draggingSwimlaneId !== swimlaneId && dropTargetSwimlaneId === swimlaneId && (
                <div
                  className="h-16 bg-white border-2 border-black border-dashed rounded-lg my-2" 
                  onDragOver={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    e.dataTransfer.dropEffect = "move"; 
                    if (draggingSwimlaneId) setDropTargetSwimlaneId(swimlaneId); 
                  }}
                  onDrop={(e) => handleSwimlaneDrop(e, swimlaneId)}
                  // onDragLeave={() => setDropTargetSwimlaneId(null)} // Removed to stabilize target
                />
              )}
              <KanbanSwimlane // Changed from Swimlane to KanbanSwimlane
                swimlane={swimlane}
                lists={listsInSwimlane}
                tasks={board.tasks}
                onOpenCreateTaskForm={handleOpenCreateTaskForm}
                
                onDropTask={handleDropTask}
                onDragTaskStart={handleDragTaskStart}
                onDragTaskEnd={handleDragTaskEnd}
                draggingTaskId={draggingTaskId}
                dropIndicator={dropIndicator}
                onTaskDragOverList={handleTaskDragOverList}

                onDeleteSwimlane={handleDeleteSwimlane}
                onOpenCard={handleOpenCard}
                onSetSwimlaneColor={handleSetSwimlaneColor}
                onSetListColor={handleSetListColor}
                onSetTaskColor={handleSetTaskColor}
                
                onAddSwimlaneBelow={handleAddSwimlaneBelow}
                onAddSwimlaneFromTemplate={handleAddSwimlaneFromTemplate}

                onSwimlaneDragStart={handleSwimlaneDragStart}
                onSwimlaneDragEnd={handleSwimlaneDragEnd}
                onSwimlaneDragOver={handleSwimlaneDragOver} 
                draggingSwimlaneId={draggingSwimlaneId}
                // dropTargetSwimlaneId={dropTargetSwimlaneId} // Not needed by KanbanSwimlane directly for its own rendering
                
                onListDragStart={handleListDragStart}
                onListDropOnList={handleListDropOnList}
                onListDropOnSwimlaneArea={handleListDropOnSwimlaneArea}
                onListDragEnd={handleListDragEnd}
                draggingListId={draggingListId}
                dropTargetListId={dropTargetListId}
                onListDragOver={handleListDragOver}
                onSwimlaneAreaDragOverForList={handleSwimlaneAreaDragOverForList}
              />
            </React.Fragment>
          );
        })}
        {draggingSwimlaneId && dropTargetSwimlaneId === "end-of-board" && (
            <div
                className="h-16 bg-white border-2 border-black border-dashed rounded-lg my-2" 
                onDragOver={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "move"; 
                    if (draggingSwimlaneId) setDropTargetSwimlaneId("end-of-board"); 
                }}
                onDrop={(e) => handleSwimlaneDrop(e)}
                // onDragLeave={() => setDropTargetSwimlaneId(null)} // Removed to stabilize target
            />
        )}
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
