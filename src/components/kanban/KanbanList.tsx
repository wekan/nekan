
"use client";

import type { List as ListType, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard"; // Changed from Card to TaskCard
import { Button } from "@/components/ui/button";
import { PlusSquare, Menu, Trash2, Palette } from "lucide-react";
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

interface KanbanListProps { // Renamed from ListProps
  list: ListType;
  swimlaneId: string;
  tasks: Task[];
  onAddTask: (listId: string) => void;
  
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  dropIndicator: { listId: string; beforeTaskId: string | null } | null;
  onTaskDragOverList: (event: React.DragEvent, targetListId: string, targetTaskId?: string | null) => void; 

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

export function KanbanList({ // Renamed from List
  list,
  swimlaneId,
  tasks,
  onAddTask,
  
  onDropTask,
  onDragTaskStart, // Prop name for starting task drag
  onDragTaskEnd,   // Prop name for ending task drag
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
          draggingListId === list.id ? "opacity-50 ring-2 ring-primary" : ""
        )}
        style={listStyle}
        onDragOver={(e) => {
          if (draggingListId && draggingListId !== list.id) { 
            onListDragOver(e, list.id); 
          } else if (draggingTaskId) { 
             onTaskDragOverList(e, list.id, undefined); // Drop at end of list if no target task
          } else {
            e.preventDefault(); 
          }
        }}
        // onDrop is handled by placeholders or ScrollArea for dropping tasks
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div 
            className="flex items-center gap-1 flex-1 min-w-0 cursor-grab"
            draggable
            onDragStart={(e) => { 
                // e.stopPropagation(); // Keep stopPropagation here if needed
                onListDragStart(e, list.id, swimlaneId); 
            }}
            onDragEnd={onListDragEnd}
            aria-label={`Drag list ${list.title}`}
            data-no-card-click="true" 
          >
            {/* <GripVertical className="h-5 w-5 text-muted-foreground" /> */}
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
            onDragOver={(e) => { // Handles dropping task at the end or in empty list
              if (draggingTaskId) {
                onTaskDragOverList(e, list.id, null); 
              }
            }}
            onDrop={(e) => { // Handles dropping task at the end or in empty list
                 if (draggingTaskId && dropIndicator?.listId === list.id && dropIndicator?.beforeTaskId === null) {
                    onDropTask(e, list.id, undefined); // undefined for targetTaskId means end of list
                 } else {
                    e.preventDefault(); // Prevent default if not the intended drop target for end-of-list
                 }
            }}
        >
          {/* Placeholder for empty list or when dragging to the end of a list */}
          {tasks.length === 0 && draggingTaskId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeTaskId === null && (
            <div
              className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
              // onDragOver for this specific placeholder is important
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onTaskDragOverList(e, list.id, null); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDropTask(e, list.id, undefined)} // Drop at the end (or in empty list)
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
              {/* Placeholder for dropping a task *before* an existing task */}
              {draggingTaskId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeTaskId === task.id && (
                <div
                  className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
                  // onDragOver for this specific placeholder is important
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onTaskDragOverList(e, list.id, task.id); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => onDropTask(e, list.id, task.id)} // Drop before this task
                />
              )}
              <div 
                // This div wrapping TaskCard is crucial for onTaskDragOverList to correctly identify targetTaskId
                onDragOver={(e) => { // This div ensures dragOver for specific task positioning is caught
                  if (draggingTaskId && draggingTaskId !== task.id) { // Don't trigger for the task being dragged itself
                    onTaskDragOverList(e, list.id, task.id);
                  } else {
                     e.preventDefault(); // Prevent default for other cases to allow dropping on the list itself
                  }
                }}
              >
                <TaskCard // Changed from Card to TaskCard
                  task={task}
                  isDragging={draggingTaskId === task.id}
                  onDragStart={onDragTaskStart} // Pass the prop directly
                  onDragEnd={onDragTaskEnd}     // Pass the prop directly
                  onOpenCard={onOpenCard}
                  onSetTaskColor={onSetTaskColor}
                  // onDeleteTask can be added here if needed
                />
              </div>
            </React.Fragment>
          ))}

          {/* Placeholder for dropping at the end of the list if it has tasks, and not already handled by ScrollArea's drop */}
          {/* This specific case might be redundant if ScrollArea's onDrop handles it, but can be a fallback */}
          {tasks.length > 0 && draggingTaskId && dropIndicator && dropIndicator.listId === list.id && dropIndicator.beforeTaskId === null && 
           !tasks.find(t => dropIndicator.beforeTaskId === t.id) && ( // Ensure not to show if a 'beforeTask' matches (already handled above)
            <div
              className="h-12 bg-background border-2 border-foreground border-dashed rounded-md my-1 opacity-75"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onTaskDragOverList(e, list.id, null); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDropTask(e, list.id, undefined)} // Drop at the end
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
