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
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface ShareBoardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boardName: string;
}

export function ShareBoardDialog({ isOpen, onOpenChange, boardName }: ShareBoardDialogProps) {
  const [email, setEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState<string[]>(["owner@example.com (You)"]); // Mock
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAddUser = () => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSharedUsers([...sharedUsers, email]);
      toast({
        title: t('toastUserInvitedTitle'),
        description: t('toastUserInvitedDescription', { email, boardName }),
      });
      setEmail("");
    } else {
      toast({
        variant: "destructive",
        title: t('toastInvalidEmailTitle'),
        description: t('toastInvalidEmailDescription'),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="me-2 h-5 w-5" /> {t('shareBoardDialogTitle', { boardName })}
          </DialogTitle>
          <DialogDescription>
            {t('shareBoardDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email-addresses')}</Label>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleAddUser} className="shrink-0">
                <UserPlus className="me-2 h-4 w-4" /> {t('addUserButton')}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('sharedWithLabel')}</Label>
            <ul className="max-h-32 overflow-y-auto rounded-md border p-2 text-sm">
              {sharedUsers.map((user, index) => (
                <li key={index} className="py-1 px-2 hover:bg-muted rounded-sm">
                  {user === "owner@example.com (You)" ? t('owner') + ` (${t('youSuffix', {defaultValue: 'You'})})` : user}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('done')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
