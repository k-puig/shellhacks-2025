import { Instance, Category, Channel, User, Message } from "./database";

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Extended types with relations for frontend use
export interface ChannelWithCategory extends Channel {
  category: Category;
}

export interface CategoryWithChannels extends Category {
  channels: Channel[];
}

export interface InstanceWithDetails extends Instance {
  categories: CategoryWithChannels[];
}

export interface MessageWithUser extends Message {
  user: User;
}

// Request types
export interface CreateInstanceRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface CreateCategoryRequest {
  name: string;
  instanceId: string;
  position?: number;
}

export interface CreateChannelRequest {
  name: string;
  type: "text" | "voice";
  categoryId: string;
  topic?: string;
  position?: number;
}

export interface SendMessageRequest {
  content: string;
  channelId: string;
  user: User;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
