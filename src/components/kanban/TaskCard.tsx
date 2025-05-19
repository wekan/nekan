"use client";

import type { Task } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, GripVertical } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd }: TaskCardProps) {
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
      {task.deadline && (
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1" />
          <span>{new Date(task.deadline).toLocaleDateString()}</span>
        </div>
      )}
    </Card>
  );
}
