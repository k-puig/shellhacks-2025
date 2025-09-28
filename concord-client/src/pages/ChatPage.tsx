import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import {
  Hash,
  Volume2,
  Users,
  Pin,
  MoreHorizontal,
  Reply,
  Plus,
} from "lucide-react";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  dark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useTheme } from "@/components/theme-provider";

// Updated imports for API integration
import { useInstanceDetails, useInstanceMembers } from "@/hooks/useServers";
import {
  useChannelMessages,
  useLoadMoreMessages,
  useSendMessage,
} from "@/hooks/useMessages";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { Message } from "@/lib/api-client";

// Modal imports
import { MessageActionsModal } from "@/components/modals/MessageActionsModal";

// User type for message component
interface MessageUser {
  id: string;
  username?: string;
  userName?: string;
  nickname?: string | null;
  nickName?: string | null;
  picture?: string | null;
}

// Message Props interface
interface MessageProps {
  message: Message;
  user: MessageUser;
  currentUser: any;
  replyTo?: Message;
  replyToUser?: MessageUser;
  onReply?: (messageId: string) => void;
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  user,
  currentUser,
  replyTo,
  replyToUser,
  onReply,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    try {
      // First try parsing as ISO string
      let date = parseISO(timestamp);

      // If that fails, try regular Date constructor
      if (!isValid(date)) {
        date = new Date(timestamp);
      }

      // Final check if date is valid
      if (!isValid(date)) {
        console.error("Invalid timestamp:", timestamp);
        return "Invalid date";
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting timestamp:", timestamp, error);
      return "Invalid date";
    }
  };
  const isOwnMessage = currentUser?.id === message.userId;
  const { mode } = useTheme();

  // Get username with fallback
  const username = user.username || user.userName || "Unknown User";
  const displayName = user.nickname || user.nickName || username;

  const isDeleted = message.deleted;

