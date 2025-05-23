"use client"; 

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Atom } from "lucide-react"; 
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border shadow-sm sticky top-0 bg-background z-10">
        <div className="container mx-auto flex items-center">
          <Atom className="h-8 w-8 text-primary me-2" />
          <h1 className="text-3xl font-bold text-primary">{t('appTitle')}</h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
        <div className="container mx-auto h-full">
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}
