import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, X, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Message } from "@/types/database";
import { usePinnedMessages, usePinMessage } from "@/hooks/useMessages";

interface PinnedMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
  canManagePins: boolean;
}

export const PinnedMessagesModal: React.FC<PinnedMessagesModalProps> = ({
  isOpen,
  onClose,
  channelId,
  channelName,
  canManagePins,
}) => {
  const { data: pinnedMessages, isLoading } = usePinnedMessages(channelId);
  const pinMessageMutation = usePinMessage();

  const handleUnpin = async (messageId: string) => {
    try {
      await pinMessageMutation.mutateAsync({
        messageId,
        channelId,
        pinned: false,
      });
    } catch (error) {
      console.error("Failed to unpin message:", error);
    }
  };

  const handleJumpToMessage = (messageId: string) => {
    // TODO: Implement jumping to message in chat
    console.log("Jumping to message:", messageId);
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] sm:max-h-[70vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pin className="h-5 w-5" />
              Pinned Messages in #{channelName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] sm:max-h-[70vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Pinned Messages in #{channelName}
          </DialogTitle>
        </DialogHeader>

        {!pinnedMessages || pinnedMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Pin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pinned messages yet</p>
            <p className="text-sm">
              Pin important messages to keep them accessible
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-4">
              {pinnedMessages.map((message) => (
                <div
                  key={message.id}
                  className="border border-border rounded-lg p-4 bg-concord-secondary/50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.user?.picture || undefined} />
                      <AvatarFallback className="text-xs">
                        {message.user?.userName?.slice(0, 2).toUpperCase() ||
                          "??"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.user?.nickName ||
                            message.user?.userName ||
                            "Unknown User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="text-sm text-concord-primary leading-relaxed break-words">
                        {message.content}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleJumpToMessage(message.id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      {canManagePins && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleUnpin(message.id)}
                          disabled={pinMessageMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
