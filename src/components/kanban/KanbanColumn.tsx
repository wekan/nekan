
"use client";

import type { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { PlusSquare, GripVertical, Settings, Trash2, Palette } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetColumnId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  onOpenCard: (taskId: string) => void;
  // TODO: Add props for column D&D, delete column, color change
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onDropTask,
  onDragTaskStart,
  onDragTaskEnd,
  draggingTaskId,
  onOpenCard,
}: KanbanColumnProps) {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
  };

  const columnStyle = column.color ? { backgroundColor: column.color } : {};


  return (
    <div
      className="flex flex-col w-80 min-w-80 bg-muted/60 rounded-lg shadow-sm h-full"
      style={columnStyle}
      onDragOver={handleDragOver}
      onDrop={(e) => onDropTask(e, column.id)}
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Placeholder for Column Drag Handle */}
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" aria-label="Drag column" />
          <h3 className="font-semibold text-lg text-foreground">{column.title} <span className="text-sm text-muted-foreground">({tasks.length})</span></h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alert(`Change color for column ${column.title} (not implemented)`)}>
              <Palette className="mr-2 h-4 w-4" />
              Change Color
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => alert(`Edit column ${column.title} (not implemented)`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Column
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert(`Delete column ${column.title} (not implemented)`)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1 p-3">
        {tasks.length === 0 && (
           <div 
            className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75"
            onDragOver={handleDragOver} 
            onDrop={(e) => onDropTask(e, column.id)}
          >
            Drop tasks here
          </div>
        )}
        {tasks.map((task) => (
          <div 
            key={task.id}
            onDragOver={handleDragOver} 
            onDrop={(e) => { e.stopPropagation(); onDropTask(e, column.id, task.id);}}
          >
            <TaskCard
              task={task}
              isDragging={draggingTaskId === task.id}
              onDragStart={onDragTaskStart}
              onDragEnd={onDragTaskEnd}
              onOpenCard={onOpenCard}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="p-3 border-t border-border">
        <Button variant="outline" className="w-full" onClick={() => onAddTask(column.id)}>
          <PlusSquare className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
    </div>
  );
}
