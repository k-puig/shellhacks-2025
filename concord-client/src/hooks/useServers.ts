import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  Instance,
  Category,
  Channel,
  BackendUser,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

// Extended types with relations for frontend use
export interface CategoryWithChannels extends Category {
  channels: Channel[];
}

export interface InstanceWithDetails extends Instance {
  categories: CategoryWithChannels[];
}

// Transform backend user to frontend user format for compatibility
function transformBackendUserToFrontend(backendUser: BackendUser) {
  return {
    id: backendUser.id,
    username: backendUser.userName,
    nickname: backendUser.nickName,
    bio: backendUser.bio,
    picture: backendUser.picture,
    banner: backendUser.banner,
    hashPassword: "",
    admin: backendUser.admin,
    status:
      backendUser.status === "dnd"
        ? "busy"
        : backendUser.status === "idle"
          ? "away"
          : backendUser.status === "invis"
            ? "offline"
            : backendUser.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roles: backendUser.role.map((r) => ({
      instanceId: r.instanceId || "",
      role: r.role || "member",
    })),
  };
}

// Hook for getting all servers/instances
export const useServers = () => {
  return useQuery({
    queryKey: ["servers"],
    queryFn: async (): Promise<Instance[]> => {
      try {
        const instances = await apiClient.getInstances();
        return instances;
      } catch (error) {
        console.error("Failed to fetch servers:", error);
        throw new Error("Failed to fetch servers");
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Hook for getting detailed instance info with categories and channels
export const useInstanceDetails = (instanceId?: string) => {
  return useQuery({
    queryKey: ["instance", instanceId],
    queryFn: async (): Promise<InstanceWithDetails | null> => {
      if (!instanceId) return null;

      try {
        // Get instance basic info
        const instances = await apiClient.getInstances();
        const instance = instances.find((s) => s.id === instanceId);
        if (!instance) return null;

        // Get categories for this instance
        const categories = await apiClient.getCategoriesByInstance(instanceId);

        // For each category, get its channels
        const categoriesWithChannels: CategoryWithChannels[] =
          await Promise.all(
            categories.map(async (category): Promise<CategoryWithChannels> => {
              try {
                const channels = await apiClient.getChannelsByCategory(
                  category.id,
                );
                return {
                  ...category,
                  channels: channels || [],
                };
              } catch (error) {
                console.warn(
                  `Failed to fetch channels for category ${category.id}:`,
                  error,
                );
                return {
                  ...category,
                  channels: [],
                };
              }
            }),
          );

        return {
          ...instance,
          categories: categoriesWithChannels,
        };
      } catch (error) {
        console.error("Failed to fetch instance details:", error);
        throw new Error("Failed to fetch instance details");
      }
    },
    enabled: !!instanceId,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook for getting all users from an instance with their roles
export const useInstanceMembers = (instanceId?: string) => {
  return useQuery({
    queryKey: ["instance", instanceId, "members"],
    queryFn: async () => {
      if (!instanceId) return [];

      try {
        const backendUsers = await apiClient.getUsersByInstance(instanceId);
        // Transform backend users to frontend format for compatibility
        return backendUsers.map(transformBackendUserToFrontend);
      } catch (error) {
        console.error("Failed to fetch instance members:", error);
        throw new Error("Failed to fetch instance members");
      }
    },
    enabled: !!instanceId,
    staleTime: 1000 * 60 * 2,
  });
};

// Hook for creating a new server/instance
export const useCreateInstance = () => {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { name: string; icon?: string }) => {
      if (!user || !token) {
        throw new Error("Authentication required");
      }

      const requestData = {
        ...data,
        requestingUserId: user.id,
        requestingUserToken: token,
      };

      try {
        const instance = await apiClient.createInstance(requestData);
        return instance;
      } catch (error) {
        console.error("Failed to create instance:", error);
        throw new Error("Failed to create instance");
      }
    },
    onSuccess: () => {
      // Invalidate servers list to refetch
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
  });
};

// Hook for creating a new category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      instanceId?: string;
      position: number;
    }) => {
      if (!user || !token) {
        throw new Error("Authentication required");
      }

      const requestData = {
        ...data,
        admin: user.admin,
        requestingUserId: user.id,
        requestingUserToken: token,
      };

      try {
        const category = await apiClient.createCategory(requestData);
        return category;
      } catch (error) {
        console.error("Failed to create category:", error);
        throw new Error("Failed to create category");
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate instance details to refetch categories
      if (variables.instanceId) {
        queryClient.invalidateQueries({
          queryKey: ["instance", variables.instanceId],
        });
      }
    },
  });
};

// Hook for creating a new channel
export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      type: "text" | "voice";
      name: string;
      description: string;
      categoryId?: string;
    }) => {
      if (!user || !token) {
        throw new Error("Authentication required");
      }

      const requestData = {
        ...data,
        admin: user.admin,
        requestingUserId: user.id,
        requestingUserToken: token,
      };

      try {
        const channel = await apiClient.createChannel(requestData);
        return channel;
      } catch (error) {
        console.error("Failed to create channel:", error);
        throw new Error("Failed to create channel");
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      if (variables.categoryId) {
        // Find the instance this category belongs to and invalidate it
        queryClient.invalidateQueries({
          queryKey: ["instance"],
        });
      }
    },
  });
};

// Placeholder hook for channels by instance (for backward compatibility)
export const useChannels = (instanceId?: string) => {
  const { data: instance } = useInstanceDetails(instanceId);

  return useQuery({
    queryKey: ["channels", instanceId],
    queryFn: async (): Promise<CategoryWithChannels[]> => {
      return instance?.categories || [];
    },
    enabled: !!instanceId && !!instance,
    staleTime: 1000 * 60 * 5,
  });
};
