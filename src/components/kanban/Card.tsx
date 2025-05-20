
"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Card as CardType } from "@/lib/types"; // Updated type import
import { Card as ShadCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Menu, Trash2, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CardProps { // Renamed interface
  card: CardType; // Renamed prop
  isDragging?: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void; // Renamed param
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onOpenCard: (cardId: string) => void; // Renamed param
  onSetCardColor: (cardId: string, color: string) => void; // Renamed prop and param
  onDeleteCard?: (cardId: string) => void; // Renamed prop and param
}

export function Card({ card, isDragging, onDragStart, onDragEnd, onOpenCard, onSetCardColor, onDeleteCard }: CardProps) {
  const [displayDeadline, setDisplayDeadline] = useState<string | undefined>(undefined);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card.deadline) {
      try {
        const date = new Date(card.deadline + "T00:00:00");
        if (!isNaN(date.valueOf())) {
            setDisplayDeadline(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
        } else {
            setDisplayDeadline(card.deadline); 
        }
      } catch (e) {
        setDisplayDeadline(card.deadline);
      }
    } else {
      setDisplayDeadline(undefined);
    }
  }, [card.deadline]);


  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetCardColor(card.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };

  const cardStyle = card.color ? { backgroundColor: card.color } : {};

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
      return;
    }
    if (!isDragging && !(e.target as HTMLElement).closest('[draggable="true"]')) {
        onOpenCard(card.id);
    }
  };
  
  const handleTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && !(e.target as HTMLElement).closest('[draggable="true"]')) { 
        onOpenCard(card.id);
    }
  };


  return (
    <>
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        value={card.color || '#FFFFFF'}
        onChange={handleColorInputChange}
        data-no-card-click="true"
      />
      <ShadCard
        style={cardStyle}
        className={cn(
          "mb-2 p-3 shadow-md hover:shadow-lg transition-shadow group/card", 
          isDragging ? "opacity-50 ring-2 ring-primary scale-105" : "",
          "bg-card"
        )}
      >
        <CardHeader className="p-0 mb-2 flex flex-row items-center justify-between gap-2">
          <div
            draggable
            onDragStart={(e) => {
              onDragStart(e, card.id);
            }}
            onDragEnd={onDragEnd}
            onClick={handleTitleClick}
            className="flex-1 min-w-0 cursor-grab group-hover/card:opacity-100 transition-opacity"
            aria-label={`Drag card ${card.title}`}
          >
            <CardTitle className="text-base font-semibold break-words">
              {card.title}
            </CardTitle>
          </div>

          <div className="shrink-0" data-no-card-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 group-hover/card:opacity-100 transition-opacity">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); triggerColorInput(); }}>
                  <Palette className="mr-2 h-4 w-4" />
                  Change Color
                </DropdownMenuItem>
                {onDeleteCard && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDeleteCard(card.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Card
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {card.description && (
          <CardContent className="p-0 mb-2" onClick={handleCardClick} style={{cursor: 'pointer'}}>
            <p className="text-sm text-muted-foreground break-words">{card.description}</p>
          </CardContent>
        )}
        {displayDeadline && (
          <div className="flex items-center text-xs text-muted-foreground mt-1" onClick={handleCardClick} style={{cursor: 'pointer'}}>
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            <span>{displayDeadline}</span>
          </div>
        )}
      </ShadCard>
    </>
  );
}
