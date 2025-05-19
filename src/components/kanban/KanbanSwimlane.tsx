
"use client";

import type { Swimlane, List as ListType, Task } from "@/lib/types";
import { KanbanList } from "./KanbanList";
import { Button } from "@/components/ui/button";
import { GripVertical, Settings, Trash2, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useRef } from 'react';

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
}: KanbanSwimlaneProps) {
  const swimlaneStyle = swimlane.color ? { backgroundColor: swimlane.color } : {};
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSetSwimlaneColor(swimlane.id, event.target.value);
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
        value={swimlane.color || '#FFFFFF'}
        onChange={handleColorInputChange}
      />
      <div
        className="flex flex-col p-4 rounded-lg shadow-md border border-border"
        style={swimlaneStyle}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" aria-label="Drag swimlane" />
            <h2 className="text-xl font-semibold text-foreground">{swimlane.name}</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={triggerColorInput}>
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
        <div className="flex gap-4 overflow-x-auto pb-2">
          {lists.map(list => {
            const tasksInList = list.taskIds
              .map(taskId => tasks[taskId])
              .filter(Boolean)
              .sort((a,b) => a.order - b.order) as Task[];
            return (
              <KanbanList
                key={list.id}
                list={list}
                tasks={tasksInList}
                onAddTask={onOpenCreateTaskForm}
                onDropTask={onDropTask}
                onDragTaskStart={onDragTaskStart}
                onDragTaskEnd={onDragTaskEnd}
                draggingTaskId={draggingTaskId}
                onOpenCard={onOpenCard}
                onSetListColor={onSetListColor}
                onSetTaskColor={onSetTaskColor}
              />
            );
          })}
          {/* Placeholder for Add List Button within a swimlane */}
          {/* <Button variant="outline" className="min-w-80 h-12 self-start">Add List</Button> */}
        </div>
      </div>
    </>
  );
}
