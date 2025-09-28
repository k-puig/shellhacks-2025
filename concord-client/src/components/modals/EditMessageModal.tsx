import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Message } from "@/lib/api-client";
import { useEditMessage } from "@/hooks/useMessages";

interface EditMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  channelId: string;
}

export const EditMessageModal: React.FC<EditMessageModalProps> = ({
  isOpen,
  onClose,
  message,
  channelId,
}) => {
  const [content, setContent] = useState(message.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editMessageMutation = useEditMessage();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isOpen) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
    }
  }, [content, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.trim() !== message.text) {
      try {
        await editMessageMutation.mutateAsync({
          messageId: message.id,
          content: content.trim(),
          channelId,
        });
        onClose();
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleCancel = () => {
    setContent(message.text);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-content">Message</Label>
            <textarea
              ref={textareaRef}
              id="message-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-concord-tertiary border border-border rounded-lg px-4 py-3 text-concord-primary placeholder-concord-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              style={{
                minHeight: "100px",
                maxHeight: "300px",
              }}
              disabled={editMessageMutation.isPending}
              required
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to save • Shift+Enter for new line • Escape to cancel
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={editMessageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !content.trim() ||
                content.trim() === message.text ||
                editMessageMutation.isPending
              }
            >
              {editMessageMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
