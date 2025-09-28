import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, resolver } from "hono-openapi";
import { 
  postMessageToChannelSchema
} from "../validators/realtimeValidator.js";
import {
  postMessageToChannel,
  deleteMessageFromChannel,
} from "../controller/realtimeController";


const realtimeRoutes = new Hono();

realtimeRoutes.post(
  "message/:instanceId/:categoryId/:channelId",
  describeRoute({
    description: "Post a message to a channel",
    responses: {
      200: {
        description: "Message posted successfully",
        content: {
          "application/json": { schema: resolver(postMessageToChannelSchema) },
        },
      },
      400: {
        description: "Bad Request - Invalid input data",
        content: {
          "application/json": { schema: resolver(postMessageToChannelSchema) },
        },
      },
      401: {
        description: "Unauthorized - Invalid token",
        content: {
          "application/json": { schema: resolver(postMessageToChannelSchema) },
        },
      },
      404: {
        description: "Instance, Category, Channel, or User not found",
        content: {
          "application/json": { schema: resolver(postMessageToChannelSchema) },
        },
      },
      500: {
        description: "Server error",
        content: {
          "application/json": { schema: resolver(postMessageToChannelSchema) },
        },
      },
    },
  }),
   zValidator("json", postMessageToChannelSchema),
  async (c) => {
    const instanceId = c.req.param("instanceId");
    const categoryId = c.req.param("categoryId");
    const channelId = c.req.param("channelId");
      const { userId, content, repliedMessageId, token } = await c.req.json();

      const ioServer = (c as any).get("io");
      if (!ioServer) {
        return c.json({ success: false, error: "Realtime server not available" }, 500);
      }

      const result = await postMessageToChannel(ioServer, c, {
        instanceId,
        categoryId,
        channelId,
        userId,
        content,
        token,
        repliedMessageId: repliedMessageId ?? null,
      })
      
      if (result === "event not implemented") {
        return c.json({ success: false, message: "Event not implemented or recognized" }, 400);
      }

      if (result === "no acknowledgment") {
        return c.json({ success: false, message: "No acknowledgment received from client" }, 500);
      }

      if (!result) {
        return c.json({ success: false, message: "Failed to post message" }, 500);
      }

      return c.json({ success: true, result }, 200);
  }
);