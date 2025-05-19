
"use client";

import React, { useState, useEffect, useRef } from "react"; // Added useRef
import type { Task } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, GripVertical, Settings, Trash2, Palette } from "lucide-react";
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
  onDeleteTask?: (taskId: string) => void; // Optional: if delete functionality is added
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd, onOpenCard, onSetTaskColor, onDeleteTask }: TaskCardProps) {
  const [displayDeadline, setDisplayDeadline] = useState<string | undefined>(undefined);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Client-side only effect for date formatting to avoid hydration mismatch
    if (task.deadline) {
      try {
        // Attempt to parse assuming YYYY-MM-DD and then format
        const date = new Date(task.deadline + "T00:00:00"); // Ensure parsing as local date
        if (!isNaN(date.valueOf())) {
            setDisplayDeadline(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
        } else {
            setDisplayDeadline(task.deadline); // Fallback if parsing fails
        }
      } catch (e) {
        setDisplayDeadline(task.deadline); // Fallback for invalid date string
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
    // Prevent card click if the click originated from an element that should not trigger it (like a button or handle)
    if ((e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
      return;
    }
    onOpenCard(task.id);
  };

  return (
    <>
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        value={task.color || '#FFFFFF'} // Default to white if no color
        onChange={handleColorInputChange}
        data-no-card-click="true"
      />
      <Card
        onClick={handleCardClick}
        style={cardStyle}
        className={cn(
          "mb-2 p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer group/taskcard",
          isDragging ? "opacity-50 ring-2 ring-primary scale-105" : "",
          "bg-card" // Ensures default card background if no color is set
        )}
      >
        <CardHeader className="p-0 mb-2 flex flex-row items-center">
          {/* Drag Handle */}
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation(); // Important to prevent card click and other parent handlers
              onDragStart(e, task.id);
            }}
            onDragEnd={onDragEnd}
            className="cursor-grab p-1 shrink-0 mr-2 opacity-70 group-hover/taskcard:opacity-100 transition-opacity"
            aria-label="Drag task"
            data-no-card-click="true"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Card Title */}
          <CardTitle className="text-base font-semibold flex-1 break-words min-w-0"> {/* min-w-0 for proper truncation if needed */}
            {task.title}
          </CardTitle>

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
          <CardContent className="p-0 mb-2">
            <p className="text-sm text-muted-foreground break-words">{task.description}</p>
          </CardContent>
        )}
        {displayDeadline && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            <span>{displayDeadline}</span>
          </div>
        )}
      </Card>
    </>
  );
}
