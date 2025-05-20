"use client";

import type { Board as BoardType, List as ListType, Card as CardType, Swimlane as SwimlaneType } from "@/lib/types";
import { KanbanSwimlane } from "./KanbanSwimlane"; 
import { CreateCardForm } from "./CreateCardForm";
import { ShareBoardDialog } from "./ShareBoardDialog";
import { BoardHeader } from "./BoardHeader";
import React, { useState, useEffect } from "react";
import { rankCards, RankCardsInput } from "@/ai/flows/rank-cards";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AddSwimlaneDialog } from "./AddSwimlaneDialog"; 
import { useTranslation } from "@/lib/i18n";

const initialBoardData: BoardType = {
  id: "board-1",
  name: "KanbanAI Project", // This could be translated if board name is static or comes from a translatable source
  cards: { 
    "card-1": { id: "card-1", title: "Setup project structure", description: "Initialize Next.js app, install dependencies.", deadline: "2024-08-01", order: 0, color: "#FFFFFF" },
    "card-2": { id: "card-2", title: "Design UI components", description: "Create Card, List, Swimlane components.", deadline: "2024-08-05", order: 0, color: "#FFFFFF" },
    "card-3": { id: "card-3", title: "Implement drag and drop for cards", description: "Allow cards to be moved between lists.", deadline: "2024-08-10", order: 0, color: "#FFFFFF" },
    "card-4": { id: "card-4", title: "Integrate AI card ranker", description: "Connect to GenAI flow for card prioritization.", deadline: "2024-08-15", order: 1, color: "#FFFFFF" },
    "card-5": { id: "card-5", title: "Add share board feature (mock)", description: "Implement UI for sharing boards.", deadline: "2024-08-20", order: 0, color: "#FFF5E1" },
    "card-6": { id: "card-6", title: "Write documentation", description: "Document components and features.", deadline: "2024-08-25", order: 2, color: "#FFFFFF" },
  },
  lists: { // Titles here will be translated if they match keys, or use t() if dynamic generation
    "list-1": { id: "list-1", title: "Backlog", cardIds: ["card-5"], order: 0, color: "#F3F4F6" }, 
    "list-2": { id: "list-2", title: "To Do", cardIds: ["card-3", "card-4", "card-6"], order: 0, color: "#FFFFFF" }, 
    "list-3": { id: "list-3", title: "In Progress", cardIds: ["card-2"], order: 1, color: "#FFFFFF" }, 
    "list-4": { id: "list-4", title: "Done", cardIds: ["card-1"], order: 2, color: "#E0F2FE" }, 
  },
  swimlanes: { // Names here will be translated if they match keys
    "swim-1": { id: "swim-1", name: "Core Features", listIds: ["list-2", "list-3"], order: 0, color: "#E0E7FF" },
    "swim-2": { id: "swim-2", name: "Support & Docs", listIds: ["list-1", "list-4"], order: 1, color: "#FEF3C7" },
  },
  swimlaneOrder: ["swim-1", "swim-2"],
};


