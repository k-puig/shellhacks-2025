import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(1),
});

export const validateTokenSchema = z.object({
  token: z.string(),
  userId: z.uuidv7(),
});

export const refreshTokenSchema = z.object({
  userId: z.uuidv7(),
  oldToken: z.string(),
});

export const logoutSchema = z.object({
  userId: z.uuidv7(),
});

// Response schemas for OpenAPI documentation
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    userName: z.string(),
    nickName: z.string().nullable(),
    bio: z.string().nullable(),
    picture: z.string().nullable(),
    banner: z.string().nullable(),
    admin: z.boolean(),
    status: z.enum(["online", "offline", "dnd", "idle", "invis"]),
    role: z.array(z.any()),
  }),
  token: z.string(),
});

export const validationResponseSchema = z.object({
  valid: z.boolean(),
  user: z.any().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const successResponseSchema = z.object({
  success: z.boolean(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type ValidateTokenInput = z.infer<typeof validateTokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type ValidationResponse = z.infer<typeof validationResponseSchema>;
