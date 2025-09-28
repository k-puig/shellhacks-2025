import { z } from "zod";

//channel validators

export const createChannelSchema = z.object({
  type: z.enum(["text", "voice"]),
  name: z.string().min(1).max(50),
  description: z.string().max(255),
  categoryId: z.uuidv7().optional(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export const getChannelSchema = z.object({
  id: z.uuidv7(),
});

export const getChannelsByCategoryIdSchema = z.object({
  categoryId: z.uuidv7(),
});

export const updateChannelSchema = z.object({
  id: z.uuidv7(),
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).optional(),
  categoryId: z.uuidv7().optional(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export const deleteChannelSchema = z.object({
  id: z.uuidv7(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export const deleteChannelsByCategoryIdSchema = z.object({
  categoryId: z.uuidv7(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type GetChannelInput = z.infer<typeof getChannelSchema>;
export type GetChannelsByCategoryIdInput = z.infer<
  typeof getChannelsByCategoryIdSchema
>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type DeleteChannelInput = z.infer<typeof deleteChannelSchema>;
export type DeleteChannelsByCategoryIdInput = z.infer<
typeof deleteChannelsByCategoryIdSchema
>;
