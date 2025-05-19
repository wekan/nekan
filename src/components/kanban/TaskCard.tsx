
"use client";

import { useState, useEffect } from "react";
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
  // TODO: Add props for delete task, color change
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd, onOpenCard }: TaskCardProps) {
  const [displayDeadline, setDisplayDeadline] = useState<string | undefined>(task.deadline);

  useEffect(() => {
    if (task.deadline) {
      const parts = task.deadline.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; 
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const date = new Date(year, month, day);
          setDisplayDeadline(date.toLocaleDateString());
        } else {
           setDisplayDeadline(task.deadline); // Fallback for invalid date string
        }
      } else {
        setDisplayDeadline(task.deadline); // Fallback for invalid format
      }
    } else {
      setDisplayDeadline(undefined);
    }
  }, [task.deadline]);

  const cardStyle = task.color ? { backgroundColor: task.color } : {};

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent opening card if cog button or drag handle was clicked
    if ((e.target as HTMLElement).closest('[data-no-card-click="true"]')) {
      return;
    }
    onOpenCard(task.id);
  };

  return (
    <Card
      onClick={handleCardClick}
      style={cardStyle}
      className={cn(
        "mb-2 p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer",
        isDragging ? "opacity-50 ring-2 ring-primary" : "",
        "bg-card" // Ensure default bg-card is applied and can be overridden by inline style
      )}
    >
      <CardHeader className="p-0 mb-2 flex flex-row items-start justify-between">
        <CardTitle className="text-base font-semibold mr-2 flex-1 break-words">{task.title}</CardTitle>
        <div className="flex items-center shrink-0" data-no-card-click="true">
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation(); // Prevent card click from firing
              onDragStart(e, task.id);
            }}
            onDragEnd={onDragEnd}
            className="cursor-grab p-1"
            aria-label="Drag task"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert(`Change color for task ${task.title} (not implemented)`); }}>
                <Palette className="mr-2 h-4 w-4" />
                Change Color
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert(`Edit task ${task.title} (not implemented)`); }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert(`Delete task ${task.title} (not implemented)`); }} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
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
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1" />
          <span>{displayDeadline}</span>
        </div>
      )}
    </Card>
  );
}
