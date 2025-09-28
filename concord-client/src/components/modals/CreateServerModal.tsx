import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateInstance } from "@/hooks/useServers";

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  const createInstanceMutation = useCreateInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createInstanceMutation.mutateAsync({
        name: name.trim(),
        icon: icon.trim() || undefined,
      });

      // Reset form
      setName("");
      setIcon("");
      onClose();
    } catch (error) {
      console.error("Failed to create server:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name</Label>
            <Input
              id="server-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Server"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server-icon">Server Icon URL (optional)</Label>
            <Input
              id="server-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://example.com/icon.png"
              type="url"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createInstanceMutation.isPending}
            >
              {createInstanceMutation.isPending
                ? "Creating..."
                : "Create Server"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
