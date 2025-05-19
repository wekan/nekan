"use client";

import type { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onDropTask: (event: React.DragEvent<HTMLDivElement>, targetColumnId: string, targetTaskId?: string) => void;
  onDragTaskStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragTaskEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  draggingTaskId: string | null;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onDropTask,
  onDragTaskStart,
  onDragTaskEnd,
  draggingTaskId,
}: KanbanColumnProps) {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div
      className="flex flex-col w-80 min-w-80 bg-muted/50 rounded-lg shadow-sm h-full"
      onDragOver={handleDragOver}
      onDrop={(e) => onDropTask(e, column.id)}
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg text-foreground">{column.title} <span className="text-sm text-muted-foreground">({tasks.length})</span></h3>
      </div>
      <ScrollArea className="flex-1 p-3">
        {tasks.length === 0 && (
           <div 
            className="flex-1 min-h-[100px] flex items-center justify-center text-muted-foreground opacity-75"
            // This div needs to be a drop target too for empty columns
            onDragOver={handleDragOver} 
            onDrop={(e) => onDropTask(e, column.id)}
          >
            Drop tasks here
          </div>
        )}
        {tasks.map((task) => (
          <div 
            key={task.id}
            onDragOver={handleDragOver} // Allow dropping onto task card for reordering
            onDrop={(e) => { e.stopPropagation(); onDropTask(e, column.id, task.id);}} // Stop propagation to prevent column drop
          >
            <TaskCard
              task={task}
              isDragging={draggingTaskId === task.id}
              onDragStart={onDragTaskStart}
              onDragEnd={onDragTaskEnd}
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
