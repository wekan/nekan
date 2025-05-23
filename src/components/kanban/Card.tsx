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
import { cn } from "@/lib/utils";
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
            aria-label={t('dragCardAriaLabel', { cardTitle: card.title })}
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="mr-2 h-4 w-4" />
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
                    <DropdownMenuItem onClick={() => onDeleteCard(card.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
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
