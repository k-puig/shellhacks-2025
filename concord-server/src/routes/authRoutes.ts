import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, resolver } from "hono-openapi";
import {
  getUserCredentials,
  getUserInformation,
} from "../services/userService";
import shaHash from "../helper/hashing";
import { PrismaClient } from "@prisma/client";
import {
  loginSchema,
  validateTokenSchema,
  refreshTokenSchema,
  logoutSchema,
  authResponseSchema,
  validationResponseSchema,
  errorResponseSchema,
  successResponseSchema,
} from "../validators/authValidator";

const prisma = new PrismaClient();
const authRoutes = new Hono();

// Login endpoint
authRoutes.post(
  "/login",
  describeRoute({
    description: "User login",
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": { schema: resolver(authResponseSchema) },
        },
      },
      401: {
        description: "Invalid credentials",
        content: {
          "application/json": { schema: resolver(errorResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", loginSchema),
  async (c) => {
    try {
      const { username, password } = await c.req.json();

      // Find user by username
      const user = await prisma.user.findFirst({
        where: { username: username },
      });

      if (!user) {
        return c.json({ error: "Invalid username or password" }, 401);
      }

      // Get user credentials
      const userCredentials = await getUserCredentials(user.id);
      if (!userCredentials) {
        return c.json({ error: "Invalid username or password" }, 401);
      }

      // Hash
      // const hashedPassword = shaHash(password, user.id);

      // Verify password
      if (password !== userCredentials.password) {
        return c.json({ error: "Invalid username or password" }, 401);
      }

      // Generate new token
      const token = crypto.randomUUID();

      // Update user's token in database
      await prisma.userAuth.update({
        where: { userId: user.id },
        data: { token: token },
      });

      // Get full user information
      const userInfo = await getUserInformation(user.id);
      if (!userInfo) {
        return c.json({ error: "Failed to get user information" }, 500);
      }

      return c.json({
        user: userInfo,
        token: token,
      });
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Token validation endpoint
authRoutes.post(
  "/validate",
  describeRoute({
    description: "Validate user token",
    responses: {
      200: {
        description: "Token validation result",
        content: {
          "application/json": { schema: resolver(validationResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", validateTokenSchema),
  async (c) => {
    try {
      const { token, userId } = await c.req.json();

      // Get user credentials
      const userCredentials = await getUserCredentials(userId);
      if (!userCredentials || userCredentials.token !== token) {
        return c.json({ valid: false });
      }

      // Get user information
      const userInfo = await getUserInformation(userId);
      if (!userInfo) {
        return c.json({ valid: false });
      }

      return c.json({
        valid: true,
        user: userInfo,
      });
    } catch (error) {
      return c.json({ valid: false });
    }
  },
);

// Token refresh endpoint
authRoutes.post(
  "/refresh",
  describeRoute({
    description: "Refresh user token",
    responses: {
      200: {
        description: "Token refreshed successfully",
        content: {
          "application/json": { schema: resolver(authResponseSchema) },
        },
      },
      401: {
        description: "Invalid token",
        content: {
          "application/json": { schema: resolver(errorResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", refreshTokenSchema),
  async (c) => {
    try {
      const { userId, oldToken } = await c.req.json();

      // Verify old token
      const userCredentials = await getUserCredentials(userId);
      if (!userCredentials || userCredentials.token !== oldToken) {
        return c.json({ error: "Invalid token" }, 401);
      }

      // Generate new token
      const newToken = crypto.randomUUID();

      // Update token in database
      await prisma.userAuth.update({
        where: { userId: userId },
        data: { token: newToken },
      });

      // Get user information
      const userInfo = await getUserInformation(userId);
      if (!userInfo) {
        return c.json({ error: "Failed to get user information" }, 500);
      }

      return c.json({
        user: userInfo,
        token: newToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Logout endpoint (invalidate token)
authRoutes.post(
  "/logout",
  describeRoute({
    description: "User logout",
    responses: {
      200: {
        description: "Logout successful",
        content: {
          "application/json": { schema: resolver(successResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", logoutSchema),
  async (c) => {
    try {
      const { userId } = await c.req.json();

      // Clear token in database
      await prisma.userAuth.update({
        where: { userId: userId },
        data: { token: null },
      });

      return c.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export default authRoutes;
