"use client";

import React, { useState, useEffect } from "react"; // Removed useRef
import type { Card as CardType } from "@/lib/types";
import { Card as ShadCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Menu, Trash2, Palette } from "lucide-react";
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
import { cn, isColorLight } from "@/lib/utils"; // Import isColorLight
import { useTranslation } from "@/lib/i18n";

interface CardProps {
  card: CardType;
  isDragging?: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onOpenCard: (cardId: string) => void;
  onSetCardColor: (cardId: string, color: string) => void;
  onDeleteCard?: (cardId: string) => void;
}

export function Card({ card, isDragging, onDragStart, onDragEnd, onOpenCard, onSetCardColor, onDeleteCard }: CardProps) {
  const [displayDeadline, setDisplayDeadline] = useState<string | undefined>(undefined);
  const { t } = useTranslation();

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


  const handleColorChange = (color: ColorResult) => {
    onSetCardColor(card.id, color.hex);
  };

  const cardStyle = card.color ? { backgroundColor: card.color } : {};
  const textColorClass = card.color && !isColorLight(card.color) ? "text-white" : "text-black";
  const iconColorClass = card.color && !isColorLight(card.color) ? "text-white group-hover/card:text-white" : "text-muted-foreground group-hover/card:text-foreground";
  const deadlineIconColorClass = card.color && !isColorLight(card.color) ? "text-white" : "text-muted-foreground";

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
      return;
    }
    if (!isDragging && !(e.target as HTMLElement).closest('[draggable="true"]')) {
        onOpenCard(card.id);
    }
  };
  
  const handleTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if ((e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
      return;
    }
    if (!isDragging ) { 
        onOpenCard(card.id);
    }
  };


  return (
    <>
      <ShadCard
        style={cardStyle}
        className={cn(
          "mb-2 p-3 shadow-md hover:shadow-lg transition-shadow group/card", 
          isDragging ? "opacity-50 ring-2 ring-primary scale-105" : "",
          "bg-card" // Keep bg-card for default, cardStyle will override if color is set
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
            className={cn("flex-1 min-w-0 cursor-grab group-hover/card:opacity-100 transition-opacity", textColorClass)}
            aria-label={t('dragCardAriaLabel', { cardTitle: card.title })}
          >
            <CardTitle className={cn("text-base font-semibold break-words", textColorClass)}>
              {card.title}
            </CardTitle>
          </div>

          <div className="shrink-0" data-no-card-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-7 w-7 opacity-70 group-hover/card:opacity-100 transition-opacity", iconColorClass)}>
                  <Menu className={cn("h-4 w-4", iconColorClass)} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className={iconColorClass}>
                    <Palette className={cn("mr-2 h-4 w-4", iconColorClass)} />
                    {t('setCardColorPopup-title')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent 
                      sideOffset={8} 
                      alignOffset={-5} 
                      className="p-0 border-none bg-transparent shadow-none w-auto"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onClick={(e) => e.stopPropagation()} 
                    >
                      <SketchPicker
                        color={card.color || '#FFFFFF'}
                        onChangeComplete={handleColorChange}
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {onDeleteCard && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => onDeleteCard(card.id)} 
                        className={cn("text-destructive focus:text-destructive focus:bg-destructive/10", card.color && !isColorLight(card.color) ? "text-red-300 focus:text-red-300" : "")}
                    >
                      <Trash2 className={cn("mr-2 h-4 w-4", card.color && !isColorLight(card.color) ? "text-red-300" : "text-destructive")} />
                      {t('cardDeletePopup-title')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {card.description && (
          <CardContent className="p-0 mb-2" onClick={handleCardClick} style={{cursor: 'pointer'}}>
            <p className={cn("text-sm break-words", card.color && !isColorLight(card.color) ? "text-gray-200" : "text-muted-foreground")}>{card.description}</p>
          </CardContent>
        )}
        {displayDeadline && (
          <div className={cn("flex items-center text-xs mt-1", card.color && !isColorLight(card.color) ? "text-gray-200" : "text-muted-foreground")} onClick={handleCardClick} style={{cursor: 'pointer'}}>
            <CalendarDays className={cn("h-3.5 w-3.5 mr-1.5", deadlineIconColorClass)} />
            <span>{displayDeadline}</span>
          </div>
        )}
      </ShadCard>
    </>
  );
}
