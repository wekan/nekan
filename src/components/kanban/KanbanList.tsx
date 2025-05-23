"use client";

import type { List as ListType, Card as CardType } from "@/lib/types";
import { Card } from "./Card";
import { Button } from "@/components/ui/button";
import { Plus, Menu, Trash2, Palette } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import React, { useRef, MouseEvent } from 'react';
import { cn, isColorLight } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface KanbanListProps {
  list: ListType;
  swimlaneId: string;
  cards: CardType[];
  onAddCard: (listId: string) => void;
  
  onDropCard: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetCardId?: string) => void;
  onDragCardStart: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragCardEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingCardId: string | null;
  dropIndicator: { listId: string; beforeCardId: string | null } | null;
  onCardDragOverList: (event: React.DragEvent, targetListId: string, targetCardId?: string | null) => void; 

  onOpenCard: (cardId: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetCardColor: (cardId: string, color: string) => void;
  
  onListDragStart: (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => void;
  onListDropOnList: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => void;
  onListDragEnd: () => void;
  draggingListId: string | null;
  dropTargetListId: string | null; 
  onListDragOver: (event: React.DragEvent<HTMLDivElement>, targetListId: string) => void; 
}

export function KanbanList({
  list,
  swimlaneId,
  cards,
  onAddCard,
  
  onDropCard,
  onDragCardStart,
  onDragCardEnd,
  draggingCardId,
  dropIndicator,
  onCardDragOverList,

  onOpenCard,
  onSetListColor,
  onSetCardColor,

  onListDragStart,
  onListDropOnList, 
  onListDragEnd,
  draggingListId,
  dropTargetListId, 
  onListDragOver, 
}: KanbanListProps) {
  const { t } = useTranslation();
  const listStyle = list.color ? { backgroundColor: list.color } : {};
  const listRef = useRef<HTMLDivElement>(null);

  const isListDark = list.color && !isColorLight(list.color);

  // Text and icon colors for list header and general elements
  const headerTextColorClass = isListDark ? "text-white" : "text-foreground";
  const headerMutedTextColorClass = isListDark ? "text-gray-300" : "text-muted-foreground";
  const headerIconColorClass = isListDark ? "text-white" : ""; // For icons like Menu, Palette

  // Dropdown menu item colors
  const dropdownDestructiveTextColor = isListDark ? "text-red-300 focus:text-red-300" : "text-destructive focus:text-destructive focus:bg-destructive/10";
  const dropdownDestructiveIconColor = isListDark ? "text-red-300" : "text-destructive";
  
  // Border and separator colors
  const divBorderClass = list.color ? (isListDark ? "border-gray-700" : "border-gray-300") : "border-border";
  const separatorBgClass = list.color ? (isListDark ? "bg-gray-700" : "bg-gray-300") : "";

  // Empty list placeholder styling
  const emptyListClasses = cn(
    "flex-1 min-h-[100px] flex items-center justify-center opacity-75 rounded border border-dashed",
    list.color 
      ? (isListDark ? "text-gray-400 border-gray-600/50" : "text-gray-600 border-gray-400/50")
      : "text-muted-foreground border-muted-foreground/30"
  );

  // "Add Card" Button styling
  const addCardButtonClasses = cn(
    "w-full",
    isListDark ? [
      "text-white",
      "border-white/70",
      "hover:bg-white/10",
      "hover:border-white",
      "focus-visible:ring-white/50",
      "bg-transparent" // Crucial for dark backgrounds
    ] : [
      "text-foreground", // Changed from text-primary
      "hover:text-foreground/90", // Adjusted hover to match
      "border-input"
    ]
  );

  const addCardPlusIconClasses = cn(
    "mr-2 h-4 w-4",
    isListDark ? "text-white" : "text-foreground" // Changed from text-primary
  );

  const handleColorChange = (color: ColorResult) => {
    onSetListColor(list.id, color.hex);
  };

  const isPlaceholderActiveBeforeThisList = draggingListId && 
                                            dropTargetListId === list.id && 
                                            draggingListId !== list.id;

  return (
    <>
      <div
        ref={listRef}
        className={cn(
          "flex flex-col w-80 min-w-80 rounded-lg shadow-sm h-full relative",
          draggingListId === list.id ? "opacity-50 ring-2 ring-primary" : "",
          list.color ? "" : "bg-muted/60" // Apply default bg only if no color is set
        )}
        style={listStyle}
        onDragOver={(e) => {
          if (draggingListId && draggingListId !== list.id && !isPlaceholderActiveBeforeThisList) {
            if (listRef.current) {
              const rect = listRef.current.getBoundingClientRect();
              const midpoint = rect.left + rect.width / 2;
              if (e.clientX < midpoint) { // Hovering on the left half
                onListDragOver(e, list.id); 
              } else { // Hovering on the right half, let parent (swimlane area) handle
                e.preventDefault(); 
              }
            } else {
              onListDragOver(e, list.id); // Fallback if ref not available
            }
          } else if (draggingCardId) { 
             onCardDragOverList(e, list.id, null); 
          } else {
            e.preventDefault(); // Default for non-list drags or when dragging over self
          }
        }}
      >
        <div className={cn("p-3 border-b flex items-center justify-between", divBorderClass)}>
          <div 
            className={cn("flex items-center gap-1 flex-1 min-w-0 cursor-grab", headerTextColorClass)}
            draggable 
            onDragStart={(e) => { 
                e.stopPropagation();
                onListDragStart(e, list.id, swimlaneId); 
            }}
            onDragEnd={onListDragEnd}
            aria-label={t('dragListAriaLabel', { listTitle: list.title })}
            data-no-card-click="true" 
          >
            <h3 className={cn("font-semibold text-lg truncate", headerTextColorClass)}>{list.title} <span className={cn("text-sm", headerMutedTextColorClass)}>({cards.length})</span></h3>
          </div>
          <div className="shrink-0" data-no-card-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-7 w-7", headerIconColorClass)}>
                  <Menu className={cn("h-4 w-4", headerIconColorClass)} /> 
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className={headerIconColorClass}>
                    <Palette className={cn("mr-2 h-4 w-4", headerIconColorClass)} />
                    {t('setListColorPopup-title')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent 
                      sideOffset={8} 
                      alignOffset={-5} 
                      className="p-0 border-none bg-transparent shadow-none w-auto"
                      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    >
                      <SketchPicker
                        color={list.color || '#FFFFFF'}
                        onChangeComplete={handleColorChange}
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator className={separatorBgClass} />
                <DropdownMenuItem 
                    onClick={() => alert(t('delete') + ` ${list.title} (` + t('not-implemented') + `)`)} 
                    className={cn("focus:bg-destructive/10", dropdownDestructiveTextColor)}
                >
                  <Trash2 className={cn("mr-2 h-4 w-4", dropdownDestructiveIconColor)} />
                  {t('listDeletePopup-title')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <ScrollArea 
            className="flex-1 p-3"
            onDragOver={(e) => { 
              if (draggingCardId) {
                onCardDragOverList(e, list.id, null); 
              }
            }}
            onDrop={(e) => { 
                 if (draggingCardId && dropIndicator?.listId === list.id && dropIndicator?.beforeCardId === null) { 
                    onDropCard(e, list.id, undefined); 
                 } else {
                    e.preventDefault(); 
                 }
            }}
        >
          {cards.length === 0 && draggingCardId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeCardId === null && (
            <div
              className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onCardDragOverList(e, list.id, null); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDropCard(e, list.id, undefined)}
            />
          )}
          {cards.length === 0 && !draggingCardId && (
             <div 
              className={emptyListClasses}
            >
              {t('dropCardsOrAddNewPlaceholder')}
            </div>
          )}

          {cards.map((card) => (
            <React.Fragment key={card.id}>
              {draggingCardId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeCardId === card.id && (
                <div
                  className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onCardDragOverList(e, list.id, card.id); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => onDropCard(e, list.id, card.id)}
                />
              )}
              <div 
                onDragOver={(e) => { 
                  if (draggingCardId && draggingCardId !== card.id) { 
                    onCardDragOverList(e, list.id, card.id);
                  } else {
                     e.preventDefault(); 
                  }
                }}
              >
                <Card
                  card={card}
                  isDragging={draggingCardId === card.id}
                  onDragStart={onDragCardStart} 
                  onDragEnd={onDragCardEnd}     
                  onOpenCard={onOpenCard}
                  onSetCardColor={onSetCardColor}
                />
              </div>
            </React.Fragment>
          ))}
          {cards.length > 0 && draggingCardId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeCardId === null && 
           !cards.find(c => dropIndicator.beforeCardId === c.id) && ( 
            <div
              className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onCardDragOverList(e, list.id, null); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDropCard(e, list.id, undefined)}
            />
          )}
        </ScrollArea>
        <div className={cn("p-3 border-t", divBorderClass)}>
          <Button 
            variant="outline" 
            className={addCardButtonClasses}
            onClick={() => onAddCard(list.id)}
          >
            <Plus className={addCardPlusIconClasses} /> {t('add-card')}
          </Button>
        </div>
      </div>
    </>
  );
}
