
"use client";

import type { Swimlane, List as ListType, Task } from "@/lib/types";
import { KanbanList } from "./KanbanList";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings, Trash2, Palette, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useRef } from 'react';
import { cn } from "@/lib/utils";

interface KanbanSwimlaneProps {
  swimlane: Swimlane;
  lists: ListType[];
  tasks: Record<string, Task>;
  onOpenCreateTaskForm: (listId: string) => void;
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  onDeleteSwimlane: (swimlaneId: string) => void;
  onOpenCard: (taskId: string) => void;
  onSetSwimlaneColor: (swimlaneId: string, color: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetTaskColor: (taskId: string, color: string) => void;

  // Swimlane D&D
  onSwimlaneDragStart: (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => void;
  onSwimlaneDrop: (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => void;
  onSwimlaneDragEnd: () => void;
  draggingSwimlaneId: string | null;
  dropTargetSwimlaneId: string | null;

  // List D&D
  onListDragStart: (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => void;
  onListDropOnList: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => void;
  onListDropOnSwimlaneArea: (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => void;
  onListDragEnd: () => void;
  draggingListId: string | null;
  dropTargetListId: string | null;
}

export function KanbanSwimlane({
  swimlane,
  lists,
  tasks,
  onOpenCreateTaskForm,
  onDropTask,
  onDragTaskStart,
  onDragTaskEnd,
  draggingTaskId,
  onDeleteSwimlane,
  onOpenCard,
  onSetSwimlaneColor,
  onSetListColor,
  onSetTaskColor,
  onSwimlaneDragStart,
  onSwimlaneDrop,
  onSwimlaneDragEnd,
  draggingSwimlaneId,
  dropTargetSwimlaneId,
  onListDragStart,
  onListDropOnList,
  onListDropOnSwimlaneArea,
  onListDragEnd,
  draggingListId,
  dropTargetListId,
}: KanbanSwimlaneProps) {
  const swimlaneStyle = swimlane.color ? { backgroundColor: swimlane.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetSwimlaneColor(swimlane.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };

  const handleDragOverSwimlane = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggingSwimlaneId && draggingSwimlaneId !== swimlane.id) {
      // Visual feedback for drop target is handled by dropTargetSwimlaneId prop
    }
  };

  const handleDropOnSwimlane = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggingSwimlaneId && draggingSwimlaneId !== swimlane.id) {
        onSwimlaneDrop(event, swimlane.id);
    }
  };
  
  const handleDragOverListArea = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Visual feedback handled by dropTargetListId for `end-of-swimlane`
  };

  const handleDropListOnSwimlaneArea = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingListId) { 
      onListDropOnSwimlaneArea(event, swimlane.id);
    }
  };

  return (
    <>
      <input
        type="color"
        ref={colorInputRef}
        style={{ display: 'none' }}
        value={swimlane.color || '#FFFFFF'}
        onChange={handleColorInputChange}
        data-no-card-click="true"
      />
      <div
        className={cn(
          "flex flex-col p-4 rounded-lg shadow-md border relative", // Added relative for drop indicator positioning
          draggingSwimlaneId === swimlane.id ? "opacity-50 ring-2 ring-primary" : "border-border",
          dropTargetSwimlaneId === swimlane.id && draggingSwimlaneId && draggingSwimlaneId !== swimlane.id ? "border-dashed border-primary border-2" : ""
        )}
        style={swimlaneStyle}
        onDragOver={handleDragOverSwimlane}
        onDrop={handleDropOnSwimlane}
      >
         {dropTargetSwimlaneId === swimlane.id && draggingSwimlaneId && draggingSwimlaneId !== swimlane.id && (
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary/50 rounded-t flex items-center justify-center z-10">
            <ArrowDown className="h-3 w-3 text-primary-foreground"/>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              draggable 
              onDragStart={(e) => { e.stopPropagation(); onSwimlaneDragStart(e, swimlane.id); }}
              onDragEnd={onSwimlaneDragEnd}
              className="cursor-grab p-1"
              aria-label="Drag swimlane"
              data-no-card-click="true"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </div>
            <h2 className="text-xl font-semibold text-foreground truncate">{swimlane.name}</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-no-card-click="true" className="shrink-0">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); triggerColorInput(); }}>
                <Palette className="mr-2 h-4 w-4" />
                Change Color
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeleteSwimlane(swimlane.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Swimlane
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div 
          className={cn(
            "flex gap-4 overflow-x-auto pb-2 min-h-[150px] relative", // Added relative for drop indicator
            dropTargetListId === `end-of-swimlane-${swimlane.id}` && draggingListId ? "border-2 border-dashed border-primary" : ""
            )} 
          onDragOver={handleDragOverListArea}
          onDrop={handleDropListOnSwimlaneArea}
        >
          {lists.map((list) => {
            const tasksInList = list.taskIds
              .map(taskId => tasks[taskId])
              .filter(Boolean)
              .sort((a,b) => a.order - b.order) as Task[];
            return (
              <React.Fragment key={list.id}>
                <KanbanList
                  list={list}
                  swimlaneId={swimlane.id} 
                  tasks={tasksInList}
                  onAddTask={onOpenCreateTaskForm}
                  onDropTask={onDropTask}
                  onDragTaskStart={onDragTaskStart} 
                  onDragTaskEnd={onDragTaskEnd} 
                  draggingTaskId={draggingTaskId}
                  onOpenCard={onOpenCard}
                  onSetListColor={onSetListColor}
                  onSetTaskColor={onSetTaskColor}
                  // List D&D Props
                  onListDragStart={onListDragStart}
                  onListDropOnList={onListDropOnList}
                  onListDragEnd={onListDragEnd}
                  draggingListId={draggingListId}
                  dropTargetListId={dropTargetListId}
                />
                {/* Drop indicator for lists between lists */}
                {dropTargetListId === list.id && draggingListId && draggingListId !== list.id && (
                  <div className="w-2 bg-primary/50 rounded mx-1 self-stretch flex items-center justify-center -order-1 relative left-[-12px]"> {/* Ensure it appears before the target list */}
                     <ArrowDown className="h-3 w-3 text-primary-foreground transform -rotate-90"/>
                  </div>
                )}
              </React.Fragment>
            );
          })}
           {lists.length === 0 && draggingListId && ( // Show if swimlane is empty and dragging a list
            <div className="flex-1 min-w-[200px] border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center text-primary/70 p-4">
              Drop list here
            </div>
           )}
        </div>
      </div>
    </>
  );
}
