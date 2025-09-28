import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash2, Pin, Reply } from "lucide-react";
import { Message } from "@/lib/api-client";

interface MessageActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  isOwnMessage: boolean;
  canDelete: boolean; // For mods/admins
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
}

export const MessageActionsModal: React.FC<MessageActionsModalProps> = ({
  isOpen,
  onClose,
  message,
  isOwnMessage,
  canDelete,
  onEdit,
  onDelete,
  onReply,
  onPin,
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

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => handleAction(() => onPin?.(message.id))}
          >
            <Pin className="h-4 w-4 mr-2" />
            Pin Message
          </Button>

          {isOwnMessage && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleAction(() => onEdit?.(message.id))}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Message
            </Button>
          )}

          {(isOwnMessage || canDelete) && (
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => handleAction(() => onDelete?.(message.id))}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Message
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
