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
} from "@/components/ui/dropdown-menu";
import React, { useRef } from 'react';
import { cn } from "@/lib/utils";
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
  onListDropOnList, // Used by placeholders in parent
  onListDragEnd,
  draggingListId,
  dropTargetListId, 
  onListDragOver, 
}: KanbanListProps) {
  const { t } = useTranslation();
  const listStyle = list.color ? { backgroundColor: list.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetListColor(list.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };

  const isPlaceholderActiveBeforeThisList = draggingListId && 
                                            dropTargetListId === list.id && 
                                            draggingListId !== list.id;

  return (
    <>
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        value={list.color || '#FFFFFF'}
        onChange={handleColorInputChange}
        data-no-card-click="true"
      />
      <div
        ref={listRef}
        className={cn(
          "flex flex-col w-80 min-w-80 bg-muted/60 rounded-lg shadow-sm h-full relative",
          draggingListId === list.id ? "opacity-50 ring-2 ring-primary" : ""
          // Placeholder styling is now primarily handled by parent KanbanSwimlane
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
                // No onListDragOver means event might bubble to swimlane area for "end-of-swimlane" drop
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
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div 
            className="flex items-center gap-1 flex-1 min-w-0 cursor-grab"
            draggable 
            onDragStart={(e) => { 
                e.stopPropagation();
                onListDragStart(e, list.id, swimlaneId); 
            }}
            onDragEnd={onListDragEnd}
            aria-label={t('dragListAriaLabel', { listTitle: list.title })}
            data-no-card-click="true" 
          >
            <h3 className="font-semibold text-lg text-foreground truncate">{list.title} <span className="text-sm text-muted-foreground">({cards.length})</span></h3>
          </div>
          <div className="shrink-0" data-no-card-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Menu className="h-4 w-4" /> 
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e)=>{ e.preventDefault(); triggerColorInput();}}>
                  <Palette className="mr-2 h-4 w-4" />
                  {t('setListColorPopup-title')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert(t('delete') + ` ${list.title} (` + t('not-implemented') + `)`)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
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
              className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75 rounded border border-dashed border-muted-foreground/30"
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
        <div className="p-3 border-t border-border">
          <Button variant="outline" className="w-full" onClick={() => onAddCard(list.id)}>
            <Plus className="mr-2 h-4 w-4" /> {t('add-card')}
          </Button>
        </div>
      </div>
    </>
  );
}
