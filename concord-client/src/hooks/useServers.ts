import { useQuery } from "@tanstack/react-query";
import { Instance, InstanceWithDetails, UserWithRoles } from "@/types/api";

// Placeholder hook for servers/instances
export const useServers = () => {
  return useQuery({
    queryKey: ["servers"],
    queryFn: async (): Promise<Instance[]> => {
      // TODO: Replace with actual API call
      return [
        {
          id: "1",
          name: "My Server",
          icon: null,
          description: "A cool server",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Placeholder hook for instance details
export const useInstanceDetails = (instanceId?: string) => {
  return useQuery({
    queryKey: ["instance", instanceId],
    queryFn: async (): Promise<InstanceWithDetails | null> => {
      if (!instanceId || instanceId === "@me") return null;

      // TODO: Replace with actual API call
      return {
        id: instanceId,
        name: "My Server",
        icon: null,
        description: "A cool server",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: [],
        memberCount: 1,
        roles: [],
      };
    },
    enabled: !!instanceId && instanceId !== "@me",
    staleTime: 1000 * 60 * 5,
  });
};

// Placeholder hook for instance members
export const useInstanceMembers = (instanceId?: string) => {
  return useQuery({
    queryKey: ["instance", instanceId, "members"],
    queryFn: async (): Promise<UserWithRoles[]> => {
      if (!instanceId || instanceId === "@me") return [];

      // TODO: Replace with actual API call
      return [
        {
          id: "1",
          username: "testuser",
          nickname: "Test User",
          bio: "Just testing",
          picture: null,
          banner: null,
          hashPassword: "",
          algorithms: "{}",
          status: "online",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roles: [],
        },
      ];
    },
    enabled: !!instanceId && instanceId !== "@me",
    staleTime: 1000 * 60 * 2, // 2 minutes (members change more frequently)
  });
};
