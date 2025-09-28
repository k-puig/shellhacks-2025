import { Message } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

// Sample messages data
export const SAMPLE_MESSAGES = [
  {
    id: "1",
    content: "Hey everyone! Just finished the new theme system. Check it out!",
    channelId: "1", // general channel
    userId: "1",
    edited: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    content:
      "Looking great! The dark mode especially feels much better on the eyes 👀",
    channelId: "1",
    userId: "2",
    edited: false,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    content: "Can we add a **high contrast mode** for accessibility?",
    channelId: "1",
    userId: "3",
    edited: false,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    content:
      "```typescript\nconst theme = {\n  primary: 'oklch(0.6 0.2 240)',\n  secondary: 'oklch(0.8 0.1 60)'\n};\n```\nHere's how the new color system works!",
    channelId: "1",
    userId: "3",
    edited: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    content:
      "Perfect timing! I was just about to ask about the color format. _OKLCH_ is so much better than HSL for this.",
    channelId: "1",
    userId: "1",
    edited: false,
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  // Messages for random channel
  {
    id: "6",
    content: "Anyone up for a game tonight?",
    channelId: "2", // random channel
    userId: "2",
    edited: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    content: "I'm in! What are we playing?",
    channelId: "2",
    userId: "1",
    edited: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
];

export const useChannelMessages = (channelId?: string) => {
  return useQuery({
    queryKey: ["messages", channelId],
    queryFn: async (): Promise<Message[]> => {
      if (!channelId) return [];
      await new Promise((resolve) => setTimeout(resolve, 100));
      return SAMPLE_MESSAGES.filter((msg) => msg.channelId === channelId);
    },
    enabled: !!channelId,
    staleTime: 1000 * 60 * 1,
  });
};
