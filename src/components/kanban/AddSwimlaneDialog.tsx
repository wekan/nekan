
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

  const handleSubmit = () => {
    if (swimlaneName.trim()) {
      onSubmit(swimlaneName.trim());
      setSwimlaneName(""); // Reset name
      onOpenChange(false); // Close dialog
    }
  };

  const handleTemplateClick = () => {
    onUseTemplate();
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center">
             <PlusCircle className="mr-2 h-5 w-5" /> Add New Swimlane
          </DialogTitle>
          <DialogDescription>
            Enter a name for the new swimlane or choose a template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="swimlane-name" className="text-right col-span-1">
              Name
            </Label>
            <Input
              id="swimlane-name"
              value={swimlaneName}
              onChange={(e) => setSwimlaneName(e.target.value)}
              placeholder="E.g., Sprint Goals"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-col items-center sm:items-center gap-2">
          <Button onClick={handleSubmit} className="w-full sm:w-auto">Add Swimlane</Button>
          <div className="text-sm text-muted-foreground my-1">or</div>
          <Button variant="outline" onClick={handleTemplateClick} className="w-full sm:w-auto">
            Use Template
          </Button>
           <DialogClose asChild className="mt-2 sm:mt-0 w-full sm:w-auto">
            <Button type="button" variant="ghost">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
