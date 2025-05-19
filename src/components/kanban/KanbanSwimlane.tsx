
"use client";

import type { Swimlane, List as ListType, Task } from "@/lib/types";
import { KanbanList } from "./KanbanList";
import { Button } from "@/components/ui/button";
import { Menu, Trash2, Palette, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { AddSwimlaneDialog } from "./AddSwimlaneDialog";

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
  
  onAddSwimlaneBelow: (name: string, referenceSwimlaneId: string) => void;
  onAddSwimlaneFromTemplate: (referenceSwimlaneId: string) => void;

  onSwimlaneDragStart: (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => void;
  onSwimlaneDragEnd: () => void;
  onSwimlaneDragOver?: (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => void; // For board to know hover target
  draggingSwimlaneId: string | null; 
  
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
  onAddSwimlaneBelow,
  onAddSwimlaneFromTemplate,
  onSwimlaneDragStart,
  onSwimlaneDragEnd,
  onSwimlaneDragOver,
  draggingSwimlaneId,
  onListDragStart,
  onListDropOnList,
  onListDropOnSwimlaneArea,
  onListDragEnd,
  draggingListId,
  dropTargetListId,
}: KanbanSwimlaneProps) {
  const swimlaneStyle = swimlane.color ? { backgroundColor: swimlane.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const isCurrentlyDraggingThisSwimlane = draggingSwimlaneId === swimlane.id;
  const isAnySwimlaneBeingDragged = !!draggingSwimlaneId;

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetSwimlaneColor(swimlane.id, event.target.value);
  };

  const triggerColorInput = () => {
    colorInputRef.current?.click();
  };
  
  const handleDragOverListArea = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggingListId) {
        onListDropOnSwimlaneArea(event, swimlane.id);
    }
  };

  const handleDropListOnSwimlaneArea = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation(); 
    if (draggingListId) { 
      onListDropOnSwimlaneArea(event, swimlane.id);
    }
  };

  const handleAddSubmit = (name: string) => {
    onAddSwimlaneBelow(name, swimlane.id);
  };

  const handleAddFromTemplate = () => {
    onAddSwimlaneFromTemplate(swimlane.id);
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
          "flex flex-col p-4 rounded-lg shadow-md border relative transition-all duration-300 ease-in-out",
          isCurrentlyDraggingThisSwimlane ? "opacity-50 ring-2 ring-primary" : "border-border",
          // If this swimlane is NOT the one being dragged, but another swimlane IS being dragged, it should still appear normal
          // The content collapsing logic below will handle its lists area.
        )}
        style={swimlaneStyle}
        onDragOver={(e) => onSwimlaneDragOver && onSwimlaneDragOver(e, swimlane.id)}
      >
        <div className="flex items-center justify-between mb-4"> 
          <div className="flex items-center gap-2 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setAddDialogOpen(true)} data-no-card-click="true" className="h-7 w-7">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Swimlane Below</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-no-card-click="true" className="h-7 w-7">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
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
                "flex items-center gap-2 flex-1 min-w-0 px-2", 
                "cursor-grab" // Title is always draggable
            )}
            draggable={true} 
            onDragStart={(e) => { 
              e.stopPropagation();
              const draggedElement = e.currentTarget as HTMLElement;
              const rect = draggedElement.getBoundingClientRect();
              const xOffset = e.clientX - rect.left;
              const yOffset = e.clientY - rect.top;
              e.dataTransfer.setDragImage(draggedElement, xOffset, yOffset);
              onSwimlaneDragStart(e, swimlane.id); 
            }}
            onDragEnd={onSwimlaneDragEnd}
            aria-label={`Drag swimlane ${swimlane.name}`}
            data-no-card-click="true"
          >
            <h2 className={cn(
                "text-xl font-semibold text-foreground truncate"
             )}>
                {swimlane.name}
            </h2>
          </div>
        </div>

        <div 
          className={cn(
            "flex gap-4 overflow-x-auto pb-2 relative transition-all duration-200 ease-in-out",
            isAnySwimlaneBeingDragged ? "max-h-0 opacity-0 p-0 m-0 border-none min-h-0 overflow-hidden" : "min-h-[150px] opacity-100",
            !isAnySwimlaneBeingDragged && dropTargetListId === `end-of-swimlane-${swimlane.id}` && draggingListId ? "border-2 border-dashed border-primary" : ""
          )}
          onDragOver={handleDragOverListArea}
          onDrop={handleDropListOnSwimlaneArea}
        >
          {!isAnySwimlaneBeingDragged && lists.map((list) => {
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
                  onListDragStart={onListDragStart}
                  onListDropOnList={onListDropOnList}
                  onListDropOnSwimlaneArea={onListDropOnSwimlaneArea} 
                  onListDragEnd={onListDragEnd}
                  draggingListId={draggingListId}
                  dropTargetListId={dropTargetListId}
                />
                {/* Visual cue for dropping list BETWEEN lists - Handled by KanbanList itself now */}
              </React.Fragment>
            );
          })}
          {!isAnySwimlaneBeingDragged && lists.length === 0 && draggingListId && (
            <div className="flex-1 min-w-[200px] border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center text-primary/70 p-4">
              Drop list here
            </div>
           )}
        </div>
      </div>
      <AddSwimlaneDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddSubmit}
        onUseTemplate={handleAddFromTemplate}
      />
    </>
  );
}

