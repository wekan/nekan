
"use client";

import type { Board as BoardType, List as ListType, Card as CardType, Swimlane as SwimlaneType } from "@/lib/types"; // Updated CardType
import { KanbanSwimlane } from "./KanbanSwimlane"; 
import { CreateCardForm } from "./CreateCardForm"; // Renamed
import { ShareBoardDialog } from "./ShareBoardDialog";
import { BoardHeader } from "./BoardHeader";
import React, { useState, useEffect } from "react";
import { rankCards, RankCardsInput } from "@/ai/flows/rank-cards"; // Renamed
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AddSwimlaneDialog } from "./AddSwimlaneDialog"; 

const initialBoardData: BoardType = {
  id: "board-1",
  name: "KanbanAI Project",
  cards: { // Renamed from tasks
    "card-1": { id: "card-1", title: "Setup project structure", description: "Initialize Next.js app, install dependencies.", deadline: "2024-08-01", order: 0, color: "#FFFFFF" },
    "card-2": { id: "card-2", title: "Design UI components", description: "Create Card, List, Swimlane components.", deadline: "2024-08-05", order: 0, color: "#FFFFFF" },
    "card-3": { id: "card-3", title: "Implement drag and drop for cards", description: "Allow cards to be moved between lists.", deadline: "2024-08-10", order: 0, color: "#FFFFFF" },
    "card-4": { id: "card-4", title: "Integrate AI card ranker", description: "Connect to GenAI flow for card prioritization.", deadline: "2024-08-15", order: 1, color: "#FFFFFF" },
    "card-5": { id: "card-5", title: "Add share board feature (mock)", description: "Implement UI for sharing boards.", deadline: "2024-08-20", order: 0, color: "#FFF5E1" },
    "card-6": { id: "card-6", title: "Write documentation", description: "Document components and features.", deadline: "2024-08-25", order: 2, color: "#FFFFFF" },
  },
  lists: {
    "list-1": { id: "list-1", title: "Backlog", cardIds: ["card-5"], order: 0, color: "#F3F4F6" }, // Renamed taskIds
    "list-2": { id: "list-2", title: "To Do", cardIds: ["card-3", "card-4", "card-6"], order: 0, color: "#FFFFFF" }, // Renamed taskIds
    "list-3": { id: "list-3", title: "In Progress", cardIds: ["card-2"], order: 1, color: "#FFFFFF" }, // Renamed taskIds
    "list-4": { id: "list-4", title: "Done", cardIds: ["card-1"], order: 2, color: "#E0F2FE" }, // Renamed taskIds
  },
  swimlanes: {
    "swim-1": { id: "swim-1", name: "Core Features", listIds: ["list-2", "list-3"], order: 0, color: "#E0E7FF" },
    "swim-2": { id: "swim-2", name: "Support & Docs", listIds: ["list-1", "list-4"], order: 1, color: "#FEF3C7" },
  },
  swimlaneOrder: ["swim-1", "swim-2"],
};


