"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface AddSwimlaneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  onUseTemplate: () => void;
}

export function AddSwimlaneDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  onUseTemplate,
}: AddSwimlaneDialogProps) {
  const [swimlaneName, setSwimlaneName] = useState("");
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (swimlaneName.trim()) {
      onSubmit(swimlaneName.trim());
      setSwimlaneName(""); 
      onOpenChange(false); 
    }
  };

  const handleTemplateClick = () => {
    onUseTemplate();
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center">
             <PlusCircle className="me-2 h-5 w-5" /> {t('addSwimlaneDialogTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('addSwimlaneDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="swimlane-name" className="text-start col-span-1">
              {t('name')}
            </Label>
            <Input
              id="swimlane-name"
              value={swimlaneName}
              onChange={(e) => setSwimlaneName(e.target.value)}
              placeholder={t('swimlaneNamePlaceholder')}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-col items-center sm:items-center gap-2">
          <Button onClick={handleSubmit} className="w-full sm:w-auto">{t('add-swimlane')}</Button>
          <div className="text-sm text-muted-foreground my-1">{t('or')}</div>
          <Button variant="outline" onClick={handleTemplateClick} className="w-full sm:w-auto">
            {t('add-template')}
          </Button>
           <DialogClose asChild className="mt-2 sm:mt-0 w-full sm:w-auto">
            <Button type="button" variant="ghost">{t('cancel')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
