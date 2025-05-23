"use client";

import type { Swimlane as SwimlaneType, List as ListType, Card as CardType } from "@/lib/types";
import { KanbanList } from "./KanbanList";
import { Button } from "@/components/ui/button";
import { Menu, Trash2, Palette, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { SketchPicker, ColorResult } from 'react-color';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState, MouseEvent } from 'react'; // Added MouseEvent
import { cn, isColorLight } from "@/lib/utils"; // Import isColorLight
import { AddSwimlaneDialog } from "./AddSwimlaneDialog";
import { useTranslation } from "@/lib/i18n";

interface KanbanSwimlaneProps { 
  swimlane: SwimlaneType;
  lists: ListType[];
  cards: Record<string, CardType>;
  onOpenCreateCardForm: (listId: string) => void;
  
  onDropCard: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetCardId?: string) => void;
  onDragCardStart: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragCardEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingCardId: string | null;
  dropIndicator: { listId: string; beforeCardId: string | null } | null;
  onCardDragOverList: (event: React.DragEvent, targetListId: string, targetCardId?: string | null) => void;


  onDeleteSwimlane: (swimlaneId: string) => void;
  onOpenCard: (cardId: string) => void;
  onSetSwimlaneColor: (swimlaneId: string, color: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetCardColor: (cardId: string, color: string) => void;
  
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
  cards,
  onOpenCreateCardForm,
  
  onDropCard,
  onDragCardStart,
  onDragCardEnd,
  draggingCardId,
  dropIndicator,
  onCardDragOverList,

  onDeleteSwimlane,
  onOpenCard,
  onSetSwimlaneColor,
  onSetListColor,
  onSetCardColor,
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
  const { t } = useTranslation();
  const swimlaneStyle = swimlane.color ? { backgroundColor: swimlane.color } : {};
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const textColorClass = swimlane.color && !isColorLight(swimlane.color) ? "text-white" : "text-foreground";
  const iconColorClass = swimlane.color && !isColorLight(swimlane.color) ? "text-white" : ""; // Default icon color will be inherited or explicitly set by Button variant

  const isCurrentlyDraggingThisSwimlane = draggingSwimlaneId === swimlane.id;
  const isAnySwimlaneBeingDragged = !!draggingSwimlaneId;

  const handleColorChange = (color: ColorResult) => {
    onSetSwimlaneColor(swimlane.id, color.hex);
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
  
  const listsToRender = lists;

  const swimlaneContentDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (onSwimlaneDragOver && draggingSwimlaneId && draggingSwimlaneId !== swimlane.id) {
      onSwimlaneDragOver(e, swimlane.id);
   } else {
       e.preventDefault(); 
   }
  };

  return (
    <>
      <div 
        className={cn(
          "flex flex-col p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out",
          isCurrentlyDraggingThisSwimlane ? "opacity-50 ring-2 ring-primary" : 
          swimlane.color ? (isColorLight(swimlane.color) ? "border-gray-300" : "border-gray-700") : "border-border"
        )}
        style={swimlaneStyle}
        onDragOver={swimlaneContentDragOver}
      >
        <div className="flex items-center justify-between mb-4"> 
          <div className="flex items-center gap-2 shrink-0"> 
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setAddDialogOpen(true)} data-no-card-click="true" className={cn("h-7 w-7", iconColorClass)}>
                    <Plus className={cn("h-5 w-5", iconColorClass)} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('add-swimlane')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-no-card-click="true" className={cn("h-7 w-7", iconColorClass)}>
                  <Menu className={cn("h-5 w-5", iconColorClass)} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className={iconColorClass}>
                    <Palette className={cn("mr-2 h-4 w-4", iconColorClass)} />
                    {t('setSwimlaneColorPopup-title')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent 
                      sideOffset={8} 
                      alignOffset={-5} 
                      className="p-0 border-none bg-transparent shadow-none w-auto"
                      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    >
                      <SketchPicker
                        color={swimlane.color || '#FFFFFF'}
                        onChangeComplete={handleColorChange}
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator className={swimlane.color ? (isColorLight(swimlane.color) ? "bg-gray-300" : "bg-gray-700") : ""}/>
                <DropdownMenuItem 
                    onClick={() => onDeleteSwimlane(swimlane.id)} 
                    className={cn("text-destructive focus:text-destructive focus:bg-destructive/10", swimlane.color && !isColorLight(swimlane.color) ? "text-red-300 focus:text-red-300" : "")}
                >
                  <Trash2 className={cn("mr-2 h-4 w-4", swimlane.color && !isColorLight(swimlane.color) ? "text-red-300" : "text-destructive")} />
                  {t('swimlaneDeletePopup-title')}
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
            aria-label={t('dragSwimlaneAriaLabel', { swimlaneName: swimlane.name })}
            data-no-card-click="true"
            className={cn("flex items-center gap-2 flex-1 min-w-0 px-2 cursor-grab", textColorClass)}
          >
            <h2 className={cn("text-xl font-semibold truncate", textColorClass)}>
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
            const cardsInList = list.cardIds
              .map(cardId => cards[cardId])
              .filter(Boolean)
              .sort((a,b) => a.order - b.order) as CardType[];
            
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
                    cards={cardsInList}
                    onAddCard={onOpenCreateCardForm}
                    
                    onDropCard={onDropCard}
                    onDragCardStart={onDragCardStart}
                    onDragCardEnd={onDragCardEnd}
                    draggingCardId={draggingCardId}
                    dropIndicator={dropIndicator}
                    onCardDragOverList={onCardDragOverList}

                    onOpenCard={onOpenCard}
                    onSetListColor={onSetListColor}
                    onSetCardColor={onSetCardColor}

                    onListDragStart={onListDragStart}
                    onListDropOnList={onListDropOnList} 
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
