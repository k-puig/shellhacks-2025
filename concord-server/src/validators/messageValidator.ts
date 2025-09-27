import { z } from "zod";

export const getMessageByIdSchema = z.object({
    id: z.uuidv7()
})

export const sendMessageSchema = z.object({
    channelId: z.uuidv7(),
    userId: z.uuidv7(),
    content: z.string(),
    token: z.string(),
    repliedMessageId: z.uuidv7().nullable().optional()
})