import { z } from "zod";

export const postMessageToChannelSchema = z.object({
  instanceId: z.uuidv7(),
  categoryId: z.uuidv7(),
  channelId: z.uuidv7(),
  userId: z.uuidv7(),
  content: z.string().min(1).max(2000),
  repliedMessageId: z.uuidv7().optional(),
  token: z.string(),
});

//TODO: add more realtime related validators as needed

export type PostMessageToChannelInput = z.infer<
  typeof postMessageToChannelSchema
>;
//TODO: create more input schemas for other realtime actions
