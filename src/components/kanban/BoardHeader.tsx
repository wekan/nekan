"use client";

import { Button } from "@/components/ui/button";
import { Wand2, Users, Loader2, Settings, Languages, Plus } from "lucide-react";
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
import { useTranslation, type LanguageCode } from "@/lib/i18n";

interface BoardHeaderProps {
  boardName: string;
  onRankCards: () => void;
  onShareBoard: () => void;
  isRanking: boolean;
}

export function BoardHeader({ boardName, onRankCards, onShareBoard, isRanking }: BoardHeaderProps) {
  const { toast } = useToast();
  const { t, setLanguage, language: currentLanguage } = useTranslation();

  const handleSelectLanguage = (langName: string, langTag: string, langCode: LanguageCode) => {
    setLanguage(langCode); // Update language in context
    toast({
      title: t('languageSelectedToastTitle'),
      description: t('languageSelectedToastDescription', { langName, langTag }),
    });
  };

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg shadow">
      <h2 className="text-2xl font-bold text-foreground">{boardName}</h2>
      <div className="flex items-center space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onRankCards} disabled={isRanking}>
                {isRanking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {t('aiRankCardsButton')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('aiRankCardsTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onShareBoard}>
                <Users className="mr-2 h-4 w-4" /> {t('shareBoardButton')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('shareBoardTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">{t('settings')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Languages className="mr-2 h-4 w-4" />
                      <span>{t('changeLanguagePopup-title')}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                      <ScrollArea className="h-[300px]">
                        {Object.entries(languagesData).map(([tag, lang]) => (
                          <DropdownMenuItem
                            key={tag}
                            onSelect={() => handleSelectLanguage(lang.name, lang.tag, lang.code as LanguageCode)}
                            disabled={lang.code === currentLanguage}
                          >
                            {lang.name} ({lang.tag}) {lang.rtl && "(RTL)"}
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
              <p>{t('settings')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
