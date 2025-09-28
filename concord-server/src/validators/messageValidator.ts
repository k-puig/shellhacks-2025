import { z } from "zod";

export const getMessageByIdSchema = z.object({
  id: z.uuidv7(),
});

export const getMessagesBeforeDate = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date string format",
  }),
  channelId: z.uuidv7(),
});

export const sendMessageSchema = z.object({
  channelId: z.uuidv7(),
  userId: z.uuidv7(),
  content: z.string(),
  token: z.string(),
  repliedMessageId: z.uuidv7().nullable().optional(),
});

export const putMessageSchema = z.object({
  id: z.uuidv7(),
  content: z.string().optional(),
  deleted: z.boolean().optional(),
  token: z.string(),
});

export type PutMessage = z.infer<typeof putMessageSchema>;
