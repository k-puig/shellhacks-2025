import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import { Hash, Volume2, Users, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit, Trash2, Reply, MoreHorizontal } from "lucide-react";
import { useInstanceDetails, useInstanceMembers } from "@/hooks/useServers";
import { useChannelMessages } from "@/hooks/useChannel";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { Message, User } from "@/types/database";
import { MessageProps } from "@/components/message/Message";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  dark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useTheme } from "@/components/theme-provider";

const MessageComponent: React.FC<MessageProps> = ({
  message,
  user,
  currentUser,
  replyTo,
  onEdit,
  onDelete,
  onReply,
  isGrouped,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const isOwnMessage = currentUser?.id === message.userId;
  const { mode } = useTheme();

  return (
    <div
      className={`group relative px-4 hover:bg-concord-secondary/50 transition-colors ${
        isGrouped ? "mt-0 py-0" : "mt-4"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-3">
        {/* Avatar - only show if not grouped */}
        <div className="w-10 flex-shrink-0">
          {!isGrouped && (
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.picture || undefined}
                alt={user.username}
              />
              <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        {/* Message content */}
        <div className="flex-1 min-w-0">
          {/* Reply line and reference */}
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-concord-secondary">
              <div className="w-6 h-3 border-l-2 border-t-2 border-concord-secondary/50 rounded-tl-md ml-2" />
              <span className="font-medium text-concord-primary">
                {replyTo?.user?.nickname || replyTo?.user?.username}
              </span>
              <span className="truncate max-w-xs opacity-75">
                {replyTo.content.replace(/```[\s\S]*?```/g, "[code]")}
              </span>
            </div>
          )}
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

          {/* Message content with markdown */}
          <div className="text-concord-primary leading-relaxed prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <div className="flex flex-row flex-1 max-w-2/3 flex-wrap !bg-transparent">
                      <SyntaxHighlighter
                        PreTag="div"
                        children={String(children).replace(/\n$/, "")}
                        language={match[1]}
                        style={mode === "light" ? solarizedLight : dark}
                        className="!bg-concord-secondary p-2 border-2 concord-border rounded-xl"
                      />
                    </div>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 my-2 italic text-concord-secondary bg-concord-secondary/30 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
                p: ({ children }) => (
                  <p className="my-1 text-concord-primary">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-concord-primary">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-concord-primary">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside my-2 text-concord-primary">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside my-2 text-concord-primary">
                    {children}
                  </ol>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold my-2 text-concord-primary">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold my-2 text-concord-primary">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold my-2 text-concord-primary">
                    {children}
                  </h3>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
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
              <DropdownMenuContent>
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
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  replyingToUser: User | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
  channelName,
  onSendMessage,
  replyingTo,
  onCancelReply,
  replyingToUser,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

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
      formRef.current?.requestSubmit(); // <-- Programmatically submit form
    }
  };

  return (
    <div className="px-4 pb-4">
      {replyingTo && replyingToUser && (
        <div className="mb-2 p-3 bg-concord-secondary rounded-lg border border-b-0 border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 border-l-2 border-t-2 border-concord-secondary/50 rounded-tl-md ml-2" />
              <span className="font-medium text-concord-primary">
                {replyingToUser.nickname || replyingToUser.username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-concord-secondary hover:text-concord-primary"
              onClick={onCancelReply}
            >
              ×
            </Button>
          </div>
          <div className="text-sm text-concord-primary truncate pl-2">
            {replyingTo.content.replace(/```[\s\S]*?```/g, "[code]")}
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName || "channel"}`}
            className="w-full bg-concord-tertiary border border-border rounded-lg px-4 py-3 text-concord-primary placeholder-concord-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{
              minHeight: "44px",
              maxHeight: "200px",
            }}
          />
          <div className="absolute right-3 bottom-3 text-xs text-concord-secondary">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </form>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const { instanceId, channelId } = useParams();
  const { data: instance } = useInstanceDetails(instanceId);
  const categories = instance?.categories;
  const { data: channelMessages } = useChannelMessages(channelId);
  const { toggleMemberList, showMemberList } = useUiStore();
  const { user: currentUser } = useAuthStore();
  const { data: users } = useInstanceMembers(instanceId);

  // State for messages and interactions
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Use sample current user if none exists
  const displayCurrentUser =
    currentUser || users?.find((u) => u.id === "current");

  // Find current channel
  const currentChannel = categories
    ?.flatMap((cat) => cat.channels)
    ?.find((ch) => ch.id === channelId);

  // Update messages when channel messages load
  useEffect(() => {
    if (channelMessages) {
      setMessages(channelMessages.map((msg) => ({ ...msg, replyToId: null })));
    }
  }, [channelMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Require both instanceId and channelId for chat
  if (!instanceId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-concord-primary">
        <div className="text-center text-concord-secondary">
          <h2 className="text-xl font-semibold mb-2 text-concord-primary">
            No Channel Selected
          </h2>
          <p>Select a channel from the sidebar to start chatting.</p>
        </div>
      </div>
    );
  } else if (!channelId || !currentChannel) {
    const existingChannelId = categories
      ?.flatMap((cat) => cat.channels)
      ?.find((channel) => channel.position === 0)?.id;

    if (existingChannelId)
      navigate(`/channels/${instanceId}/${existingChannelId}`);
    else
      return (
        <div className="flex-1 flex items-center justify-center bg-concord-primary">
          <div className="text-center text-concord-secondary">
            <h2 className="text-xl font-semibold mb-2 text-concord-primary">
              No channels exist yet!
            </h2>
            <p>Ask an admin to create a channel</p>
          </div>
        </div>
      );
  }
  const ChannelIcon = currentChannel?.type === "voice" ? Volume2 : Hash;

  // Message handlers
  const handleSendMessage = (content: string) => {
    if (!displayCurrentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      channelId: channelId || "",
      userId: displayCurrentUser.id,
      edited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyTo: replyingTo || null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setReplyingTo(null);
  };

  const handleReply = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyingTo(message);
    }
  };

  const handleEdit = (messageId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit message:", messageId);
  };

  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Group messages by user and time
  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isGrouped =
      prevMessage &&
      prevMessage.userId === message.userId &&
      !message.replyTo && // Don't group replies
      !prevMessage.replyTo && // Don't group if previous was a reply
      new Date(message.createdAt).getTime() -
        new Date(prevMessage.createdAt).getTime() <
        5 * 60 * 1000; // 5 minutes

    acc.push({ ...message, isGrouped });
    return acc;
  }, [] as Message[]);

  return (
    <div className="flex flex-col flex-shrink h-full bg-concord-primary">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-concord bg-concord-secondary">
        <div className="flex items-center space-x-2">
          <ChannelIcon size={20} className="text-concord-secondary" />
          <span className="font-semibold text-concord-primary">
            {currentChannel?.name}
          </span>
          {currentChannel?.description && (
            <>
              <div className="w-px h-4 bg-border" />
              <span className="text-sm text-concord-secondary truncate max-w-xs">
                {currentChannel.description}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 interactive-hover"
          >
            <Pin size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${showMemberList ? "text-interactive-active bg-concord-tertiary" : "interactive-hover"}`}
            onClick={toggleMemberList}
          >
            <Users size={16} />
          </Button>
          <div className="w-40">
            <Input
              placeholder="Search"
              className="h-8 bg-concord-tertiary border-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0">
          {/* Welcome Message */}
          <div className="px-4 py-6 border-b border-concord/50 flex-shrink-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <ChannelIcon size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-concord-primary">
                  Welcome to #{currentChannel?.name}!
                </h3>
              </div>
            </div>
            {currentChannel?.description && (
              <div className="text-concord-secondary bg-concord-secondary/50 p-3 rounded border-l-4 border-primary">
                {currentChannel.description}
              </div>
            )}
          </div>

          <div className="pb-4">
            {/* Messages */}
            {groupedMessages.length > 0 ? (
              <div>
                {groupedMessages.map((message) => {
                  const user = users?.find((u) => u.id === message.userId);
                  const replyToMessage = messages.find(
                    (m) => m.id === message.replyTo?.id,
                  );
                  const replyToUser = replyToMessage?.user;

                  if (!user) return null;
                  return (
                    <MessageComponent
                      key={message.id}
                      message={message}
                      user={user}
                      currentUser={displayCurrentUser}
                      replyTo={replyToMessage}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReply={handleReply}
                      replyToUser={replyToUser}
                      isGrouped={message.isGrouped}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-concord-secondary">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex-shrink-0">
          <MessageInput
            channelName={currentChannel?.name}
            onSendMessage={handleSendMessage}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            replyingToUser={
              replyingTo
                ? users?.find((u) => u.id === replyingTo.userId) || null
                : null
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
