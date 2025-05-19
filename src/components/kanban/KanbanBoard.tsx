
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
import { cn } from "@/lib/utils";

// Initial hardcoded data with swimlanes
const initialBoardData: BoardType = {
  id: "board-1",
  name: "KanbanAI Project",
  tasks: {
    "task-1": { id: "task-1", title: "Setup project structure", description: "Initialize Next.js app, install dependencies.", deadline: "2024-08-01", order: 0, color: "#FFFFFF" },
    "task-2": { id: "task-2", title: "Design UI components", description: "Create TaskCard, KanbanList, KanbanBoard components.", deadline: "2024-08-05", order: 0, color: "#FFFFFF" },
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
  const [draggingListId, setDraggingListId] = useState<string | null>(null);
  const [draggedListInfo, setDraggedListInfo] = useState<{ listId: string; sourceSwimlaneId: string; sourceListIndex: number } | null>(null);
  const [dropTargetListId, setDropTargetListId] = useState<string | null>(null); // For list drop indicator
  const [draggingSwimlaneId, setDraggingSwimlaneId] = useState<string | null>(null);
  const [dropTargetSwimlaneId, setDropTargetSwimlaneId] = useState<string | null>(null); // For swimlane drop indicator


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

  const handleAddSwimlane = () => {
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
      event.dataTransfer.setData("sourceListId", sourceListId);
      setDraggingTaskId(taskId);
      setDraggedTaskInfo({taskId, sourceListId: sourceListId});
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragTaskEnd = () => {
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
  };

  const handleDropTask = (event: React.DragEvent<HTMLDivElement>, currentTargetListId: string, currentTargetTaskId?: string) => {
    event.preventDefault();
    if (!draggedTaskInfo) return;
  
    const { taskId: movedTaskId, sourceListId: currentSourceListId } = draggedTaskInfo;
  
    setBoard(prevBoard => {
      const newBoardState = { ...prevBoard };
      const newListsState = { ...newBoardState.lists };
  
      const sourceListTaskIdsCopy = [...newListsState[currentSourceListId].taskIds];
      const taskIndexInSource = sourceListTaskIdsCopy.indexOf(movedTaskId);
  
      if (taskIndexInSource === -1) return prevBoard;
  
      sourceListTaskIdsCopy.splice(taskIndexInSource, 1);
  
      let finalTaskIdsForTargetList;
  
      if (currentSourceListId === currentTargetListId) {
        finalTaskIdsForTargetList = [...sourceListTaskIdsCopy];
        const insertAtIndex = currentTargetTaskId ? finalTaskIdsForTargetList.indexOf(currentTargetTaskId) : -1;
        if (insertAtIndex > -1) {
          finalTaskIdsForTargetList.splice(insertAtIndex, 0, movedTaskId);
        } else {
          finalTaskIdsForTargetList.push(movedTaskId);
        }
        newListsState[currentTargetListId] = { ...newListsState[currentTargetListId], taskIds: finalTaskIdsForTargetList };
      } else {
        newListsState[currentSourceListId] = { ...newListsState[currentSourceListId], taskIds: sourceListTaskIdsCopy };
        finalTaskIdsForTargetList = [...newListsState[currentTargetListId].taskIds];
        const insertAtIndex = currentTargetTaskId ? finalTaskIdsForTargetList.indexOf(currentTargetTaskId) : -1;
        if (insertAtIndex > -1) {
          finalTaskIdsForTargetList.splice(insertAtIndex, 0, movedTaskId);
        } else {
          finalTaskIdsForTargetList.push(movedTaskId);
        }
        newListsState[currentTargetListId] = { ...newListsState[currentTargetListId], taskIds: finalTaskIdsForTargetList };
      }
  
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
  
    setDraggingTaskId(null);
    setDraggedTaskInfo(null);
  };
  
  // Swimlane D&D Handlers
  const handleSwimlaneDragStart = (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => {
    event.dataTransfer.setData("swimlaneId", swimlaneId);
    setDraggingSwimlaneId(swimlaneId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSwimlaneDragOver = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => {
    event.preventDefault();
    if (draggingSwimlaneId && draggingSwimlaneId !== targetSwimlaneId) {
      setDropTargetSwimlaneId(targetSwimlaneId); // Visual cue for dropping before this swimlane
    }
    event.dataTransfer.dropEffect = "move";
  };
  
  const handleBoardAreaDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggingSwimlaneId) {
        setDropTargetSwimlaneId("end-of-board"); // Visual cue for dropping at the end
    }
    event.dataTransfer.dropEffect = "move";
  };

  const handleSwimlaneDrop = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId?: string) => { // targetSwimlaneId is optional for end-of-board drop
    event.preventDefault();
    const movedSwimlaneId = event.dataTransfer.getData("swimlaneId");

    if (!movedSwimlaneId || (targetSwimlaneId && movedSwimlaneId === targetSwimlaneId)) {
      setDropTargetSwimlaneId(null);
      setDraggingSwimlaneId(null);
      return;
    }

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      let newSwimlaneOrder = [...newBoard.swimlaneOrder];
      
      const sourceIndex = newSwimlaneOrder.indexOf(movedSwimlaneId);
      if (sourceIndex === -1) return prevBoard; // Should not happen

      newSwimlaneOrder.splice(sourceIndex, 1); // Remove from old position

      if (targetSwimlaneId && targetSwimlaneId !== "end-of-board") {
        const targetIndex = newSwimlaneOrder.indexOf(targetSwimlaneId);
        newSwimlaneOrder.splice(targetIndex, 0, movedSwimlaneId); // Insert before target
      } else {
        newSwimlaneOrder.push(movedSwimlaneId); // Insert at the end
      }
      
      newBoard.swimlaneOrder = newSwimlaneOrder;
      newBoard.swimlaneOrder.forEach((id, index) => {
        if (newBoard.swimlanes[id]) newBoard.swimlanes[id].order = index;
      });
      return newBoard;
    });

    setDraggingSwimlaneId(null);
    setDropTargetSwimlaneId(null);
  };

  const handleSwimlaneDragEnd = () => {
    setDraggingSwimlaneId(null);
    setDropTargetSwimlaneId(null);
  };


  // List D&D Handlers
  const handleListDragStart = (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => {
    const sourceSwimlane = board.swimlanes[sourceSwimlaneId];
    const sourceListIndex = sourceSwimlane.listIds.indexOf(listId);

    event.dataTransfer.setData("listId", listId);
    event.dataTransfer.setData("sourceSwimlaneId", sourceSwimlaneId);
    setDraggingListId(listId);
    setDraggedListInfo({ listId, sourceSwimlaneId, sourceListIndex });
    event.dataTransfer.effectAllowed = "move";
  };

  const handleListDragOver = (event: React.DragEvent<HTMLDivElement>, targetListId: string) => {
    event.preventDefault();
    if (draggingListId && draggingListId !== targetListId) {
      setDropTargetListId(targetListId); // Visual cue for dropping before this list
    } else if (draggingListId && draggingListId === targetListId) {
      setDropTargetListId(null); // Don't show indicator if hovering over itself
    }
    event.dataTransfer.dropEffect = "move";
  };
  
  const handleSwimlaneAreaDragOverForList = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => {
    event.preventDefault();
    if (draggingListId) {
        const targetSwimlane = board.swimlanes[targetSwimlaneId];
        // If target swimlane has no lists, or if we are over the general area (not a specific list)
        // We can indicate dropping at the end of this swimlane.
        if (targetSwimlane && targetSwimlane.listIds.length === 0) {
             setDropTargetListId(`end-of-swimlane-${targetSwimlaneId}`);
        } else if (targetSwimlane && !dropTargetListId?.startsWith('between-') && dropTargetListId !== targetSwimlaneId) {
            // This condition tries to default to end of swimlane if not over another list
            // It might need refinement based on exact DOM structure for dragOver events on list container vs lists
            setDropTargetListId(`end-of-swimlane-${targetSwimlaneId}`);
        }
    }
    event.dataTransfer.dropEffect = "move";
  };


  const handleListDropOnList = (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!draggedListInfo || draggedListInfo.listId === targetListId) {
      setDropTargetListId(null);
      return;
    }

    const { listId: movedListId, sourceSwimlaneId } = draggedListInfo;

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      const newSwimlanes = { ...newBoard.swimlanes };

      // Remove from source swimlane
      const sourceSwimlane = { ...newSwimlanes[sourceSwimlaneId] };
      sourceSwimlane.listIds = sourceSwimlane.listIds.filter(id => id !== movedListId);
      newSwimlanes[sourceSwimlaneId] = sourceSwimlane;

      // Add to target swimlane
      const targetSwimlane = { ...newSwimlanes[targetSwimlaneId] };
      const targetIndex = targetSwimlane.listIds.indexOf(targetListId);
      if (targetIndex !== -1) {
        targetSwimlane.listIds.splice(targetIndex, 0, movedListId);
      } else { // Should not happen if targetListId is valid
        targetSwimlane.listIds.push(movedListId);
      }
      newSwimlanes[targetSwimlaneId] = targetSwimlane;
      
      // Update list orders in both swimlanes
      [sourceSwimlaneId, targetSwimlaneId].forEach(sId => {
        newSwimlanes[sId].listIds.forEach((lId, index) => {
          if (newBoard.lists[lId]) newBoard.lists[lId].order = index;
        });
      });

      newBoard.swimlanes = newSwimlanes;
      return newBoard;
    });
    setDraggingListId(null);
    setDraggedListInfo(null);
    setDropTargetListId(null);
  };

  const handleListDropOnSwimlaneArea = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!draggedListInfo) return;

    const { listId: movedListId, sourceSwimlaneId } = draggedListInfo;

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      const newSwimlanes = { ...newBoard.swimlanes };

      // Remove from source swimlane
      const sourceSwimlane = { ...newSwimlanes[sourceSwimlaneId] };
      sourceSwimlane.listIds = sourceSwimlane.listIds.filter(id => id !== movedListId);
      newSwimlanes[sourceSwimlaneId] = sourceSwimlane;

      // Add to end of target swimlane
      const targetSwimlane = { ...newSwimlanes[targetSwimlaneId] };
      targetSwimlane.listIds.push(movedListId);
      newSwimlanes[targetSwimlaneId] = targetSwimlane;

      // Update list orders
      [sourceSwimlaneId, targetSwimlaneId].forEach(sId => {
        newSwimlanes[sId].listIds.forEach((lId, index) => {
          if (newBoard.lists[lId]) newBoard.lists[lId].order = index;
        });
      });
      
      newBoard.swimlanes = newSwimlanes;
      return newBoard;
    });
    setDraggingListId(null);
    setDraggedListInfo(null);
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
        onAddSwimlane={handleAddSwimlane}
        isRanking={isRanking}
      />
      <div 
        className="flex-1 flex flex-col gap-6 overflow-y-auto overflow-x-hidden p-1"
        onDragOver={handleBoardAreaDragOver} // For dropping swimlanes at the end of the board
        onDrop={(e) => handleSwimlaneDrop(e)} // No targetSwimlaneId means end of board
      >
        {board.swimlaneOrder.map((swimlaneId, index) => {
          const swimlane = board.swimlanes[swimlaneId];
          if (!swimlane) return null;
          
          const listsInSwimlane = swimlane.listIds
            .map(listId => board.lists[listId])
            .filter(Boolean) as ListType[]; 
          
          listsInSwimlane.sort((a, b) => a.order - b.order);

          return (
            // This div acts as the drop target *before* the current swimlane
            <div
              key={`swimlane-dropzone-${swimlaneId}`}
              onDragOver={(e) => handleSwimlaneDragOver(e, swimlaneId)}
              // onDrop is handled by the child KanbanSwimlane's main div for precise targeting or by the board area for end-of-board.
              // This specific div is more for the visual indicator when dragging *over* where a swimlane *would* go.
              className={cn(
                "p-0 rounded-lg", // Minimal padding for the drop zone visual
                 // dropTargetSwimlaneId === swimlaneId handles dropping *before* this swimlane
                dropTargetSwimlaneId === swimlaneId && draggingSwimlaneId && draggingSwimlaneId !== swimlaneId ? "pt-2" : "" 
              )}
            >
              <KanbanSwimlane
                key={swimlane.id}
                swimlane={swimlane}
                lists={listsInSwimlane}
                tasks={board.tasks}
                onOpenCreateTaskForm={handleOpenCreateTaskForm}
                onDropTask={handleDropTask}
                onDragTaskStart={handleDragTaskStart}
                onDragTaskEnd={handleDragTaskEnd}
                draggingTaskId={draggingTaskId}
                onDeleteSwimlane={handleDeleteSwimlane}
                onOpenCard={handleOpenCard}
                onSetSwimlaneColor={handleSetSwimlaneColor}
                onSetListColor={handleSetListColor}
                onSetTaskColor={handleSetTaskColor}
                // Swimlane D&D
                onSwimlaneDragStart={handleSwimlaneDragStart}
                onSwimlaneDrop={handleSwimlaneDrop} // Pass this for dropping onto a swimlane
                onSwimlaneDragEnd={handleSwimlaneDragEnd}
                draggingSwimlaneId={draggingSwimlaneId}
                dropTargetSwimlaneId={dropTargetSwimlaneId}
                // List D&D
                onListDragStart={handleListDragStart}
                onListDropOnList={handleListDropOnList}
                onListDropOnSwimlaneArea={handleListDropOnSwimlaneArea}
                onListDragEnd={handleListDragEnd}
                draggingListId={draggingListId}
                dropTargetListId={dropTargetListId}
              />
            </div>
          );
        })}
         {/* Visual indicator for dropping a swimlane at the very end of the board */}
        {dropTargetSwimlaneId === "end-of-board" && draggingSwimlaneId && (
            <div className="h-12 border-2 border-dashed border-primary rounded-lg flex items-center justify-center text-primary my-2">
                Drop swimlane here
            </div>
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
