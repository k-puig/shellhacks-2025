import { BackendUser } from "@/lib/api-client";
import { Message } from "./database";

// API types
export type {
  ApiResponse,
  Instance,
  Category,
  Channel,
  BackendUser,
  Message,
} from "@/lib/api-client";

// Auth types
export type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "@/lib/auth-client";

// Hook types
export type { CategoryWithChannels, InstanceWithDetails } from "@/types/api";

// Frontend User type (for compatibility with existing components)
export interface User {
  id: string;
  username: string;
  nickname?: string | null;
  bio?: string | null;
  picture?: string | null;
  banner?: string | null;
  hashPassword: string;
  admin: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    instanceId: string;
    role: string;
  }>;
}

// Message with user for chat components
export interface MessageWithUser extends Message {
  user?: User | BackendUser;
}
