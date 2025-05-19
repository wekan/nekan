
"use client";

import type { List, Task } from "@/lib/types";
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
import React, { useRef } from 'react';

interface KanbanListProps {
  list: List;
  tasks: Task[];
  onAddTask: (listId: string) => void;
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  onOpenCard: (taskId: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetTaskColor: (taskId: string, color: string) => void;
}

export function KanbanList({
  list,
  tasks,
  onAddTask,
  onDropTask,
  onDragTaskStart,
  onDragTaskEnd,
  draggingTaskId,
  onOpenCard,
  onSetListColor,
  onSetTaskColor,
}: KanbanListProps) {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
  };

  const listStyle = list.color ? { backgroundColor: list.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetListColor(list.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };

  return (
    <>
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        value={list.color || '#FFFFFF'}
        onChange={handleColorInputChange}
      />
      <div
        className="flex flex-col w-80 min-w-80 bg-muted/60 rounded-lg shadow-sm h-full"
        style={listStyle}
        onDragOver={handleDragOver}
        onDrop={(e) => onDropTask(e, list.id)}
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" aria-label="Drag list" />
            <h3 className="font-semibold text-lg text-foreground">{list.title} <span className="text-sm text-muted-foreground">({tasks.length})</span></h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={triggerColorInput}>
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
        <ScrollArea className="flex-1 p-3">
          {tasks.length === 0 && (
             <div 
              className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75"
              onDragOver={handleDragOver} 
              onDrop={(e) => onDropTask(e, list.id)}
            >
              Drop tasks here
            </div>
          )}
          {tasks.map((task) => (
            <div 
              key={task.id}
              onDragOver={handleDragOver} 
              onDrop={(e) => { e.stopPropagation(); onDropTask(e, list.id, task.id);}}
            >
              <TaskCard
                task={task}
                isDragging={draggingTaskId === task.id}
                onDragStart={onDragTaskStart}
                onDragEnd={onDragTaskEnd}
                onOpenCard={onOpenCard}
                onSetTaskColor={onSetTaskColor}
              />
            </div>
          ))}
        </ScrollArea>
        <div className="p-3 border-t border-border">
          <Button variant="outline" className="w-full" onClick={() => onAddTask(list.id)}>
            <PlusSquare className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>
    </>
  );
}
