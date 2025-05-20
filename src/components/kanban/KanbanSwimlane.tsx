
"use client";

import type { Swimlane as SwimlaneType, List as ListType, Card as CardType } from "@/lib/types"; // Updated CardType
import { KanbanList } from "./KanbanList";
import { Button } from "@/components/ui/button";
import { Menu, Trash2, Palette, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { AddSwimlaneDialog } from "./AddSwimlaneDialog";

interface KanbanSwimlaneProps { 
  swimlane: SwimlaneType;
  lists: ListType[];
  cards: Record<string, CardType>; // Renamed from tasks
  onOpenCreateCardForm: (listId: string) => void; // Renamed
  
  onDropCard: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetCardId?: string) => void; // Renamed
  onDragCardStart: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void; // Renamed
  onDragCardEnd: (event: React.DragEvent<HTMLDivElement>) => void; // Renamed
  draggingCardId: string | null; // Renamed
  dropIndicator: { listId: string; beforeCardId: string | null } | null;  // Renamed beforeTaskId
  onCardDragOverList: (event: React.DragEvent, targetListId: string, targetCardId?: string | null) => void; // Renamed


  onDeleteSwimlane: (swimlaneId: string) => void;
  onOpenCard: (cardId: string) => void; // Renamed
  onSetSwimlaneColor: (swimlaneId: string, color: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetCardColor: (cardId: string, color: string) => void; // Renamed
  
  onAddSwimlaneBelow: (name: string, referenceSwimlaneId: string) => void;
  onAddSwimlaneFromTemplate: (referenceSwimlaneId: string) => void;

  onSwimlaneDragStart: (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => void;
  onSwimlaneDragEnd: () => void;
  onSwimlaneDragOver: (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => void; 
  draggingSwimlaneId: string | null; 
  
  onListDragStart: (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => void;
  onListDropOnList: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => void;
  onListDropOnSwimlaneArea: (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => void;
  onListDragEnd: () => void;
  draggingListId: string | null;
  dropTargetListId: string | null;
  onListDragOver: (event: React.DragEvent<HTMLDivElement>, targetListId: string) => void;
  onSwimlaneAreaDragOverForList: (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => void;
}

export function KanbanSwimlane({ 
  swimlane,
  lists,
  cards, // Renamed
  onOpenCreateCardForm, // Renamed
  
  onDropCard, // Renamed
  onDragCardStart, // Renamed
  onDragCardEnd, // Renamed
  draggingCardId, // Renamed
  dropIndicator,
  onCardDragOverList, // Renamed

  onDeleteSwimlane,
  onOpenCard,
  onSetSwimlaneColor,
  onSetListColor,
  onSetCardColor, // Renamed
  onAddSwimlaneBelow,
  onAddSwimlaneFromTemplate,
  onSwimlaneDragStart,
  onSwimlaneDragEnd,
  onSwimlaneDragOver,
  draggingSwimlaneId,
  onListDragStart,
  onListDropOnList,
  onListDropOnSwimlaneArea,
  onListDragEnd,
  draggingListId,
  dropTargetListId,
  onListDragOver,
  onSwimlaneAreaDragOverForList,
}: KanbanSwimlaneProps) {
  const swimlaneStyle = swimlane.color ? { backgroundColor: swimlane.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const isCurrentlyDraggingThisSwimlane = draggingSwimlaneId === swimlane.id;
  const isAnySwimlaneBeingDragged = !!draggingSwimlaneId;

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetSwimlaneColor(swimlane.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };
  
  const handleDragOverListArea = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingListId) {
        onSwimlaneAreaDragOverForList(event, swimlane.id);
    }
  };

  const handleDropListOnSwimlaneArea = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingListId) { 
      onListDropOnSwimlaneArea(event, swimlane.id);
    }
  };

  const handleAddSubmit = (name: string) => {
    onAddSwimlaneBelow(name, swimlane.id);
  };

  const handleAddFromTemplate = () => {
    onAddSwimlaneFromTemplate(swimlane.id);
  };

  const listPlaceholderStyle = "w-80 min-w-80 h-full min-h-[150px] bg-background border-2 border-foreground border-dashed rounded-lg opacity-75 mx-1 flex-shrink-0";
  
  const listsToRender = lists; // Do not filter out the dragged list here, handle opacity in KanbanList

  const swimlaneContentDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (onSwimlaneDragOver && draggingSwimlaneId && draggingSwimlaneId !== swimlane.id) {
      onSwimlaneDragOver(e, swimlane.id);
   } else {
       e.preventDefault(); 
   }
  };

  return (
    <>
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        value={swimlane.color || '#FFFFFF'}
        onChange={handleColorInputChange}
        data-no-card-click="true"
      />
      <div 
        className={cn(
          "flex flex-col p-4 rounded-lg shadow-md border transition-all duration-300 ease-in-out",
          isCurrentlyDraggingThisSwimlane ? "opacity-50 ring-2 ring-primary" : "border-border",
        )}
        style={swimlaneStyle}
        onDragOver={swimlaneContentDragOver}
      >
        <div className="flex items-center justify-between mb-4"> 
          <div className="flex items-center gap-2 shrink-0"> 
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setAddDialogOpen(true)} data-no-card-click="true" className="h-7 w-7">
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Swimlane</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-no-card-click="true" className="h-7 w-7">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); triggerColorInput(); }}>
                  <Palette className="mr-2 h-4 w-4" />
                  Change Color
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDeleteSwimlane(swimlane.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Swimlane
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div 
            draggable={true} 
            onDragStart={(e) => { 
              const titleElement = (e.currentTarget as HTMLElement).querySelector('h2');
              const elementToDrag = titleElement || e.currentTarget;
              const rect = elementToDrag.getBoundingClientRect();
              const xOffset = e.clientX - rect.left;
              const yOffset = e.clientY - rect.top; 
              try { 
                  e.dataTransfer.setDragImage(elementToDrag, xOffset, yOffset);
              } catch (err) {
                  // console.warn("setDragImage failed:", err);
              }
              onSwimlaneDragStart(e, swimlane.id); 
            }}
            onDragEnd={onSwimlaneDragEnd}
            aria-label={`Drag swimlane ${swimlane.name}`}
            data-no-card-click="true"
            className="flex items-center gap-2 flex-1 min-w-0 px-2 cursor-grab"
          >
            <h2 className="text-xl font-semibold text-foreground truncate">
                {swimlane.name}
            </h2>
          </div>
        </div>

        <div 
          className={cn(
            "flex gap-2 overflow-x-auto pb-2 relative transition-all duration-200 ease-in-out",
            isAnySwimlaneBeingDragged ? "max-h-0 opacity-0 p-0 m-0 border-none min-h-0 overflow-hidden" : "min-h-[150px] opacity-100"
          )}
          onDragOver={handleDragOverListArea} 
          onDrop={handleDropListOnSwimlaneArea}
        >
          {!isAnySwimlaneBeingDragged && listsToRender.map((list) => { 
            const cardsInList = list.cardIds // Renamed from taskIds
              .map(cardId => cards[cardId]) // Renamed from tasks
              .filter(Boolean)
              .sort((a,b) => a.order - b.order) as CardType[]; // Updated CardType
            
            const showListDropPlaceholderBeforeThis = draggingListId && 
                                                      dropTargetListId === list.id && 
                                                      draggingListId !== list.id;
            return (
              <React.Fragment key={list.id}>
                {showListDropPlaceholderBeforeThis && (
                  <div 
                    className={listPlaceholderStyle}
                    onDragOver={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        e.dataTransfer.dropEffect = "move";
                        if (draggingListId) {
                           onListDragOver(e, list.id); 
                        }
                    }}
                    onDrop={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggingListId) {
                            onListDropOnList(e, list.id, swimlane.id); 
                        }
                    }}
                  />
                )}
                <div className={cn(list.id === draggingListId ? "opacity-30" : "")}>
                  <KanbanList 
                    swimlaneId={swimlane.id}
                    list={list}
                    cards={cardsInList} // Renamed
                    onAddCard={onOpenCreateCardForm} // Renamed
                    
                    onDropCard={onDropCard} // Renamed
                    onDragCardStart={onDragCardStart}  // Renamed
                    onDragCardEnd={onDragCardEnd}  // Renamed
                    draggingCardId={draggingCardId} // Renamed
                    dropIndicator={dropIndicator}
                    onCardDragOverList={onCardDragOverList} // Renamed

                    onOpenCard={onOpenCard}
                    onSetListColor={onSetListColor}
                    onSetCardColor={onSetCardColor} // Renamed

                    onListDragStart={onListDragStart}
                    onListDropOnList={onListDropOnList} 
                    onListDropOnSwimlaneArea={onListDropOnSwimlaneArea} 
                    onListDragEnd={onListDragEnd}
                    draggingListId={draggingListId}
                    dropTargetListId={dropTargetListId} 
                    onListDragOver={onListDragOver} 
                  />
                </div>
              </React.Fragment>
            );
          })}
          {!isAnySwimlaneBeingDragged && draggingListId && dropTargetListId === `end-of-swimlane-${swimlane.id}` && (
            <div 
                className={listPlaceholderStyle}
                onDragOver={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    if (draggingListId) {
                        onSwimlaneAreaDragOverForList(e, swimlane.id);
                    }
                    e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    if (draggingListId) {
                        onListDropOnSwimlaneArea(e, swimlane.id);
                    }
                }}
            />
           )}
        </div>
      </div>
      <AddSwimlaneDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddSubmit}
        onUseTemplate={handleAddFromTemplate}
      />
    </>
  );
}
