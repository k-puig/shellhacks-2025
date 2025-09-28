import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash2, Reply, MoreHorizontal } from "lucide-react";
import { Message, User } from "@/types/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageProps {
  message: Message;
  user: any;
  currentUser?: any;
  isGrouped?: boolean | null;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  replyTo?: Message | null;
  replyToUser?: User | null;
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  user,
  currentUser,
  isGrouped = false,
  onEdit,
  onDelete,
  onReply,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const renderContent = (content: string) => {
    // Simple code block detection
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>,
        );
      }

      // Add code block
      const language = match[1] || "text";
      const code = match[2];
      parts.push(
        <div key={match.index} className="my-2">
          <div className="bg-concord-tertiary rounded-md p-3 border border-border">
            <div className="text-xs text-concord-secondary mb-2 font-mono">
              {language}
            </div>
            <pre className="text-sm font-mono text-concord-primary overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        </div>,
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(<span key={lastIndex}>{content.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  const isOwnMessage = currentUser?.id === message.userId;

  return (
    <div
      className={`group relative px-4 py-2 hover:bg-concord-secondary/50 transition-colors ${
        isGrouped ? "mt-0.5" : "mt-4"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-3">
        {/* Avatar - only show if not grouped */}
        <div className="w-10 flex-shrink-0">
          {!isGrouped && <Avatar user={user} size="md" showStatus={true} />}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* Header - only show if not grouped */}
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-concord-primary">
                {user.nickname || user.username}
              </span>
              <span className="text-xs text-concord-secondary">
                {formatTimestamp(message.createdAt)}
              </span>
            </div>
          )}

          {/* Message content */}
          <div className="text-concord-primary leading-relaxed">
            {renderContent(message.content)}
          </div>

          {/* Reactions */}
        </div>

        {/* Message actions */}
        {isHovered && (
          <div className="absolute top-0 right-4 bg-concord-secondary border border-border rounded-md shadow-md flex">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 interactive-hover"
              onClick={() => onReply?.(message.id)}
            >
              <Reply className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 interactive-hover"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(message.content)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </DropdownMenuItem>
                {isOwnMessage && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(message.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(message.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Message
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

// Message Input Component
interface MessageInputProps {
  channelName?: string;
  onSendMessage: (content: string) => void;
  replyingTo?: Message;
  onCancelReply?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  channelName,
  onSendMessage,
  replyingTo,
  onCancelReply,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-4 pb-4">
      {replyingTo && (
        <div className="mb-2 p-2 bg-concord-tertiary rounded-t-lg border border-b-0 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-concord-secondary">
              Replying to {replyingTo.userId}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1"
              onClick={onCancelReply}
            >
              ×
            </Button>
          </div>
          <div className="text-sm text-concord-primary truncate">
            {replyingTo.content}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName || "channel"}`}
            className="w-full bg-concord-tertiary border border-border rounded-lg px-4 py-3 text-concord-primary placeholder-concord-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={1}
            style={{
              minHeight: "44px",
              maxHeight: "200px",
              resize: "none",
            }}
          />
          <div className="absolute right-3 bottom-3 text-xs text-concord-secondary">
            Press Enter to send
          </div>
        </div>
      </form>
    </div>
  );
};

export { type MessageProps, MessageComponent, MessageInput };
