import { useQuery } from "@tanstack/react-query";
import { Instance, User } from "@/types/database";
import { InstanceWithDetails } from "@/types/api";
import { CategoryWithChannels } from "@/types/api";

// Sample users data with proper Role structure
export const SAMPLE_USERS: User[] = [
  {
    id: "1",
    username: "alice_dev",
    nickname: "Alice",
    bio: "Frontend developer who loves React",
    picture: null,
    banner: null,
    status: "online" as const,
    hashPassword: "",
    admin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roles: [], // Will be populated per instance
  },
  {
    id: "2",
    username: "bob_designer",
    nickname: "Bob",
    bio: "UI/UX Designer & Coffee Enthusiast",
    picture:
      "https://media.istockphoto.com/id/1682296067/photo/happy-studio-portrait-or-professional-man-real-estate-agent-or-asian-businessman-smile-for.jpg?s=612x612&w=0&k=20&c=9zbG2-9fl741fbTWw5fNgcEEe4ll-JegrGlQQ6m54rg=",
    banner: null,
    status: "away" as const,
    hashPassword: "",
    admin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roles: [],
  },
  {
    id: "3",
    username: "charlie_backend",
    nickname: "Charlie",
    bio: "Backend wizard, scaling systems since 2018",
    picture: null,
    banner: null,
    status: "busy" as const,
    hashPassword: "",
    admin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roles: [],
  },
  {
    id: "current",
    username: "you",
    nickname: "You",
    bio: "That's you!",
    picture: null,
    banner: null,
    status: "online" as const,
    hashPassword: "",
    admin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roles: [],
  },
];

// Sample servers data
const SAMPLE_SERVERS: Instance[] = [
  {
    id: "1",
    name: "Dev Team",
    icon: null,
    description: "Our development team server",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Gaming Squad",
    icon: null,
    description: "Gaming and fun times",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Book Club",
    icon: null,
    description: "Monthly book discussions",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

// Sample categories with channels
const createSampleCategories = (instanceId: string): CategoryWithChannels[] => [
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
        description: "General discussion about development and projects",
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
        description: "Random chat and off-topic discussions",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "announcements",
        type: "text",
        categoryId: "1",
        instanceId: instanceId,
        position: 2,
        description: "Important announcements and updates",
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
        id: "4",
        name: "General",
        type: "voice",
        categoryId: "2",
        instanceId: instanceId,
        position: 0,
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "5",
        name: "Focus Room",
        type: "voice",
        categoryId: "2",
        instanceId: instanceId,
        position: 1,
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "3",
    name: "Project Channels",
    instanceId: instanceId,
    position: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    channels: [
      {
        id: "6",
        name: "frontend",
        type: "text",
        categoryId: "3",
        instanceId: instanceId,
        position: 0,
        description: "Frontend development discussions",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "7",
        name: "backend",
        type: "text",
        categoryId: "3",
        instanceId: instanceId,
        position: 1,
        description: "Backend and API development",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

// Placeholder hook for channels by instance
export const useChannels = (instanceId?: string) => {
  return useQuery({
    queryKey: ["channels", instanceId],
    queryFn: async (): Promise<CategoryWithChannels[]> => {
      if (!instanceId) return [];

      return createSampleCategories(instanceId);
    },
    enabled: !!instanceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for getting messages in a channel
export const useChannelMessages = (channelId?: string) => {
  return useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];

      // Return messages for this channel
      return SAMPLE_MESSAGES.filter((msg) => msg.channelId === channelId);
    },
    enabled: !!channelId,
    staleTime: 1000 * 60 * 1, // 1 minute (messages are more dynamic)
  });
};

// Placeholder hook for servers/instances
export const useServers = () => {
  return useQuery({
    queryKey: ["servers"],
    queryFn: async (): Promise<Instance[]> => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return SAMPLE_SERVERS;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useInstanceDetails = (instanceId?: string) => {
  return useQuery({
    queryKey: ["instance", instanceId],
    queryFn: async (): Promise<InstanceWithDetails | null> => {
      if (!instanceId) return null;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const server = SAMPLE_SERVERS.find((s) => s.id === instanceId);
      if (!server) return null;

      return {
        ...server,
        categories: createSampleCategories(instanceId),
      };
    },
    enabled: !!instanceId,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook for getting all users from an instance with their roles
export const useInstanceMembers = (instanceId?: string) => {
  return useQuery({
    queryKey: ["instance", instanceId, "members"],
    queryFn: async (): Promise<User[]> => {
      if (!instanceId) return [];
      await new Promise((resolve) => setTimeout(resolve, 100));

      return SAMPLE_USERS.map((user, index) => ({
        ...user,
        roles: [
          {
            instanceId: instanceId,
            role: index === 0 ? "admin" : index === 1 ? "mod" : "member",
          },
        ],
      }));
    },
    enabled: !!instanceId,
    staleTime: 1000 * 60 * 2,
  });
};
