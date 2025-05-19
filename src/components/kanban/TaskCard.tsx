
"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Task } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings, Trash2, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onOpenCard: (taskId: string) => void;
  onSetTaskColor: (taskId: string, color: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd, onOpenCard, onSetTaskColor, onDeleteTask }: TaskCardProps) {
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
    // Prevent card click if the click originated from an element that should not trigger it (like a button or handle *if it were separate*)
    // Since the title itself is now draggable, this check is mostly for the settings cog.
    if ((e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
      return;
    }
    // If a drag didn't actually start, treat as a click
    if (!isDragging) {
        onOpenCard(task.id);
    }
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
      <Card
        style={cardStyle}
        className={cn(
          "mb-2 p-3 shadow-md hover:shadow-lg transition-shadow group/taskcard", // Removed cursor-pointer as title is now the specific drag target
          isDragging ? "opacity-50 ring-2 ring-primary scale-105" : "",
          "bg-card"
        )}
        // onClick={handleCardClick} // Moved click handling to specific elements or rely on title click for opening.
        // The main card click is removed to avoid conflict with title dragging.
        // Opening card details will be more explicitly tied to clicking non-interactive parts or the title *without* dragging.
      >
        <CardHeader className="p-0 mb-2 flex flex-row items-center justify-between">
          {/* Card Title - Now Draggable */}
          <div
            draggable
            onDragStart={(e) => {
              // e.stopPropagation(); // Stop if title is inside another clickable/draggable, but here it's the primary target.
              onDragStart(e, task.id);
            }}
            onDragEnd={onDragEnd}
            onClick={(e) => {
                // Allow opening card if just clicking the title without dragging
                if (!(e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
                    onOpenCard(task.id);
                }
            }}
            className="flex-1 min-w-0 cursor-grab group-hover/taskcard:opacity-100 transition-opacity"
            aria-label={`Drag task ${task.title}`}
          >
            <CardTitle className="text-base font-semibold break-words">
              {task.title}
            </CardTitle>
          </div>

          {/* Settings Cog */}
          <div className="shrink-0 ml-2" data-no-card-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 group-hover/taskcard:opacity-100 transition-opacity">
                  <Settings className="h-4 w-4" />
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
          <CardContent className="p-0 mb-2" onClick={() => onOpenCard(task.id)} style={{cursor: 'pointer'}}>
            <p className="text-sm text-muted-foreground break-words">{task.description}</p>
          </CardContent>
        )}
        {displayDeadline && (
          <div className="flex items-center text-xs text-muted-foreground mt-1" onClick={() => onOpenCard(task.id)} style={{cursor: 'pointer'}}>
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            <span>{displayDeadline}</span>
          </div>
        )}
      </Card>
    </>
  );
}
