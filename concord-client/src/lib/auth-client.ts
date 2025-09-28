import { apiClient, BackendUser } from "./api-client";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  nickname?: string;
  bio?: string;
  picture?: string;
  banner?: string;
}

export interface AuthResponse {
  user: BackendUser;
  token: string;
}

class AuthClient {
  private baseUrl: string;

  constructor(
    baseUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3000",
  ) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Login failed" }));
        throw new Error(errorData.error || "Login failed");
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error instanceof Error ? error : new Error("Login failed");
    }
  }

  async register(
    data: RegisterData,
    adminUser: { id: string; token: string },
  ): Promise<AuthResponse> {
    try {
      const createUserData = {
        username: data.username,
        nickname: data.nickname,
        bio: data.bio,
        picture: data.picture,
        banner: data.banner,
        status: "online" as const,
        admin: false,
        requestingUserId: adminUser.id,
        requestingUserToken: adminUser.token,
        passwordhash: data.password,
      };

      const response = await apiClient.createUser(createUserData);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Registration failed");
      }
      try {
        const loginResponse = await this.login({
          username: data.username,
          password: data.password,
        });
        return loginResponse;
      } catch (loginError) {
        throw new Error(
          "Registration successful, but auto-login failed. Please login manually.",
        );
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error instanceof Error ? error : new Error("Registration failed");
    }
  }

  async validateToken(
    token: string,
    userId: string,
  ): Promise<{ valid: boolean; user?: BackendUser }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, userId }),
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data: { valid: boolean; user?: BackendUser } =
        await response.json();
      return data;
    } catch (error) {
      console.error("Token validation failed:", error);
      return { valid: false };
    }
  }

  async refreshToken(oldToken: string, userId: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, oldToken }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Token refresh failed" }));
        throw new Error(errorData.error || "Token refresh failed");
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error instanceof Error ? error : new Error("Token refresh failed");
    }
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        console.warn(
          "Logout endpoint failed, but continuing with local logout",
        );
      }

      const data = await response.json().catch(() => ({ success: true }));
      return data;
    } catch (error) {
      console.warn("Logout request failed:", error);
      return { success: true }; // Always succeed locally
    }
  }
}

export const authClient = new AuthClient();
