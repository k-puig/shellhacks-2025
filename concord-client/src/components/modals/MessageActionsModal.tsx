import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Reply } from "lucide-react";
import { Message } from "@/lib/api-client";

interface MessageActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  isOwnMessage: boolean;
  onReply?: (messageId: string) => void;
}

export const MessageActionsModal: React.FC<MessageActionsModalProps> = ({
  isOpen,
  onClose,
  message,
  onReply,
}) => {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Message Actions</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleAction(() => onReply?.(message.id))}
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() =>
              handleAction(() => navigator.clipboard.writeText(message.text))
            }
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
