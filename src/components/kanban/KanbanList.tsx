
"use client";

import type { List, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { PlusSquare, Menu, Trash2, Palette, ArrowDown } from "lucide-react"; 
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
  swimlaneId: string;
  tasks: Task[];
  onAddTask: (listId: string) => void;
  
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  dropIndicator: { listId: string; beforeTaskId: string | null } | null;
  onTaskDragOverList: (event: React.DragEvent, targetListId: string, targetTaskId?: string) => void;

  onOpenCard: (taskId: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetTaskColor: (taskId: string, color: string) => void;
  onListDragStart: (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => void;
  onListDropOnList: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => void;
  onListDragEnd: () => void;
  draggingListId: string | null;
  dropTargetListId: string | null;
  onListDragOver: (event: React.DragEvent<HTMLDivElement>, targetListId: string) => void; 
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
  dropIndicator,
  onTaskDragOverList,

  onOpenCard,
  onSetListColor,
  onSetTaskColor,
  onListDragStart,
  onListDropOnList,
  onListDragEnd,
  draggingListId,
  dropTargetListId,
  onListDragOver, 
}: KanbanListProps) {
  const listStyle = list.color ? { backgroundColor: list.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetListColor(list.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };

  const handleDragOverListItself = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingListId && draggingListId !== list.id) {
      onListDragOver(event, list.id); 
    }
  };
  
  const handleDropOnListItself = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingListId && draggingListId !== list.id) {
      onListDropOnList(event, list.id, swimlaneId);
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
        data-no-card-click="true"
      />
      <div
        className={cn(
          "flex flex-col w-80 min-w-80 bg-muted/60 rounded-lg shadow-sm h-full relative",
          draggingListId === list.id ? "opacity-50 ring-2 ring-primary" : "",
           (dropTargetListId === list.id) && draggingListId && draggingListId !== list.id ? "border-dashed border-primary border-2" : ""
        )}
        style={listStyle}
        onDragOver={handleDragOverListItself}
        onDrop={handleDropOnListItself}
      >
         {dropTargetListId === list.id && draggingListId && draggingListId !== list.id && (
            <div className="absolute -left-3 top-0 bottom-0 w-2 bg-primary/50 rounded my-1 flex items-center justify-center">
                 <ArrowDown className="h-3 w-3 text-primary-foreground transform -rotate-90"/>
            </div>
        )}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div 
            className="flex items-center gap-1 flex-1 min-w-0 cursor-grab"
            draggable
            onDragStart={(e) => { 
                onListDragStart(e, list.id, swimlaneId); 
            }}
            onDragEnd={onListDragEnd}
            aria-label={`Drag list ${list.title}`}
          >
            <h3 className="font-semibold text-lg text-foreground truncate">{list.title} <span className="text-sm text-muted-foreground">({tasks.length})</span></h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" data-no-card-click="true">
                <Menu className="h-4 w-4" /> 
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
            onDragOver={(e) => {
              if (draggingTaskId) {
                onTaskDragOverList(e, list.id, undefined); // Pass undefined for targetTaskId to signify end of list or empty
              }
            }}
        >
          {tasks.length === 0 && draggingTaskId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeTaskId === null && (
            <div
              className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDropTask(e, list.id, undefined)}
            />
          )}
          {tasks.length === 0 && !draggingTaskId && (
             <div 
              className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75 rounded border border-dashed border-muted-foreground/30"
            >
              Drop tasks here or add new
            </div>
          )}

          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              {draggingTaskId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeTaskId === task.id && (
                <div
                  className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => onDropTask(e, list.id, task.id)}
                />
              )}
              <div 
                onDragOver={(e) => {
                  if (draggingTaskId) {
                    onTaskDragOverList(e, list.id, task.id);
                  }
                }}
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
            </React.Fragment>
          ))}

          {tasks.length > 0 && draggingTaskId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeTaskId === null && (
            <div
              className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDropTask(e, list.id, undefined)}
            />
          )}
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
