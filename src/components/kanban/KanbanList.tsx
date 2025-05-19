
"use client";

import type { List, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { PlusSquare, GripVertical, Settings, Trash2, Palette, ArrowDown } from "lucide-react";
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
  list: List;
  swimlaneId: string; // Added to know the source swimlane for D&D
  tasks: Task[];
  onAddTask: (listId: string) => void;
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  onOpenCard: (taskId: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetTaskColor: (taskId: string, color: string) => void;
  // List D&D
  onListDragStart: (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => void;
  onListDropOnList: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => void;
  onListDragEnd: () => void;
  draggingListId: string | null;
  dropTargetListId: string | null;
}

export function KanbanList({
  list,
  swimlaneId,
  tasks,
  onAddTask,
  onDropTask,
  onDragTaskStart,
  onDragTaskEnd,
  draggingTaskId,
  onOpenCard,
  onSetListColor,
  onSetTaskColor,
  onListDragStart,
  onListDropOnList,
  onListDragEnd,
  draggingListId,
  dropTargetListId,
}: KanbanListProps) {
  const listStyle = list.color ? { backgroundColor: list.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetListColor(list.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };

  const handleDragOverList = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggingListId && draggingListId !== list.id) {
      // Logic to indicate drop target (already handled by dropTargetListId state in parent)
    }
  };
  
  const handleDropOnList = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent swimlane's onDrop from firing
    if (draggingListId && draggingListId !== list.id) {
      onListDropOnList(event, list.id, swimlaneId);
    }
  };

  const handleDragOverTaskArea = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    // This is for tasks, onDropTask will handle it.
  };

  const handleDropTaskOnEmptyList = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggingTaskId) { // Only handle task drops here
        onDropTask(event, list.id);
    }
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
        className={cn(
          "flex flex-col w-80 min-w-80 bg-muted/60 rounded-lg shadow-sm h-full relative",
          draggingListId === list.id ? "opacity-50 ring-2 ring-primary" : "",
           (dropTargetListId === list.id || dropTargetListId === `between-${list.id}`) && draggingListId && draggingListId !== list.id ? "border-dashed border-primary border-2" : ""
        )}
        style={listStyle}
        onDragOver={handleDragOverList} // For dropping other lists onto this one
        onDrop={handleDropOnList} // For dropping other lists onto this one
      >
         {/* Drop indicator for lists before this one */}
         {dropTargetListId === list.id && draggingListId && draggingListId !== list.id && (
            <div className="absolute -left-3 top-0 bottom-0 w-2 bg-primary/50 rounded my-1 flex items-center justify-center">
                 <ArrowDown className="h-3 w-3 text-primary-foreground transform -rotate-90"/>
            </div>
        )}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 min-w-0"> {/* Added flex-1 and min-w-0 */}
            <div
              draggable
              onDragStart={(e) => { e.stopPropagation(); onListDragStart(e, list.id, swimlaneId); }}
              onDragEnd={onListDragEnd}
              className="cursor-grab p-1"
              aria-label="Drag list"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </div>
            <h3 className="font-semibold text-lg text-foreground truncate">{list.title} <span className="text-sm text-muted-foreground">({tasks.length})</span></h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <Settings className="h-4 w-4" />
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
            onDragOver={handleDragOverTaskArea} // For tasks being dropped onto the scroll area / empty list
            onDrop={handleDropTaskOnEmptyList} // For tasks being dropped onto empty list area
        >
          {tasks.length === 0 && (
             <div 
              className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75 rounded border border-dashed border-muted-foreground/30"
            >
              Drop tasks here
            </div>
          )}
          {tasks.map((task) => (
            <div 
              key={task.id}
              onDragOver={handleDragOverTaskArea} 
              onDrop={(e) => { e.stopPropagation(); onDropTask(e, list.id, task.id);}} // For tasks being dropped on other tasks
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

