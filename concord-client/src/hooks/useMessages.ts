import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, Message } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

// Hook for getting messages in a channel with pagination
export const useChannelMessages = (channelId?: string, limit = 50) => {
  return useQuery({
    queryKey: ["messages", channelId, limit],
    queryFn: async (): Promise<Message[]> => {
      if (!channelId) return [];

      try {
        const date = new Date();
        const messages = await apiClient.getMessages({
          date: date.toISOString(),
          channelId: channelId,
        });

        return messages || [];
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        return [];
      }
    },
    enabled: !!channelId,
    staleTime: 500 * 1,
    refetchInterval: 500 * 1,
  });
};

// Hook for getting older messages (pagination)
export const useChannelMessagesPaginated = (
  channelId?: string,
  beforeDate?: Date,
  limit = 50,
) => {
  return useQuery({
    queryKey: [
      "messages",
      channelId,
      "paginated",
      beforeDate?.toISOString(),
      limit,
    ],
    queryFn: async (): Promise<Message[]> => {
      if (!channelId || !beforeDate) return [];

      try {
        const messages = await apiClient.getMessages({
          date: beforeDate.toISOString(),
          channelId: channelId,
        });

        return messages || [];
      } catch (error) {
        console.error("Failed to fetch paginated messages:", error);
        return [];
      }
    },
    enabled: !!channelId && !!beforeDate,
    staleTime: 500 * 1,
  });
};

// Hook for sending messages
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      channelId: string;
      content: string;
      repliedMessageId?: string | null;
    }) => {
      if (!user || !token) {
        throw new Error("Authentication required");
      }

      const requestData = {
        channelId: data.channelId,
        userId: user.id,
        content: data.content,
        token: token,
        repliedMessageId: data.repliedMessageId,
      };

      try {
        const message = await apiClient.sendMessage(requestData);
        return message;
      } catch (error) {
        console.error("Failed to send message:", error);
        throw new Error("Failed to send message");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.channelId],
      });
    },
    onError: (error) => {
      console.error("Send message failed:", error);
    },
  });
};

// Hook for deleting messages
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { messageId: string; channelId: string }) => {
      if (!user || !token) {
        throw new Error("Authentication required");
      }

      // TODO: Replace with actual API call when available

      return { success: true, messageId: data.messageId };
    },
    onSuccess: (result, variables) => {
      // Update the cache to mark message as deleted
      queryClient.setQueryData(
        ["messages", variables.channelId],
        (oldData: Message[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((msg) =>
            msg.id === result.messageId
              ? { ...msg, content: "[Message deleted]", deleted: true }
              : msg,
          );
        },
      );
    },
    onError: (error) => {
      console.error("Delete message failed:", error);
    },
  });
};

// Hook for editing messages
export const useEditMessage = () => {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      messageId: string;
      content: string;
      channelId: string;
    }) => {
      if (!user || !token) {
        throw new Error("Authentication required");
      }

      // TODO: Replace with actual API call when available
      console.log(
        "Editing message:",
        data.messageId,
        "New content:",
        data.content,
      );

      return {
        success: true,
        messageId: data.messageId,
        content: data.content,
        edited: true,
      };
    },
    onSuccess: (result, variables) => {
      // Update the cache with edited message
      queryClient.setQueryData(
        ["messages", variables.channelId],
        (oldData: Message[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((msg) =>
            msg.id === result.messageId
              ? { ...msg, content: result.content, edited: result.edited }
              : msg,
          );
        },
      );
    },
    onError: (error) => {
      console.error("Edit message failed:", error);
    },
  });
};

// Hook for pinning/unpinning messages
export const usePinMessage = () => {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      messageId: string;
      channelId: string;
      pinned: boolean;
    }) => {
      if (!user || !token) {
        throw new Error("Authentication required");
      }

      // TODO: Replace with actual API call when available
      console.log(
        `${data.pinned ? "Pinning" : "Unpinning"} message:`,
        data.messageId,
      );

      return {
        success: true,
        messageId: data.messageId,
        pinned: data.pinned,
      };
    },
    onSuccess: (result, variables) => {
      // Update the cache with pinned status
      queryClient.setQueryData(
        ["messages", variables.channelId],
        (oldData: Message[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((msg) =>
            msg.id === result.messageId
              ? { ...msg, pinned: result.pinned }
              : msg,
          );
        },
      );

      // Also invalidate pinned messages query if it exists
      queryClient.invalidateQueries({
        queryKey: ["pinned-messages", variables.channelId],
      });
    },
    onError: (error) => {
      console.error("Pin message failed:", error);
    },
  });
};

// Hook for getting pinned messages
export const usePinnedMessages = (channelId?: string) => {
  return useQuery({
    queryKey: ["pinned-messages", channelId],
    queryFn: async (): Promise<Message[]> => {
      if (!channelId) return [];

      try {
        // TODO: Replace with actual API call when available
        // For now, return empty array
        return [];
      } catch (error) {
        console.error("Failed to fetch pinned messages:", error);
        return [];
      }
    },
    enabled: !!channelId,
    staleTime: 500 * 1,
  });
};

// Hook for loading more messages (infinite scroll)
export const useLoadMoreMessages = (channelId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { beforeDate: Date }) => {
      if (!channelId) return [];

      try {
        const messages = await apiClient.getMessages({
          date: data.beforeDate.toISOString(),
          channelId: channelId,
        });

        return messages || [];
      } catch (error) {
        console.error("Failed to load more messages:", error);
        return [];
      }
    },
    onSuccess: (newMessages) => {
      if (newMessages.length > 0) {
        // Prepend new messages to existing messages
        queryClient.setQueryData(
          ["messages", channelId],
          (oldData: Message[] | undefined) => {
            if (!oldData) return newMessages;

            // Remove duplicates and sort by creation date
            const combined = [...newMessages, ...oldData];
            const unique = combined.filter(
              (msg, index, arr) =>
                arr.findIndex((m) => m.id === msg.id) === index,
            );

            return unique.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
          },
        );
      }
    },
  });
};
