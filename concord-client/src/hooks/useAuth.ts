// src/hooks/useAuth.ts - Fixed with proper types
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import {
  authClient,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "@/lib/auth-client";
import { BackendUser } from "@/lib/api-client";
import { Role, UserStatus } from "@/types/database";

// Frontend User type
interface FrontendUser {
  id: string;
  username: string;
  nickname?: string | null;
  bio?: string | null;
  picture?: string | null;
  banner?: string | null;
  hashPassword: string;
  admin: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

// Transform backend user to frontend user format
function transformBackendUser(backendUser: BackendUser): FrontendUser {
  return {
    id: backendUser.id,
    username: backendUser.userName,
    nickname: backendUser.nickName,
    bio: backendUser.bio,
    picture: backendUser.picture,
    banner: backendUser.banner,
    hashPassword: "", // Don't store password
    admin: backendUser.admin,
    status: transformStatusToFrontend(backendUser.status),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roles: backendUser.role.map((r) => ({
      instanceId: r.instanceId || "",
      role: r.role || "member",
    })) as Role[],
  };
}

// Transform status from backend to frontend format
function transformStatusToFrontend(
  backendStatus: "online" | "offline" | "dnd" | "idle" | "invis",
): UserStatus {
  switch (backendStatus) {
    case "dnd":
      return "busy";
    case "idle":
      return "away";
    case "invis":
      return "offline";
    default:
      return "online";
  }
}

// Transform status from frontend to backend format
export function transformStatusToBackend(
  frontendStatus: UserStatus,
): "online" | "offline" | "dnd" | "idle" | "invis" {
  switch (frontendStatus) {
    case "busy":
      return "dnd";
    case "away":
      return "idle";
    case "offline":
      return "invis";
    default:
      return "online";
  }
}

// Hook for login
export const useLogin = () => {
  const { setAuth, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<AuthResponse> => {
      setLoading(true);
      return authClient.login(credentials);
    },
    onSuccess: (data: AuthResponse) => {
      const frontendUser = transformBackendUser(data.user);
      setAuth(frontendUser, data.token, data.token); // Use token as refresh token for now
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Hook for registration (requires admin)
export const useRegister = () => {
  const { setAuth, setLoading, user, token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<AuthResponse> => {
      setLoading(true);

      if (!user || !token || !user.admin) {
        throw new Error("Admin privileges required for user creation");
      }

      return authClient.register(userData, { id: user.id, token });
    },
    onSuccess: (data: AuthResponse) => {
      const frontendUser = transformBackendUser(data.user);
      setAuth(frontendUser, data.token, data.token);
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error("Registration failed:", error);
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const { logout, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (user) {
        try {
          await authClient.logout(user.id);
        } catch (error) {
          console.warn("Logout endpoint failed:", error);
        }
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error("Logout failed:", error);
      // Still logout locally even if server request fails
      logout();
      queryClient.clear();
    },
  });
};

// Hook for token validation
export const useValidateToken = () => {
  const { token, user, setAuth, logout } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<{ valid: boolean; user?: BackendUser }> => {
      if (!token || !user) {
        throw new Error("No token to validate");
      }
      return authClient.validateToken(token, user.id);
    },
    onSuccess: (data) => {
      if (!data.valid) {
        logout();
      } else if (data.user) {
        const frontendUser = transformBackendUser(data.user);
        setAuth(frontendUser, token!, useAuthStore.getState().refreshToken!);
      }
    },
    onError: (error: Error) => {
      console.error("Token validation failed:", error);
      logout();
    },
  });
};

// Hook for token refresh
export const useRefreshToken = () => {
  const { refreshToken, user, setAuth, logout } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      if (!refreshToken || !user) {
        throw new Error("No refresh token available");
      }
      return authClient.refreshToken(refreshToken, user.id);
    },
    onSuccess: (data: AuthResponse) => {
      const frontendUser = transformBackendUser(data.user);
      setAuth(frontendUser, data.token, data.token);
    },
    onError: (error: Error) => {
      console.error("Token refresh failed:", error);
      logout();
    },
  });
};
