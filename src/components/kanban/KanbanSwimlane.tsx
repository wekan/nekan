
"use client";

import type { Swimlane as SwimlaneType, List as ListType, Task } from "@/lib/types";
import { KanbanList } from "./KanbanList"; // Changed from List to KanbanList
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

interface KanbanSwimlaneProps { // Renamed from SwimlaneProps
  swimlane: SwimlaneType;
  lists: ListType[];
  tasks: Record<string, Task>;
  onOpenCreateTaskForm: (listId: string) => void;
  
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  dropIndicator: { listId: string; beforeTaskId: string | null } | null; 
  onTaskDragOverList: (event: React.DragEvent, targetListId: string, targetTaskId?: string | null) => void; 


  onDeleteSwimlane: (swimlaneId: string) => void;
  onOpenCard: (taskId: string) => void;
  onSetSwimlaneColor: (swimlaneId: string, color: string) => void;
  onSetListColor: (listId: string, color: string) => void;
  onSetTaskColor: (taskId: string, color: string) => void;
  
  onAddSwimlaneBelow: (name: string, referenceSwimlaneId: string) => void;
  onAddSwimlaneFromTemplate: (referenceSwimlaneId: string) => void;

  onSwimlaneDragStart: (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => void;
  onSwimlaneDragEnd: () => void;
  onSwimlaneDragOver: (event: React.DragEvent<HTMLDivElement>, swimlaneId: string) => void; 
  draggingSwimlaneId: string | null; 
  
  onListDragStart: (event: React.DragEvent<HTMLDivElement>, listId: string, sourceSwimlaneId: string) => void;
  onListDropOnList: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetSwimlaneId: string) => void;
  onListDropOnSwimlaneArea: (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => void;
  onListDragEnd: () => void;
  draggingListId: string | null;
  dropTargetListId: string | null;
  onListDragOver: (event: React.DragEvent<HTMLDivElement>, targetListId: string) => void;
  onSwimlaneAreaDragOverForList: (event: React.DragEvent<HTMLDivElement>, targetSwimlaneId: string) => void;
}

export function KanbanSwimlane({ // Renamed from Swimlane
  swimlane,
  lists,
  tasks,
  onOpenCreateTaskForm,
  
  onDropTask,
  onDragTaskStart,
  onDragTaskEnd,
  draggingTaskId,
  dropIndicator,
  onTaskDragOverList,

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
  onListDragOver,
  onSwimlaneAreaDragOverForList,
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
    event.stopPropagation(); 
    if (draggingListId) {
        onSwimlaneAreaDragOverForList(event, swimlane.id);
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

  const listPlaceholderStyle = "w-80 min-w-80 h-full min-h-[150px] bg-background border-2 border-foreground border-dashed rounded-lg opacity-75 mx-1 flex-shrink-0";
  
  const listsToRender = lists.filter(l => l.id !== draggingListId);


  const swimlaneContentDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (onSwimlaneDragOver && draggingSwimlaneId && draggingSwimlaneId !== swimlane.id) {
      onSwimlaneDragOver(e, swimlane.id);
   } else {
       e.preventDefault(); // Important to allow dropping lists onto the swimlane area
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
          "flex flex-col p-4 rounded-lg shadow-md border transition-all duration-300 ease-in-out",
          isCurrentlyDraggingThisSwimlane ? "opacity-50 ring-2 ring-primary" : "border-border",
          // isDropTargetForSwimlane ? "ring-2 ring-primary ring-offset-2" : "" // This was for inter-swimlane drop
        )}
        style={swimlaneStyle}
        onDragOver={swimlaneContentDragOver} // This is for swimlane-on-swimlane
        // onDrop is handled by placeholders in KanbanBoard for swimlane-on-swimlane
      >
        <div className="flex items-center justify-between mb-4"> 
          <div className="flex items-center gap-2 shrink-0"> {/* Container for left-aligned controls */}
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
          
          {/* Draggable Title Area - takes up remaining space and centers title */}
          <div 
            draggable={true} 
            onDragStart={(e) => { 
              // Use the title itself for a cleaner drag image if possible, or the whole header div
              const titleElement = (e.currentTarget as HTMLElement).querySelector('h2');
              const elementToDrag = titleElement || e.currentTarget;
              const rect = elementToDrag.getBoundingClientRect();
              const xOffset = e.clientX - rect.left;
              const yOffset = e.clientY - rect.top; 
              try { // setDragImage can fail in some environments if not careful
                  e.dataTransfer.setDragImage(elementToDrag, xOffset, yOffset);
              } catch (err) {
                  // console.warn("setDragImage failed:", err);
              }
              onSwimlaneDragStart(e, swimlane.id); 
            }}
            onDragEnd={onSwimlaneDragEnd}
            aria-label={`Drag swimlane ${swimlane.name}`}
            data-no-card-click="true"
            className="flex items-center gap-2 flex-1 min-w-0 px-2 cursor-grab" // Changed to flex-1 to allow title to take space
          >
            {/* <GripVertical className="h-5 w-5 text-muted-foreground" /> */}
            <h2 className="text-xl font-semibold text-foreground truncate"> {/* Title is now left-aligned within this flex item */}
                {swimlane.name}
            </h2>
          </div>
          {/* Removed spacer div as title is now left-aligned within its flex container */}
        </div>

        {/* Container for lists */}
        <div 
          className={cn(
            "flex gap-2 overflow-x-auto pb-2 relative transition-all duration-200 ease-in-out",
            isAnySwimlaneBeingDragged ? "max-h-0 opacity-0 p-0 m-0 border-none min-h-0 overflow-hidden" : "min-h-[150px] opacity-100"
          )}
          onDragOver={handleDragOverListArea} // For dropping lists onto the swimlane area
          onDrop={handleDropListOnSwimlaneArea}   // For dropping lists onto the swimlane area
        >
          {!isAnySwimlaneBeingDragged && listsToRender.map((list) => { // Use listsToRender
            const tasksInList = list.taskIds
              .map(taskId => tasks[taskId])
              .filter(Boolean)
              .sort((a,b) => a.order - b.order) as Task[];
            
            // Placeholder for dropping a list *before* this list
            const showListDropPlaceholderBeforeThis = draggingListId && 
                                                      dropTargetListId === list.id && 
                                                      draggingListId !== list.id;
            return (
              <React.Fragment key={list.id}>
                {showListDropPlaceholderBeforeThis && (
                  <div 
                    className={listPlaceholderStyle}
                    onDragOver={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); // Important: stop propagation
                        e.dataTransfer.dropEffect = "move";
                        // Ensure onListDragOver is called to keep dropTargetListId updated
                        if (draggingListId) {
                           onListDragOver(e, list.id); // list.id is the target list *after* this placeholder
                        }
                    }}
                    onDrop={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); // Important: stop propagation
                        if (draggingListId) {
                            onListDropOnList(e, list.id, swimlane.id); // list.id is the target list *after* this placeholder
                        }
                    }}
                  />
                )}
                <KanbanList // Changed from List to KanbanList
                  swimlaneId={swimlane.id}
                  list={list}
                  tasks={tasksInList}
                  onAddTask={onOpenCreateTaskForm}
                  
                  onDropTask={onDropTask}
                  onDragTaskStart={onDragTaskStart} 
                  onDragTaskEnd={onDragTaskEnd} 
                  draggingTaskId={draggingTaskId}
                  dropIndicator={dropIndicator}
                  onTaskDragOverList={onTaskDragOverList}

                  onOpenCard={onOpenCard}
                  onSetListColor={onSetListColor}
                  onSetTaskColor={onSetTaskColor}

                  onListDragStart={onListDragStart}
                  onListDropOnList={onListDropOnList} // This is for dropping list ON another list (handled by placeholder now)
                  onListDropOnSwimlaneArea={onListDropOnSwimlaneArea} 
                  onListDragEnd={onListDragEnd}
                  draggingListId={draggingListId}
                  dropTargetListId={dropTargetListId} 
                  onListDragOver={onListDragOver} // Pass this down so KanbanList can call it
                />
              </React.Fragment>
            );
          })}
          {/* Placeholder for dropping a list at the end of the swimlane */}
          {!isAnySwimlaneBeingDragged && draggingListId && dropTargetListId === `end-of-swimlane-${swimlane.id}` && (
            <div 
                className={listPlaceholderStyle}
                onDragOver={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); // Important: stop propagation
                    if (draggingListId) {
                        // Call the swimlane area drag over to keep the target ID set correctly
                        onSwimlaneAreaDragOverForList(e, swimlane.id);
                    }
                    e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); // Important: stop propagation
                    if (draggingListId) {
                        onListDropOnSwimlaneArea(e, swimlane.id);
                    }
                }}
            />
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
