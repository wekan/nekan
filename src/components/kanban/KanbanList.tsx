
"use client";

import type { List as ListType, Card as CardType } from "@/lib/types"; // Updated CardType import
import { Card } from "./Card"; // Updated import
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

interface KanbanListProps {
  list: ListType;
  swimlaneId: string;
  cards: CardType[]; // Renamed from tasks
  onAddCard: (listId: string) => void; // Renamed from onAddTask
  
  onDropCard: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetCardId?: string) => void; // Renamed
  onDragCardStart: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void; // Renamed
  onDragCardEnd: (event: React.DragEvent<HTMLDivElement>) => void; // Renamed
  draggingCardId: string | null; // Renamed
  dropIndicator: { listId: string; beforeCardId: string | null } | null; // Renamed beforeTaskId
  onCardDragOverList: (event: React.DragEvent, targetListId: string, targetCardId?: string | null) => void;  // Renamed

  onOpenCard: (cardId: string) => void; // Renamed
  onSetListColor: (listId: string, color: string) => void;
  onSetCardColor: (cardId: string, color: string) => void; // Renamed
  
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
  cards, // Renamed
  onAddCard, // Renamed
  
  onDropCard, // Renamed
  onDragCardStart, // Renamed
  onDragCardEnd, // Renamed
  draggingCardId, // Renamed
  dropIndicator,
  onCardDragOverList, // Renamed

  onOpenCard,
  onSetListColor,
  onSetCardColor, // Renamed

  onListDragStart,
  onListDragEnd,
  draggingListId,
  dropTargetListId, 
  onListDragOver, 
}: KanbanListProps) {
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
        )}
        style={listStyle}
        onDragOver={(e) => {
          if (draggingListId && draggingListId !== list.id && !isPlaceholderActiveBeforeThisList) {
            if (listRef.current) {
              const rect = listRef.current.getBoundingClientRect();
              const midpoint = rect.left + rect.width / 2;
              if (e.clientX < midpoint) {
                onListDragOver(e, list.id); 
              } else { 
                e.preventDefault(); 
              }
            } else {
              onListDragOver(e, list.id); 
            }
          } else if (draggingCardId) { 
             onCardDragOverList(e, list.id, null); 
          } else {
            e.preventDefault(); 
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
            aria-label={`Drag list ${list.title}`}
            data-no-card-click="true" 
          >
            <h3 className="font-semibold text-lg text-foreground truncate">{list.title} <span className="text-sm text-muted-foreground">({cards.length})</span></h3> {/* Updated to cards.length */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" data-no-card-click="true">
                <Menu className="h-4 w-4" /> 
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={(e)=>{ e.preventDefault(); triggerColorInput();}}>
                <Palette className="mr-2 h-4 w-4" />
                Change Color
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert(`Delete list ${list.title} (not implemented)`)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollArea 
            className="flex-1 p-3"
            onDragOver={(e) => { 
              if (draggingCardId) {
                onCardDragOverList(e, list.id, null); 
              }
            }}
            onDrop={(e) => { 
                 if (draggingCardId && dropIndicator?.listId === list.id && dropIndicator?.beforeCardId === null) { // Renamed beforeTaskId
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
              onDrop={(e) => onDropCard(e, list.id, undefined)} // Renamed
            />
          )}
          {cards.length === 0 && !draggingCardId && (
             <div 
              className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75 rounded border border-dashed border-muted-foreground/30"
            >
              Drop cards here or add new
            </div>
          )}

          {cards.map((card) => ( // Renamed task to card
            <React.Fragment key={card.id}>
              {draggingCardId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeCardId === card.id && ( // Renamed beforeTaskId
                <div
                  className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onCardDragOverList(e, list.id, card.id); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => onDropCard(e, list.id, card.id)} // Renamed
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
                <Card // Renamed TaskCard to Card
                  card={card} // Renamed task prop to card
                  isDragging={draggingCardId === card.id}
                  onDragStart={onDragCardStart} 
                  onDragEnd={onDragCardEnd}     
                  onOpenCard={onOpenCard}
                  onSetCardColor={onSetCardColor} // Renamed
                />
              </div>
            </React.Fragment>
          ))}
          {cards.length > 0 && draggingCardId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeCardId === null && 
           !cards.find(c => dropIndicator.beforeCardId === c.id) && ( 
            <div
              className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onCardDragOverList(e, list.id, null); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDropCard(e, list.id, undefined)}  // Renamed
            />
          )}
        </ScrollArea>
        <div className="p-3 border-t border-border">
          <Button variant="outline" className="w-full" onClick={() => onAddCard(list.id)}> {/* Renamed */}
            <Plus className="mr-2 h-4 w-4" /> Add Card
          </Button>
        </div>
      </div>
    </>
  );
}