  if (isDeleted) {
    return (
      <div className="px-4 py-2 opacity-50">
        <div className="flex gap-3">
          <div className="w-10 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-concord-secondary italic border border-border rounded px-3 py-2 bg-concord-tertiary/50">
              This message has been deleted
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="group relative px-4 py-2 hover:bg-concord-secondary/50 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-3">
          {/* Avatar - always show */}
          <div className="w-10 flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.picture || undefined} alt={username} />
              <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            {/* Reply line and reference */}
            {replyTo && replyToUser && (
              <div className="flex items-center gap-2 mb-2 text-xs text-concord-secondary">
                <div className="w-6 h-3 border-l-2 border-t-2 border-concord-secondary/50 rounded-tl-md ml-2" />
                <span className="font-medium text-concord-primary">
                  {replyToUser.nickname ||
                    replyToUser.nickName ||
                    replyToUser.username ||
                    replyToUser.userName}
                </span>
                <span className="truncate max-w-xs opacity-75">
                  {replyTo.text.replace(/```[\s\S]*?```/g, "[code]")}
                </span>
              </div>
            )}

            {/* Reply line and reference */}
            {replyTo && replyToUser && (
              <div className="flex items-center gap-2 mb-2 text-xs text-concord-secondary">
                <div className="w-6 h-3 border-l-2 border-t-2 border-concord-secondary/50 rounded-tl-md ml-2" />
                <span className="font-medium text-concord-primary">
                  {replyToUser.nickname ||
                    replyToUser.nickName ||
                    replyToUser.username ||
                    replyToUser.userName}
                </span>
                <span className="truncate max-w-xs opacity-75">
                  {replyTo.text.replace(/```[\s\S]*?```/g, "[code]")}
                </span>
              </div>
            )}

            {/* Header - always show */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-concord-primary">
                {displayName}
              </span>
              <span className="text-xs text-concord-secondary">
                {formatTimestamp(message.createdAt)}
              </span>
              {message.edited && (
                <span className="text-xs text-concord-secondary opacity-60">
                  (edited)
                </span>
              )}
              {(message as any).pinned && (
                <Pin className="h-3 w-3 text-yellow-500" />
              )}
            </div>

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
                {message.text}
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

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 interactive-hover"
                onClick={() => setShowActionsModal(true)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Message Actions Modal */}
      <MessageActionsModal
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        message={message}
        isOwnMessage={isOwnMessage}
        onReply={onReply}
      />
    </>
  );
};

// Message Input Component
interface MessageInputProps {
  channelId: string;
  channelName?: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  replyingToUser: MessageUser | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
  channelId,
  channelName,
  replyingTo,
  onCancelReply,
  replyingToUser,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Use the API hook for sending messages
  const sendMessageMutation = useSendMessage();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !sendMessageMutation.isPending) {
      try {
        await sendMessageMutation.mutateAsync({
          channelId,
          content: content.trim(),
          repliedMessageId: replyingTo?.id || null,
        });
        setContent("");
        onCancelReply?.();
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
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
                {replyingToUser.nickname ||
                  replyingToUser.nickName ||
                  replyingToUser.username ||
                  replyingToUser.userName}
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
            {replyingTo.text.replace(/```[\s\S]*?```/g, "[code]")}
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
            disabled={sendMessageMutation.isPending}
            className="w-full bg-concord-tertiary border border-border rounded-lg px-4 py-3 text-concord-primary placeholder-concord-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            style={{
              minHeight: "44px",
              maxHeight: "200px",
            }}
          />
          <div className="absolute right-3 bottom-3 text-xs text-concord-secondary">
            {sendMessageMutation.isPending
              ? "Sending..."
              : "Press Enter to send • Shift+Enter for new line"}
          </div>
        </div>
      </form>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const { instanceId, channelId } = useParams();
  const navigate = useNavigate();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  // API hooks - called unconditionally
  const {
    data: instance,
    isLoading: instanceLoading,
    error: instanceError,
  } = useInstanceDetails(instanceId);
  const {
    data: channelMessages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useChannelMessages(channelId);
  const { data: users, isLoading: usersLoading } =
    useInstanceMembers(instanceId);

  // UI state hooks - called unconditionally
  const { toggleMemberList, showMemberList } = useUiStore();
  const { user: currentUser } = useAuthStore();

  // Local state hooks - called unconditionally
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);

  // API mutation hooks - called unconditionally
  const loadMoreMessagesMutation = useLoadMoreMessages(channelId);

  // Memoized values - called unconditionally
  const categories = instance?.categories;

  const currentChannel = React.useMemo(() => {
    return categories
      ?.flatMap((cat) => cat.channels)
      ?.find((ch) => ch.id === channelId);
  }, [categories, channelId]);

  const userHasAccess = React.useMemo(() => {
    if (!currentUser || !instanceId) return false;
    if (currentUser.admin) return true;
    return currentUser.roles.some((role) => role.instanceId === instanceId);
  }, [currentUser, instanceId]);

  const sortedMessages = React.useMemo(() => {
    if (!channelMessages) return [];

    // Sort messages by createdAt timestamp (oldest first, newest last)
    return [...channelMessages].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // ascending order (oldest to newest)
    });
  }, [channelMessages]);

  // Effects - called unconditionally
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages]);

  // Event handlers
  const handleLoadMore = React.useCallback(async () => {
    if (!channelMessages || channelMessages.length === 0 || isLoadingMore)
      return;

    setIsLoadingMore(true);
    try {
      const oldestMessage = channelMessages[0];
      await loadMoreMessagesMutation.mutateAsync({
        beforeDate: new Date(oldestMessage.createdAt),
      });
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [channelMessages, isLoadingMore, loadMoreMessagesMutation]);

  const handleReply = React.useCallback(
    (messageId: string) => {
      const message = channelMessages?.find((m) => m.id === messageId);
      if (message) {
        setReplyingTo(message);
      }
    },
    [channelMessages],
  );

  // Handle loading states
  if (instanceLoading || messagesLoading || usersLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-concord-primary">
        <div className="text-center text-concord-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  // Handle errors and permissions
  if (!userHasAccess) {
    return (
      <div className="flex-1 flex items-center justify-center bg-concord-primary">
        <div className="text-center text-concord-secondary">
          <h2 className="text-xl font-semibold mb-2 text-destructive">
            Access Denied
          </h2>
          <p className="mb-4">You don't have permission to view this server.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (instanceError || messagesError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-concord-primary">
        <div className="text-center text-concord-secondary">
          <h2 className="text-xl font-semibold mb-2 text-destructive">
            Error Loading Chat
          </h2>
          <p className="mb-4">
            {instanceError?.message ||
              messagesError?.message ||
              "Something went wrong"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Require both instanceId and channelId for chat
  if (!instanceId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-concord-primary">
        <div className="text-center text-concord-secondary">
          <h2 className="text-xl font-semibold mb-2 text-concord-primary">
            No Server Selected
          </h2>
          <p>Select a server from the sidebar to start chatting.</p>
        </div>
      </div>
    );
  } else if (!channelId || !currentChannel) {
    const existingChannelId = categories
      ?.flatMap((cat) => cat.channels)
      ?.find((channel) => channel.position === 0)?.id;

    if (existingChannelId) {
      navigate(`/channels/${instanceId}/${existingChannelId}`);
      return null;
    } else {
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
  }

  const ChannelIcon = currentChannel?.type === "voice" ? Volume2 : Hash;

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
          {/* Load More Button */}
          {channelMessages && channelMessages.length > 0 && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-xs"
              >
                {isLoadingMore ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isLoadingMore ? "Loading..." : "Load older messages"}
              </Button>
            </div>
          )}

          <div ref={messagesStartRef} />

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
            {sortedMessages && sortedMessages.length > 0 ? (
              <div>
                {sortedMessages.map((message) => {
                  console.log(message);
                  const user = users?.find((u) => u.id === message.userId);
                  const replyToMessage = channelMessages?.find(
                    (m) => m.id === (message as any).repliedMessageId,
                  );
                  const replyToUser = replyToMessage
                    ? users?.find((u) => u.id === replyToMessage.userId)
                    : undefined;

                  if (!user) return null;

                  return (
                    <MessageComponent
                      key={message.id}
                      message={message}
                      user={user}
                      currentUser={currentUser}
                      replyTo={replyToMessage}
                      onReply={handleReply}
                      replyToUser={replyToUser}
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
        {currentUser && (
          <div className="flex-shrink-0">
            <MessageInput
              channelId={channelId}
              channelName={currentChannel?.name}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              replyingToUser={
                replyingTo
                  ? users?.find((u) => u.id === replyingTo.userId) || null
                  : null
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
