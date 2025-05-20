
"use client";

import { Button } from "@/components/ui/button";
import { Wand2, Users, Loader2, Settings, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { languagesData } from "@/lib/languages";
import { useToast } from "@/hooks/use-toast";

interface BoardHeaderProps {
  boardName: string;
  onRankCards: () => void;
  onShareBoard: () => void;
  isRanking: boolean;
}

export function BoardHeader({ boardName, onRankCards, onShareBoard, isRanking }: BoardHeaderProps) {
  const { toast } = useToast();

  const handleSelectLanguage = (langName: string, langTag: string) => {
    toast({
      title: "Language Selected",
      description: `${langName} (${langTag}) selected. Actual translation not yet implemented.`,
    });
  };

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg shadow">
      <h2 className="text-2xl font-bold text-foreground">{boardName}</h2>
      <div className="flex items-center space-x-3">
        <Button onClick={onRankCards} disabled={isRanking}>
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Languages className="mr-2 h-4 w-4" />
                      <span>Change Language</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                      <ScrollArea className="h-[300px]">
                        {Object.entries(languagesData).map(([tag, lang]) => (
                          <DropdownMenuItem
                            key={tag}
                            onSelect={() => handleSelectLanguage(lang.name, lang.tag)}
                          >
                            {lang.name} ({lang.tag})
                          </DropdownMenuItem>
                        ))}
                      </ScrollArea>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  {/* Add other settings menu items here in the future */}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
