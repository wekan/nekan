
"use client";

import type { List, Task } from "@/lib/types"; // Changed Column to List
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

interface KanbanListProps { // Changed KanbanColumnProps
  list: List; // Changed column: Column
  tasks: Task[];
  onAddTask: (listId: string) => void; // Changed columnId to listId
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetListId: string, targetTaskId?: string) => void; // Changed targetColumnId to targetListId
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
  onOpenCard: (taskId: string) => void;
  // TODO: Add props for list D&D, delete list, color change
}

export function KanbanList({ // Changed KanbanColumn
  list, // Changed column
  tasks,
  onAddTask,
  onDropTask,
  onDragTaskStart,
  onDragTaskEnd,
  draggingTaskId,
  onOpenCard,
}: KanbanListProps) { // Changed KanbanColumnProps
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
  };

  const listStyle = list.color ? { backgroundColor: list.color } : {}; // Changed columnStyle, column.color


  return (
    <div
      className="flex flex-col w-80 min-w-80 bg-muted/60 rounded-lg shadow-sm h-full"
      style={listStyle} // Changed columnStyle
      onDragOver={handleDragOver}
      onDrop={(e) => onDropTask(e, list.id)} // Changed column.id
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Placeholder for List Drag Handle */}
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" aria-label="Drag list" /> {/* Changed Drag column to Drag list */}
          <h3 className="font-semibold text-lg text-foreground">{list.title} <span className="text-sm text-muted-foreground">({tasks.length})</span></h3> {/* Changed column.title */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alert(`Change color for list ${list.title} (not implemented)`)}> {/* Changed column.title */}
              <Palette className="mr-2 h-4 w-4" />
              Change Color
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => alert(`Edit list ${list.title} (not implemented)`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit List
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert(`Delete list ${list.title} (not implemented)`)} className="text-destructive focus:text-destructive focus:bg-destructive/10"> {/* Changed column.title */}
              <Trash2 className="mr-2 h-4 w-4" />
              Delete List {/* Changed Delete Column */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1 p-3">
        {tasks.length === 0 && (
           <div 
            className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75"
            onDragOver={handleDragOver} 
            onDrop={(e) => onDropTask(e, list.id)} // Changed column.id
          >
            Drop tasks here
          </div>
        )}
        {tasks.map((task) => (
          <div 
            key={task.id}
            onDragOver={handleDragOver} 
            onDrop={(e) => { e.stopPropagation(); onDropTask(e, list.id, task.id);}} // Changed column.id
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
        <Button variant="outline" className="w-full" onClick={() => onAddTask(list.id)}> {/* Changed column.id */}
          <PlusSquare className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
    </div>
  );
}
