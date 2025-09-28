import { QueryClient } from "@tanstack/react-query";

// Base API configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Enhanced QueryClient with error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 500 * 1, // 1 minute
      refetchOnWindowFocus: true,
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

// API Response types based on your backend
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

// Specific response types for your backend
export interface Instance {
  id: string;
  name: string;
  icon?: string | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  instanceId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  categoryId: string;
  instanceId: string;
  position: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendUser {
  id: string;
  userName: string;
  nickName: string | null;
  bio: string | null;
  picture: string | null;
  banner: string | null;
  admin: boolean;
  status: "online" | "offline" | "dnd" | "idle" | "invis";
  role: Array<{
    userId: string;
    instanceId: string;
    role?: string;
  }>;
}

export interface Message {
  id: string;
  text: string;
  channelId: string;
  userId: string;
  edited: boolean;
  createdAt: string;
  deleted: boolean;
  updatedAt: string;
  replies: MessageReply;
  user?: BackendUser;
}

export interface MessageReply {
  id: string;
  repliesToId: string;
  repliesToText: string;
}

// Enhanced fetch wrapper with auth and error handling
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Handle auth error - logout user
          const authStore = await import("@/stores/authStore");
          authStore.useAuthStore.getState().logout();
          throw new Error("Authentication required");
        }

        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Instance/Server methods
  async getInstances(): Promise<Instance[]> {
    const response = await this.request<
      { success: boolean; data: Instance[] } | Instance[]
    >("/api/instance");

    // Handle both wrapped and direct responses
    if (Array.isArray(response)) {
      return response;
    }

    if ("data" in response && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  async createInstance(data: {
    name: string;
    icon?: string;
    requestingUserId: string;
    requestingUserToken: string;
  }): Promise<Instance> {
    return this.request<Instance>("/api/instance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Categories methods
  async getCategoriesByInstance(instanceId: string): Promise<Category[]> {
    try {
      const response = await this.request<Category[] | { data: Category[] }>(
        `/api/category/instance/${instanceId}`,
      );

      if (Array.isArray(response)) {
        return response;
      }

      if ("data" in response && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.warn(
        `Categories endpoint not available for instance ${instanceId}`,
        error,
      );
      return [];
    }
  }

  async createCategory(data: {
    name: string;
    position: number;
    instanceId?: string;
    admin: boolean;
    requestingUserId: string;
    requestingUserToken: string;
  }): Promise<Category> {
    return this.request<Category>("/api/category", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Channel methods
  async getChannelsByCategory(categoryId: string): Promise<Channel[]> {
    try {
      const response = await this.request<Channel[] | { data: Channel[] }>(
        `/api/channel/category/${categoryId}`,
      );

      if (Array.isArray(response)) {
        return response;
      }

      if ("data" in response && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.warn(
        `Channels endpoint not available for category ${categoryId}`,
        error,
      );
      return [];
    }
  }

  async createChannel(data: {
    type: "text" | "voice";
    name: string;
    description: string;
    categoryId?: string;
    admin: boolean;
    requestingUserId: string;
    requestingUserToken: string;
  }): Promise<Channel> {
    return this.request<Channel>("/api/channel", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Message methods
  async getMessages(params: {
    date: string;
    channelId: string;
  }): Promise<Message[]> {
    const query = new URLSearchParams(params);
    const response = await this.request<Message[] | { data: Message[] }>(
      `/api/message?${query}`,
    );

    if (Array.isArray(response)) {
      return response;
    }

    if ("data" in response && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  async sendMessage(data: {
    channelId: string;
    userId: string;
    content: string;
    token: string;
    repliedMessageId?: string | null;
  }): Promise<Message> {
    return this.request<Message>("/api/message", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // User methods
  async getUsersByInstance(instanceId: string): Promise<BackendUser[]> {
    const query = new URLSearchParams({ instanceId });
    const response = await this.request<
      BackendUser[] | { data: BackendUser[] }
    >(`/api/user?${query}`);

    if (Array.isArray(response)) {
      return response;
    }

    if ("data" in response && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  async getUser(id: string): Promise<BackendUser> {
    const response = await this.request<BackendUser | { data: BackendUser }>(
      `/api/user/${id}`,
    );

    if ("data" in response) {
      return response.data;
    }

    return response as BackendUser;
  }

  async createUser(data: {
    username: string;
    nickname?: string;
    bio?: string;
    picture?: string;
    banner?: string;
    status?: "online" | "offline" | "dnd" | "idle" | "invis";
    admin?: boolean;
    requestingUserId: string;
    requestingUserToken: string;
    passwordhash: string;
  }): Promise<{ success: boolean; data?: BackendUser; error?: string }> {
    try {
      const response = await this.request<BackendUser>("/api/user", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
