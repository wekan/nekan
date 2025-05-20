
"use client";

import { Button } from "@/components/ui/button";
import { Wand2, Users, Loader2, PlusCircle } from "lucide-react";

interface BoardHeaderProps {
  boardName: string;
  onRankTasks: () => void; // This will be onRankCards effectively from KanbanBoard
  onShareBoard: () => void;
  onAddSwimlane: () => void;
  isRanking: boolean;
}

export function BoardHeader({ boardName, onRankTasks, onShareBoard, onAddSwimlane, isRanking }: BoardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg shadow">
      <h2 className="text-2xl font-bold text-foreground">{boardName}</h2>
      <div className="flex items-center space-x-3">
        <Button onClick={onAddSwimlane}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Swimlane
        </Button>
        <Button onClick={onRankTasks} disabled={isRanking}>
          {isRanking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          AI Rank Cards
        </Button>
        <Button variant="outline" onClick={onShareBoard}>
          <Users className="mr-2 h-4 w-4" /> Share Board
        </Button>
      </div>
    </div>
  );
}
