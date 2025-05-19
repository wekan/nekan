
"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Task } from "@/lib/types";
import { Card as ShadCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Renamed to avoid conflict with component
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

interface CardProps {
  task: Task;
  isDragging?: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onOpenCard: (taskId: string) => void;
  onSetTaskColor: (taskId: string, color: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function Card({ task, isDragging, onDragStart, onDragEnd, onOpenCard, onSetTaskColor, onDeleteTask }: CardProps) {
  const [displayDeadline, setDisplayDeadline] = useState<string | undefined>(undefined);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task.deadline) {
      try {
        const date = new Date(task.deadline + "T00:00:00");
        if (!isNaN(date.valueOf())) {
            setDisplayDeadline(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
        } else {
            setDisplayDeadline(task.deadline); 
        }
      } catch (e) {
        setDisplayDeadline(task.deadline);
      }
    } else {
      setDisplayDeadline(undefined);
    }
  }, [task.deadline]);


  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetTaskColor(task.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };

  const cardStyle = task.color ? { backgroundColor: task.color } : {};

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
      return;
    }
    if (!isDragging && !(e.target as HTMLElement).closest('[draggable="true"]')) {
        onOpenCard(task.id);
    }
  };
  
  const handleTitleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && !(e.target as HTMLElement).closest('[draggable="true"]')) { // Check if not dragging part of title
        onOpenCard(task.id);
    }
    // If it is the draggable part, onDragStart will handle it, and we don't want to open.
  };


  return (
    <>
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        value={task.color || '#FFFFFF'}
        onChange={handleColorInputChange}
        data-no-card-click="true"
      />
      <ShadCard // Using aliased ShadCN Card
        style={cardStyle}
        className={cn(
          "mb-2 p-3 shadow-md hover:shadow-lg transition-shadow group/card", // Renamed group
          isDragging ? "opacity-50 ring-2 ring-primary scale-105" : "",
          "bg-card" // Ensuring ShadCN Card's bg-card is used unless overridden by task.color
        )}
      >
        <CardHeader className="p-0 mb-2 flex flex-row items-center justify-between gap-2">
          <div
            draggable
            onDragStart={(e) => {
              // e.stopPropagation(); // Allow drag from title
              onDragStart(e, task.id);
            }}
            onDragEnd={onDragEnd}
            onClick={handleTitleClick} // This will now handle opening the card
            className="flex-1 min-w-0 cursor-grab group-hover/card:opacity-100 transition-opacity"
            aria-label={`Drag task ${task.title}`}
          >
            <CardTitle className="text-base font-semibold break-words">
              {task.title}
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
                {onDeleteTask && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Task
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {task.description && (
          <CardContent className="p-0 mb-2" onClick={handleCardClick} style={{cursor: 'pointer'}}>
            <p className="text-sm text-muted-foreground break-words">{task.description}</p>
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