export function KanbanBoard() {
  const [board, setBoard] = useState<BoardType>(initialBoardData);
  const [isCreateCardFormOpen, setCreateCardFormOpen] = useState(false); // Renamed
  const [selectedListIdForNewCard, setSelectedListIdForNewCard] = useState<string | null>(null); // Renamed
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const { toast } = useToast();

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null); // Renamed
  const [draggedCardInfo, setDraggedCardInfo] = useState<{cardId: string, sourceListId: string} | null>(null); // Renamed
  const [dropIndicator, setDropIndicator] = useState<{ listId: string; beforeCardId: string | null } | null>(null); // Renamed beforeTaskId
  
  const [draggingListId, setDraggingListId] = useState<string | null>(null);
  const [draggedListInfo, setDraggedListInfo] = useState<{ listId: string; sourceSwimlaneId: string; sourceListIndex: number } | null>(null);
  const [dropTargetListId, setDropTargetListId] = useState<string | null>(null); 
  
  const [draggingSwimlaneId, setDraggingSwimlaneId] = useState<string | null>(null);
  const [dropTargetSwimlaneId, setDropTargetSwimlaneId] = useState<string | null>(null);


  const handleOpenCreateCardForm = (listId: string) => { // Renamed
    setSelectedListIdForNewCard(listId);
    setCreateCardFormOpen(true);
  };

  const handleCreateCard = (values: { title: string; description?: string; deadline?: Date }) => { // Renamed
    if (!selectedListIdForNewCard) return;

    const newCardId = `card-${Date.now()}`; // Renamed
    const targetList = board.lists[selectedListIdForNewCard];
    const newCardOrder = targetList ? targetList.cardIds.length : 0; // Renamed cardIds

    const newCard: CardType = { // Renamed
      id: newCardId,
      title: values.title,
      description: values.description,
      deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : undefined,
      order: newCardOrder,
      color: "#FFFFFF", 
    };

    setBoard(prevBoard => {
      const newCards = { ...prevBoard.cards, [newCardId]: newCard }; // Renamed
      const newLists = { ...prevBoard.lists };
      if (newLists[selectedListIdForNewCard]) {
        newLists[selectedListIdForNewCard] = {
          ...newLists[selectedListIdForNewCard],
          cardIds: [...newLists[selectedListIdForNewCard].cardIds, newCardId], // Renamed cardIds
        };
      }
      return { ...prevBoard, cards: newCards, lists: newLists }; // Renamed
    });

    toast({ title: "Card Created", description: `"${newCard.title}" added to list "${board.lists[selectedListIdForNewCard]?.title}".` });
  };

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
      const newBoardSwimlanes = { ...prevBoard.swimlanes, [newSwimlaneId]: newSwimlane };
      let newSwimlaneOrder = [...prevBoard.swimlaneOrder];
      const referenceIndex = newSwimlaneOrder.indexOf(referenceSwimlaneId);

      if (referenceIndex === -1) { 
        newSwimlaneOrder.push(newSwimlaneId);
      } else {
        newSwimlaneOrder.splice(referenceIndex + 1, 0, newSwimlaneId);
      }
      
      newSwimlaneOrder.forEach((sId, index) => {
        if (newBoardSwimlanes[sId]) {
          newBoardSwimlanes[sId].order = index;
        }
      });
      
      return {
        ...prevBoard,
        swimlanes: newBoardSwimlanes,
        swimlaneOrder: newSwimlaneOrder,
      };
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
      const swimlaneToDelete = prevBoard.swimlanes[swimlaneId];
      if (!swimlaneToDelete) return prevBoard;

      const newCards = { ...prevBoard.cards }; // Renamed
      const newLists = { ...prevBoard.lists };
      swimlaneToDelete.listIds.forEach(listId => {
        const list = newLists[listId];
        if (list) {
          list.cardIds.forEach(cardId => { // Renamed
            delete newCards[cardId]; // Renamed
          });
        }
        delete newLists[listId];
      });
      
      const newSwimlanes = { ...prevBoard.swimlanes };
      delete newSwimlanes[swimlaneId];
      
      let newSwimlaneOrder = prevBoard.swimlaneOrder.filter(id => id !== swimlaneId);
      
      newSwimlaneOrder.forEach((sId, index) => {
        if (newSwimlanes[sId]) {
          newSwimlanes[sId].order = index;
        }
      });

      return {
        ...prevBoard,
        cards: newCards, // Renamed
        lists: newLists,
        swimlanes: newSwimlanes,
        swimlaneOrder: newSwimlaneOrder,
      };
    });
    toast({ title: "Swimlane Deleted", description: `Swimlane and its contents have been deleted.` });
  };
  
  const handleOpenCard = (cardId: string) => { // Renamed
    const card = board.cards[cardId]; // Renamed
    if (card) {
      toast({
        title: `Card Clicked: ${card.title}`,
        description: `ID: ${cardId}. Details: ${card.description || 'No description'}. Deadline: ${card.deadline || 'None'}`,
      });
    }
  };

  const handleDragCardStart = (event: React.DragEvent<HTMLDivElement>, cardId: string) => { // Renamed
    let sourceListId: string | undefined;
    for (const swimlaneId of board.swimlaneOrder) {
        const swimlane = board.swimlanes[swimlaneId];
        if (swimlane) {
            for (const listId of swimlane.listIds) {
                if (board.lists[listId]?.cardIds.includes(cardId)) { // Renamed
                    sourceListId = listId;
                    break;
                }
            }
        }
        if (sourceListId) break;
    }
  
    if (sourceListId) {
      event.dataTransfer.setData("cardId", cardId); // Renamed
      event.dataTransfer.setData("sourceListId", sourceListId); 
      setDraggingCardId(cardId); // Renamed
      setDraggedCardInfo({ cardId, sourceListId }); // Renamed
      event.dataTransfer.effectAllowed = "move";
    }
  };
  

  const handleDragCardEnd = () => { // Renamed
    setDraggingCardId(null); // Renamed
    setDraggedCardInfo(null); // Renamed
    setDropIndicator(null);
  };

  const handleDropCard = (event: React.DragEvent<HTMLDivElement>, currentTargetListId: string, currentTargetCardId?: string) => { // Renamed
    event.preventDefault();
    event.stopPropagation();
    if (!draggedCardInfo) return; 
  
    const { cardId: movedCardId, sourceListId: currentSourceListId } = draggedCardInfo; // Renamed
  
    setBoard(prevBoard => {
      const newBoardState = { ...prevBoard };
      const newListsState = { ...newBoardState.lists };
      const newCardsState = { ...newBoardState.cards }; // Renamed
  
      let sourceListCardIdsCopy = [...newListsState[currentSourceListId].cardIds]; // Renamed
      
      if (currentSourceListId === currentTargetListId) {
        const cardIndexInSource = sourceListCardIdsCopy.indexOf(movedCardId);
        if (cardIndexInSource > -1) {
          sourceListCardIdsCopy.splice(cardIndexInSource, 1);
        }
      } else {
        const cardIndexInSource = sourceListCardIdsCopy.indexOf(movedCardId);
        if (cardIndexInSource > -1) {
          sourceListCardIdsCopy.splice(cardIndexInSource, 1);
        }
        newListsState[currentSourceListId] = { ...newListsState[currentSourceListId], cardIds: sourceListCardIdsCopy }; // Renamed
      }
      
      let finalCardIdsForTargetList = (currentSourceListId === currentTargetListId)
        ? sourceListCardIdsCopy
        : (newListsState[currentTargetListId] ? [...newListsState[currentTargetListId].cardIds] : []); // Renamed

      const cardIndexInTargetPreInsert = finalCardIdsForTargetList.indexOf(movedCardId);
      if (cardIndexInTargetPreInsert > -1) {
         finalCardIdsForTargetList.splice(cardIndexInTargetPreInsert, 1);
      }

      const insertAtIndex = currentTargetCardId ? finalCardIdsForTargetList.indexOf(currentTargetCardId) : -1;
      if (insertAtIndex > -1) {
        finalCardIdsForTargetList.splice(insertAtIndex, 0, movedCardId);
      } else {
        finalCardIdsForTargetList.push(movedCardId); 
      }
      newListsState[currentTargetListId] = { ...newListsState[currentTargetListId], cardIds: finalCardIdsForTargetList }; // Renamed
      
      const affectedListIds = new Set([currentSourceListId, currentTargetListId]);
      affectedListIds.forEach(listId => {
        const list = newListsState[listId];
        if (list) {
          list.cardIds.forEach((cId, index) => { // Renamed
            if (newCardsState[cId]) {
              newCardsState[cId] = { ...newCardsState[cId], order: index };
            }
          });
        }
      });
      
      return { ...newBoardState, lists: newListsState, cards: newCardsState }; // Renamed
    });
  
    setDropIndicator(null); 
  };

  const handleCardDragOverList = (event: React.DragEvent, targetListId: string, targetCardId?: string | null) => { // Renamed
    event.preventDefault();
    event.stopPropagation();
    if (draggingCardId) { // Renamed
      setDropIndicator({ listId: targetListId, beforeCardId: targetCardId || null }); // Renamed
      event.dataTransfer.dropEffect = "move";
    }
  };
  
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
        // This case might be too broad, specific swimlane area drag over is better.
    }
    event.dataTransfer.dropEffect = "move";
  };

  const handleSwimlaneDrop = (event: React.DragEvent<HTMLDivElement>, beforeSwimlaneId?: string) => { 
    event.preventDefault();
    event.stopPropagation();
    const movedSwimlaneId = event.dataTransfer.getData("swimlaneId") || draggingSwimlaneId;

    if (!movedSwimlaneId || (beforeSwimlaneId && movedSwimlaneId === beforeSwimlaneId)) {
      setDropTargetSwimlaneId(null);
      return;
    }

    setBoard(prevBoard => {
      const newBoardSwimlanes = { ...prevBoard.swimlanes };
      let newSwimlaneOrder = [...prevBoard.swimlaneOrder];
      
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
      
      newSwimlaneOrder.forEach((id, index) => {
        if (newBoardSwimlanes[id]) newBoardSwimlanes[id].order = index;
      });

      return { ...prevBoard, swimlanes: newBoardSwimlanes, swimlaneOrder: newSwimlaneOrder };
    });

    setDropTargetSwimlaneId(null);
    setDraggingSwimlaneId(null); // Also reset draggingSwimlaneId here
  };

  const handleSwimlaneDragEnd = () => {
    setDraggingSwimlaneId(null);
    setDropTargetSwimlaneId(null);
  };

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
      setDropTargetListId(null); 
    }
    event.dataTransfer.dropEffect = "move";
  };
  
  const handleSwimlaneAreaDragOverForList = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => {
    event.preventDefault(); 
    event.stopPropagation();
    if (draggingListId) {
      setDropTargetListId(`end-of-swimlane-${targetSwimlaneId}`);
    }
    event.dataTransfer.dropEffect = "move";
  };


  const handleListDropOnList = (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => {
    event.preventDefault();
    event.stopPropagation(); 
    const movedListId = event.dataTransfer.getData("listId") || draggingListId;
    const sourceSwimlaneId = event.dataTransfer.getData("sourceSwimlaneId") || draggedListInfo?.sourceSwimlaneId;

    if (!movedListId || !sourceSwimlaneId || movedListId === targetListId) {
      setDropTargetListId(null);
      return;
    }

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      let newSwimlanes = { ...newBoard.swimlanes };
      let newListsData = { ...newBoard.lists }; 

      if (!newSwimlanes[sourceSwimlaneId] || !newSwimlanes[targetSwimlaneId]) return prevBoard;

      let sourceListIdsCopy = [...newSwimlanes[sourceSwimlaneId].listIds];
      let targetListIdsEffectiveCopy;

      const indexInSource = sourceListIdsCopy.indexOf(movedListId);
      if (indexInSource > -1) {
        sourceListIdsCopy.splice(indexInSource, 1);
      }

      if (sourceSwimlaneId === targetSwimlaneId) {
        targetListIdsEffectiveCopy = [...sourceListIdsCopy]; 
      } else {
        targetListIdsEffectiveCopy = [...newSwimlanes[targetSwimlaneId].listIds];
      }
      
      const existingIndexInTarget = targetListIdsEffectiveCopy.indexOf(movedListId);
      if (existingIndexInTarget > -1) {
          targetListIdsEffectiveCopy.splice(existingIndexInTarget, 1);
      }
      
      const targetIndex = targetListIdsEffectiveCopy.indexOf(targetListId); 
      if (targetIndex !== -1) {
        targetListIdsEffectiveCopy.splice(targetIndex, 0, movedListId);
      } else {
        targetListIdsEffectiveCopy.push(movedListId); 
      }

      newSwimlanes[sourceSwimlaneId] = {
        ...newSwimlanes[sourceSwimlaneId],
        listIds: (sourceSwimlaneId === targetSwimlaneId) ? targetListIdsEffectiveCopy : sourceListIdsCopy
      };
      if (sourceSwimlaneId !== targetSwimlaneId) {
        newSwimlanes[targetSwimlaneId] = {
          ...newSwimlanes[targetSwimlaneId],
          listIds: targetListIdsEffectiveCopy
        };
      }
      
      const affectedSwimlaneIds = new Set([sourceSwimlaneId, targetSwimlaneId]);
      affectedSwimlaneIds.forEach(sId => {
        const swimlane = newSwimlanes[sId];
        if (swimlane && swimlane.listIds) {
          swimlane.listIds.forEach((lId, index) => {
            if (newListsData[lId]) {
              newListsData[lId] = { ...newListsData[lId], order: index };
            }
          });
        }
      });

      return { ...newBoard, swimlanes: newSwimlanes, lists: newListsData };
    });
    setDropTargetListId(null);
    setDraggingListId(null); 
    setDraggedListInfo(null); 
  };

  const handleListDropOnSwimlaneArea = (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => {
    event.preventDefault();
    event.stopPropagation(); 
    const movedListId = event.dataTransfer.getData("listId") || draggingListId;
    const sourceSwimlaneId = event.dataTransfer.getData("sourceSwimlaneId") || draggedListInfo?.sourceSwimlaneId;
    
    if (!movedListId || !sourceSwimlaneId) {
        setDropTargetListId(null);
        return;
    }
        
    if (sourceSwimlaneId === targetSwimlaneId && 
        board.swimlanes[sourceSwimlaneId].listIds.length <=1 && 
        board.swimlanes[sourceSwimlaneId].listIds[0] === movedListId) {
      setDropTargetListId(null);
      return;
    }

    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      let newSwimlanes = { ...newBoard.swimlanes };
      let newListsData = { ...newBoard.lists }; 

      if (!newSwimlanes[sourceSwimlaneId] || !newSwimlanes[targetSwimlaneId]) return prevBoard;

      let sourceListIdsCopy = [...newSwimlanes[sourceSwimlaneId].listIds];
      let targetListIdsEffectiveCopy;
      
      const indexInSource = sourceListIdsCopy.indexOf(movedListId);
      if (indexInSource > -1) {
        sourceListIdsCopy.splice(indexInSource, 1);
      }

      if (sourceSwimlaneId === targetSwimlaneId) {
        targetListIdsEffectiveCopy = [...sourceListIdsCopy]; 
      } else {
        targetListIdsEffectiveCopy = [...newSwimlanes[targetSwimlaneId].listIds];
      }
      
      const existingIndexInTarget = targetListIdsEffectiveCopy.indexOf(movedListId);
      if (existingIndexInTarget > -1) {
          targetListIdsEffectiveCopy.splice(existingIndexInTarget, 1);
      }
      targetListIdsEffectiveCopy.push(movedListId); 
      
      newSwimlanes[sourceSwimlaneId] = {
        ...newSwimlanes[sourceSwimlaneId],
        listIds: (sourceSwimlaneId === targetSwimlaneId) ? targetListIdsEffectiveCopy : sourceListIdsCopy
      };
      if (sourceSwimlaneId !== targetSwimlaneId) {
        newSwimlanes[targetSwimlaneId] = {
          ...newSwimlanes[targetSwimlaneId],
          listIds: targetListIdsEffectiveCopy
        };
      }
      
      const affectedSwimlaneIds = new Set([sourceSwimlaneId, targetSwimlaneId]);
      affectedSwimlaneIds.forEach(sId => {
         const swimlane = newSwimlanes[sId];
         if (swimlane && swimlane.listIds) { 
            swimlane.listIds.forEach((lId, index) => {
                if (newListsData[lId]) newListsData[lId] = { ...newListsData[lId], order: index };
            });
        }
      });
      
      return { ...newBoard, swimlanes: newSwimlanes, lists: newListsData };
    });
    setDropTargetListId(null);
    setDraggingListId(null); 
    setDraggedListInfo(null); 
  };

  const handleListDragEnd = () => {
    setDraggingListId(null);
    setDraggedListInfo(null);
    setDropTargetListId(null);
  };


  const handleRankCards = async () => { // Renamed
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

    if (!todoList || !todoListId || todoList.cardIds.length === 0) { // Renamed
      toast({ title: "No Cards to Rank", description: "Could not find a 'To Do' list with cards." });
      return;
    }
    const finalTodoListId = todoListId; 

    setIsRanking(true);
    try {
      const cardsToRank: RankCardsInput["cards"] = todoList.cardIds // Renamed
        .map(cardId => board.cards[cardId]) // Renamed
        .filter(card => card) 
        .map(card => ({
          id: card.id,
          description: card.description || card.title, 
          deadline: card.deadline,
        }));

      if (cardsToRank.length === 0) {
         toast({ title: "No Cards to Rank", description: "No valid cards found in 'To Do' list." });
         setIsRanking(false);
         return;
      }

      const rankedResults = await rankCards({ cards: cardsToRank }); // Renamed

      setBoard(prevBoard => {
        const newBoard = { ...prevBoard };
        const newLists = { ...newBoard.lists };
        const newCards = { ...newBoard.cards }; // Renamed
        const targetList = newLists[finalTodoListId]; 
        if (!targetList) return prevBoard; 

        const currentTodoCardIds = [...targetList.cardIds]; // Renamed
        const rankMap = new Map(rankedResults.map(r => [r.id, r.rank]));
        
        const newOrderedCardIds = [...currentTodoCardIds].sort((aId, bId) => { // Renamed
            const rankA = rankMap.get(aId);
            const rankB = rankMap.get(bId);
            if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
            if (rankA !== undefined) return -1; 
            if (rankB !== undefined) return 1;  
            return 0; 
        });
        
        newLists[finalTodoListId] = { ...targetList, cardIds: newOrderedCardIds }; // Renamed
        
        newOrderedCardIds.forEach((cardId, index) => { // Renamed
          if (newCards[cardId]) {
            newCards[cardId] = { ...newCards[cardId], order: index };
          }
        });
        
        return { ...newBoard, lists: newLists, cards: newCards }; // Renamed
      });

      toast({ title: "Cards Ranked", description: `Cards in "${todoList.title}" list have been reordered by AI.` });
    } catch (error) {
      console.error("Error ranking cards:", error);
      toast({ variant: "destructive", title: "Ranking Failed", description: "Could not rank cards. Please try again." });
    } finally {
      setIsRanking(false);
    }
  };

  const handleSetSwimlaneColor = (swimlaneId: string, color: string) => {
    setBoard(prevBoard => {
      const newSwimlanes = { ...prevBoard.swimlanes };
      if (newSwimlanes[swimlaneId]) {
        newSwimlanes[swimlaneId] = { ...newSwimlanes[swimlaneId], color };
      }
      return { ...prevBoard, swimlanes: newSwimlanes };
    });
    toast({ title: "Swimlane color updated" });
  };

  const handleSetListColor = (listId: string, color: string) => {
    setBoard(prevBoard => {
      const newLists = { ...prevBoard.lists };
      if (newLists[listId]) {
        newLists[listId] = { ...newLists[listId], color };
      }
      return { ...prevBoard, lists: newLists };
    });
    toast({ title: "List color updated" });
  };

  const handleSetCardColor = (cardId: string, color: string) => { // Renamed
    setBoard(prevBoard => {
      const newCards = { ...prevBoard.cards }; // Renamed
      if (newCards[cardId]) {
         newCards[cardId] = { ...newCards[cardId], color };
      }
      return { ...prevBoard, cards: newCards }; // Renamed
    });
    toast({ title: "Card color updated" });
  };


  return (
    <div className="flex flex-col h-full">
      <BoardHeader
        boardName={board.name}
        onRankTasks={handleRankCards} // Renamed
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
                />
              )}
              <KanbanSwimlane
                swimlane={swimlane}
                lists={listsInSwimlane}
                cards={board.cards} // Renamed
                onOpenCreateCardForm={handleOpenCreateCardForm} // Renamed
                
                onDropCard={handleDropCard} // Renamed
                onDragCardStart={handleDragCardStart} // Renamed
                onDragCardEnd={handleDragCardEnd} // Renamed
                draggingCardId={draggingCardId} // Renamed
                dropIndicator={dropIndicator}
                onCardDragOverList={handleCardDragOverList} // Renamed

                onDeleteSwimlane={handleDeleteSwimlane}
                onOpenCard={handleOpenCard}
                onSetSwimlaneColor={handleSetSwimlaneColor}
                onSetListColor={handleSetListColor}
                onSetCardColor={handleSetCardColor} // Renamed
                
                onAddSwimlaneBelow={handleAddSwimlaneBelow}
                onAddSwimlaneFromTemplate={handleAddSwimlaneFromTemplate}

                onSwimlaneDragStart={handleSwimlaneDragStart}
                onSwimlaneDragEnd={handleSwimlaneDragEnd}
                onSwimlaneDragOver={handleSwimlaneDragOver} 
                draggingSwimlaneId={draggingSwimlaneId}
                dropTargetSwimlaneId={dropTargetSwimlaneId}
                
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
            />
        )}
      </div>
      <CreateCardForm // Renamed
        isOpen={isCreateCardFormOpen} // Renamed
        onOpenChange={setCreateCardFormOpen} // Renamed
        onSubmit={handleCreateCard} // Renamed
      />
      <ShareBoardDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setShareDialogOpen}
        boardName={board.name}
      />
    </div>
  );
}
