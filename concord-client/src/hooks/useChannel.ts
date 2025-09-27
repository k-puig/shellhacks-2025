// src/hooks/useChannels.ts
import { useQuery } from "@tanstack/react-query";
import { CategoryWithChannels } from "@/types/api";

// Placeholder hook for channels by instance
export const useChannels = (instanceId?: string) => {
  return useQuery({
    queryKey: ["channels", instanceId],
    queryFn: async (): Promise<CategoryWithChannels[]> => {
      if (!instanceId || instanceId === "@me") return [];

      // TODO: Replace with actual API call
      return [
        {
          id: "1",
          name: "Text Channels",
          instanceId: instanceId,
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          channels: [
            {
              id: "1",
              name: "general",
              type: "text",
              categoryId: "1",
              instanceId: instanceId,
              position: 0,
              topic: "General discussion",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "random",
              type: "text",
              categoryId: "1",
              instanceId: instanceId,
              position: 1,
              topic: "Random chat",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: "2",
          name: "Voice Channels",
          instanceId: instanceId,
          position: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          channels: [
            {
              id: "3",
              name: "General",
              type: "voice",
              categoryId: "2",
              instanceId: instanceId,
              position: 0,
              topic: "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      ];
    },
    enabled: !!instanceId && instanceId !== "@me",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