export function KanbanBoard() {
  const [board, setBoard] = useState<BoardType>(initialBoardData);
  const [isCreateCardFormOpen, setCreateCardFormOpen] = useState(false);
  const [selectedListIdForNewCard, setSelectedListIdForNewCard] = useState<string | null>(null);
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Translate initial board data names/titles if necessary
    // This is a simplified example; a more robust solution might involve transforming data on load
    setBoard(prevBoard => ({
      ...prevBoard,
      name: t('welcome-board'), // Example: translate board name
      lists: Object.fromEntries(
        Object.entries(prevBoard.lists).map(([id, list]) => {
          let translatedTitle = list.title;
          if (list.title.toLowerCase() === 'backlog') translatedTitle = t('listTitleBacklog');
          else if (list.title.toLowerCase() === 'to do') translatedTitle = t('listTitleToDo');
          else if (list.title.toLowerCase() === 'in progress') translatedTitle = t('listTitleInProgress');
          else if (list.title.toLowerCase() === 'done') translatedTitle = t('listTitleDone');
          return [id, { ...list, title: translatedTitle }];
        })
      ),
      swimlanes: Object.fromEntries(
        Object.entries(prevBoard.swimlanes).map(([id, swimlane]) => {
          let translatedName = swimlane.name;
          if (swimlane.name === 'Core Features') translatedName = t('swimlaneTitleCoreFeatures');
          else if (swimlane.name === 'Support & Docs') translatedName = t('swimlaneTitleSupportDocs');
          return [id, { ...swimlane, name: translatedName }];
        })
      ),
    }));
  }, [t]); // Rerun when t function changes (language changes)


  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [draggedCardInfo, setDraggedCardInfo] = useState<{cardId: string, sourceListId: string} | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ listId: string; beforeCardId: string | null } | null>(null);
  
  const [draggingListId, setDraggingListId] = useState<string | null>(null);
  const [draggedListInfo, setDraggedListInfo] = useState<{ listId: string; sourceSwimlaneId: string; sourceListIndex: number } | null>(null);
  const [dropTargetListId, setDropTargetListId] = useState<string | null>(null); 
  
  const [draggingSwimlaneId, setDraggingSwimlaneId] = useState<string | null>(null);
  const [dropTargetSwimlaneId, setDropTargetSwimlaneId] = useState<string | null>(null);


  const handleOpenCreateCardForm = (listId: string) => {
    setSelectedListIdForNewCard(listId);
    setCreateCardFormOpen(true);
  };

  const handleCreateCard = (values: { title: string; description?: string; deadline?: Date }) => {
    if (!selectedListIdForNewCard) return;

    const newCardId = `card-${Date.now()}`;
    const targetList = board.lists[selectedListIdForNewCard];
    const newCardOrder = targetList ? targetList.cardIds.length : 0;

    const newCard: CardType = {
      id: newCardId,
      title: values.title,
      description: values.description,
      deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : undefined,
      order: newCardOrder,
      color: "#FFFFFF", 
    };

    setBoard(prevBoard => {
      const newCards = { ...prevBoard.cards, [newCardId]: newCard };
      const newLists = { ...prevBoard.lists };
      if (newLists[selectedListIdForNewCard]) {
        newLists[selectedListIdForNewCard] = {
          ...newLists[selectedListIdForNewCard],
          cardIds: [...newLists[selectedListIdForNewCard].cardIds, newCardId],
        };
      }
      return { ...prevBoard, cards: newCards, lists: newLists };
    });

    toast({ 
      title: t('toastCardCreatedTitle'), 
      description: t('toastCardCreatedDescription', { cardTitle: newCard.title, listTitle: board.lists[selectedListIdForNewCard]?.title || '' }) 
    });
  };

  const handleAddSwimlaneToEnd = () => { 
    const newSwimlaneId = `swim-${Date.now()}`;
    const newSwimlaneName = `${t('new')} ${t('swimlane')} ${Object.keys(board.swimlanes).length + 1}`;
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
    toast({ 
      title: t('toastSwimlaneAddedTitle'), 
      description: t('toastSwimlaneAddedDescription', { swimlaneName: newSwimlaneName })
    });
  };

  const handleAddSwimlaneBelow = (name: string, referenceSwimlaneId: string) => {
    const newSwimlaneId = `swim-${Date.now()}`;
    const newSwimlane: SwimlaneType = {
      id: newSwimlaneId,
      name: name || `${t('new')} ${t('swimlane')} ${Object.keys(board.swimlanes).length + 1}`,
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
    toast({ 
      title: t('toastSwimlaneAddedTitle'), 
      description: t('toastSwimlaneAddedDescription', { swimlaneName: newSwimlane.name }) 
    });
  };

  const handleAddSwimlaneFromTemplate = (referenceSwimlaneId: string) => {
    toast({
      title: t('toastFeatureNotImplementedTitle'),
      description: t('toastFeatureNotImplementedDescription'),
    });
  };


  const handleDeleteSwimlane = (swimlaneId: string) => {
    setBoard(prevBoard => {
      const swimlaneToDelete = prevBoard.swimlanes[swimlaneId];
      if (!swimlaneToDelete) return prevBoard;

      const newCards = { ...prevBoard.cards };
      const newLists = { ...prevBoard.lists };
      swimlaneToDelete.listIds.forEach(listId => {
        const list = newLists[listId];
        if (list) {
          list.cardIds.forEach(cardId => {
            delete newCards[cardId];
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
        cards: newCards,
        lists: newLists,
        swimlanes: newSwimlanes,
        swimlaneOrder: newSwimlaneOrder,
      };
    });
    toast({ 
      title: t('toastSwimlaneDeletedTitle'), 
      description: t('toastSwimlaneDeletedDescription')
    });
  };
  
  const handleOpenCard = (cardId: string) => {
    const card = board.cards[cardId];
    if (card) {
      // This toast is more for debugging, might not need full translation or could be replaced by a modal
      toast({
        title: `Card Clicked: ${card.title}`,
        description: `ID: ${cardId}. Details: ${card.description || 'No description'}. Deadline: ${card.deadline || 'None'}`,
      });
    }
  };

  const handleDragCardStart = (event: React.DragEvent<HTMLDivElement>, cardId: string) => {
    let sourceListId: string | undefined;
    for (const swimlaneId of board.swimlaneOrder) {
        const swimlane = board.swimlanes[swimlaneId];
        if (swimlane) {
            for (const listId of swimlane.listIds) {
                if (board.lists[listId]?.cardIds.includes(cardId)) {
                    sourceListId = listId;
                    break;
                }
            }
        }
        if (sourceListId) break;
    }
  
    if (sourceListId) {
      event.dataTransfer.setData("cardId", cardId);
      event.dataTransfer.setData("sourceListId", sourceListId); 
      setDraggingCardId(cardId);
      setDraggedCardInfo({ cardId, sourceListId });
      event.dataTransfer.effectAllowed = "move";
    }
  };
  

  const handleDragCardEnd = () => {
    setDraggingCardId(null);
    setDraggedCardInfo(null);
    setDropIndicator(null);
  };

  const handleDropCard = (event: React.DragEvent<HTMLDivElement>, currentTargetListId: string, currentTargetCardId?: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!draggedCardInfo) return; 
  
    const { cardId: movedCardId, sourceListId: currentSourceListId } = draggedCardInfo; 
  
    setBoard(prevBoard => {
      const newBoardState = { ...prevBoard };
      const newListsState = { ...newBoardState.lists };
      const newCardsState = { ...newBoardState.cards }; 
  
      let sourceListCardIdsCopy = [...newListsState[currentSourceListId].cardIds]; 
      
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
        newListsState[currentSourceListId] = { ...newListsState[currentSourceListId], cardIds: sourceListCardIdsCopy };
      }
      
      let finalCardIdsForTargetList = (currentSourceListId === currentTargetListId)
        ? sourceListCardIdsCopy
        : (newListsState[currentTargetListId] ? [...newListsState[currentTargetListId].cardIds] : []);

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
      newListsState[currentTargetListId] = { ...newListsState[currentTargetListId], cardIds: finalCardIdsForTargetList }; 
      
      const affectedListIds = new Set([currentSourceListId, currentTargetListId]);
      affectedListIds.forEach(listId => {
        const list = newListsState[listId];
        if (list) {
          list.cardIds.forEach((cId, index) => {
            if (newCardsState[cId]) {
              newCardsState[cId] = { ...newCardsState[cId], order: index };
            }
          });
        }
      });
      
      return { ...newBoardState, lists: newListsState, cards: newCardsState }; 
    });
  
    setDropIndicator(null); 
  };

  const handleCardDragOverList = (event: React.DragEvent, targetListId: string, targetCardId?: string | null) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggingCardId) {
      setDropIndicator({ listId: targetListId, beforeCardId: targetCardId || null });
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
    setDraggingSwimlaneId(null); 
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
      setDraggingListId(null);
      setDraggedListInfo(null);
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
        setDraggingListId(null);
        setDraggedListInfo(null);
        return;
    }
        
    if (sourceSwimlaneId === targetSwimlaneId && 
        board.swimlanes[sourceSwimlaneId].listIds.length <=1 && 
        board.swimlanes[sourceSwimlaneId].listIds[0] === movedListId) {
      setDropTargetListId(null);
      setDraggingListId(null);
      setDraggedListInfo(null);
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


  const handleRankCards = async () => {
    let todoListId: string | undefined;
    let todoList: ListType | undefined;

    for (const swimlaneId of board.swimlaneOrder) {
        const swimlane = board.swimlanes[swimlaneId];
        if (!swimlane) continue;
        for (const listId of swimlane.listIds) {
            if (board.lists[listId]?.title.toLowerCase() === t('listTitleToDo').toLowerCase()) {
                todoListId = listId;
                todoList = board.lists[listId];
                break;
            }
        }
        if (todoList) break; 
    }

    if (!todoList || !todoListId || todoList.cardIds.length === 0) {
      toast({ title: t('toastNoCardsToRankTitle'), description: t('toastNoCardsToRankDescriptionToDo') });
      return;
    }
    const finalTodoListId = todoListId; 

    setIsRanking(true);
    try {
      const cardsToRank: RankCardsInput["cards"] = todoList.cardIds
        .map(cardId => board.cards[cardId])
        .filter(card => card) 
        .map(card => ({
          id: card.id,
          description: card.description || card.title, 
          deadline: card.deadline,
        }));

      if (cardsToRank.length === 0) {
         toast({ title: t('toastNoCardsToRankTitle'), description: t('toastNoCardsToRankDescriptionValid') });
         setIsRanking(false);
         return;
      }

      const rankedResults = await rankCards({ cards: cardsToRank });

      setBoard(prevBoard => {
        const newBoard = { ...prevBoard };
        const newLists = { ...newBoard.lists };
        const newCards = { ...newBoard.cards };
        const targetList = newLists[finalTodoListId]; 
        if (!targetList) return prevBoard; 

        const currentTodoCardIds = [...targetList.cardIds];
        const rankMap = new Map(rankedResults.map(r => [r.id, r.rank]));
        
        const newOrderedCardIds = [...currentTodoCardIds].sort((aId, bId) => {
            const rankA = rankMap.get(aId);
            const rankB = rankMap.get(bId);
            if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
            if (rankA !== undefined) return -1; 
            if (rankB !== undefined) return 1;  
            return 0; 
        });
        
        newLists[finalTodoListId] = { ...targetList, cardIds: newOrderedCardIds };
        
        newOrderedCardIds.forEach((cardId, index) => {
          if (newCards[cardId]) {
            newCards[cardId] = { ...newCards[cardId], order: index };
          }
        });
        
        return { ...newBoard, lists: newLists, cards: newCards };
      });

      toast({ title: t('toastCardsRankedTitle'), description: t('toastCardsRankedDescription', { listTitle: todoList.title }) });
    } catch (error) {
      console.error("Error ranking cards:", error);
      toast({ variant: "destructive", title: t('toastRankingFailedTitle'), description: t('toastRankingFailedDescription') });
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
    toast({ title: t('toastSwimlaneColorUpdated') });
  };

  const handleSetListColor = (listId: string, color: string) => {
    setBoard(prevBoard => {
      const newLists = { ...prevBoard.lists };
      if (newLists[listId]) {
        newLists[listId] = { ...newLists[listId], color };
      }
      return { ...prevBoard, lists: newLists };
    });
    toast({ title: t('toastListColorUpdated') });
  };

  const handleSetCardColor = (cardId: string, color: string) => {
    setBoard(prevBoard => {
      const newCards = { ...prevBoard.cards };
      if (newCards[cardId]) {
         newCards[cardId] = { ...newCards[cardId], color };
      }
      return { ...prevBoard, cards: newCards };
    });
    toast({ title: t('toastCardColorUpdated') });
  };


  return (
    <div className="flex flex-col h-full">
      <BoardHeader
        boardName={board.name}
        onRankCards={handleRankCards}
        onShareBoard={() => setShareDialogOpen(true)}
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
                  className="h-16 bg-background border-2 border-foreground border-dashed rounded-lg my-2" 
                  onDragOver={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    e.dataTransfer.dropEffect = "move"; 
                    if (draggingSwimlaneId) handleSwimlaneDragOver(e, swimlaneId); 
                  }}
                  onDrop={(e) => handleSwimlaneDrop(e, swimlaneId)}
                />
              )}
              <KanbanSwimlane
                swimlane={swimlane}
                lists={listsInSwimlane}
                cards={board.cards}
                onOpenCreateCardForm={handleOpenCreateCardForm}
                
                onDropCard={handleDropCard}
                onDragCardStart={handleDragCardStart}
                onDragCardEnd={handleDragCardEnd}
                draggingCardId={draggingCardId}
                dropIndicator={dropIndicator}
                onCardDragOverList={handleCardDragOverList}

                onDeleteSwimlane={handleDeleteSwimlane}
                onOpenCard={handleOpenCard}
                onSetSwimlaneColor={handleSetSwimlaneColor}
                onSetListColor={handleSetListColor}
                onSetCardColor={handleSetCardColor}
                
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
                className="h-16 bg-background border-2 border-foreground border-dashed rounded-lg my-2" 
                onDragOver={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "move"; 
                    if (draggingSwimlaneId) handleBoardAreaDragOver(e);
                }}
                onDrop={(e) => handleSwimlaneDrop(e)}
            />
        )}
      </div>
      <CreateCardForm
        isOpen={isCreateCardFormOpen}
        onOpenChange={setCreateCardFormOpen}
        onSubmit={handleCreateCard}
      />
      <ShareBoardDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setShareDialogOpen}
        boardName={board.name}
      />
    </div>
  );
}
