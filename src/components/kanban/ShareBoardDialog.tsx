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

interface ShareBoardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boardName: string;
}

export function ShareBoardDialog({ isOpen, onOpenChange, boardName }: ShareBoardDialogProps) {
  const [email, setEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState<string[]>(["owner@example.com (You)"]); // Mock
  const { toast } = useToast();

  const handleAddUser = () => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSharedUsers([...sharedUsers, email]);
      toast({
        title: "User Invited (Mock)",
        description: `${email} has been invited to collaborate on ${boardName}.`,
      });
      setEmail("");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> Share "{boardName}"
          </DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this board. This is a mock feature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleAddUser} className="shrink-0">
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Shared with</Label>
            <ul className="max-h-32 overflow-y-auto rounded-md border p-2 text-sm">
              {sharedUsers.map((user, index) => (
                <li key={index} className="py-1 px-2 hover:bg-muted rounded-sm">
                  {user}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
