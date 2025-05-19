
"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, GripVertical } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd }: TaskCardProps) {
  // Initialize with task.deadline (raw string) or undefined if no deadline.
  // This ensures server and client initial render match.
  const [displayDeadline, setDisplayDeadline] = useState<string | undefined>(task.deadline);

  useEffect(() => {
    if (task.deadline) {
      // This part runs only on the client after hydration.
      // Parse "YYYY-MM-DD" to create a date object based on local time components.
      const parts = task.deadline.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      setDisplayDeadline(date.toLocaleDateString());
    } else {
      setDisplayDeadline(undefined); // Reset if task.deadline is removed/undefined
    }
  }, [task.deadline]); // Rerun if task.deadline changes

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`mb-2 p-3 shadow-md hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 ring-2 ring-primary" : ""
      } bg-card`}
    >
      <CardHeader className="p-0 mb-2 flex flex-row items-start justify-between">
        <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
        <GripVertical className="h-5 w-5 text-muted-foreground self-center" />
      </CardHeader>
      {task.description && (
        <CardContent className="p-0 mb-2">
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </CardContent>
      )}
      {/* Rendered with displayDeadline, which is task.deadline on server & client initial, then locale string on client after effect */}
      {displayDeadline && (
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1" />
          <span>{displayDeadline}</span>
        </div>
      )}
    </Card>
  );
}
