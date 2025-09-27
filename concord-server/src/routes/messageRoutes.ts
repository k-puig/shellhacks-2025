import { Hono } from "hono";
import { describeResponse, describeRoute, resolver } from "hono-openapi";
import { getMessageByIdSchema, sendMessageSchema } from "../validators/messageValidator";
import { zValidator } from "@hono/zod-validator";
import { fetchMessageData, sendMessage } from "../controller/messageController";

const messageRoutes = new Hono();

messageRoutes.get(
    "/:id",
    describeRoute({
        description: "Get message by id",
        responses: {
            200: {
                description: "Success getting message",
                content: {
                    "application/json": { schema: resolver(getMessageByIdSchema) }
                }
            },
            404: {
                description: "Message id not found",
                content: {
                    "application/json": { schema: resolver(getMessageByIdSchema) }
                }
            }
        }
    }),
    zValidator("param", getMessageByIdSchema),
    async (c) => {
        const id = c.req.param("id");
        const messageData = await fetchMessageData(id);

        if (messageData) {
            return c.json(messageData, 200);
        } else {
            return c.json({ error: "Message not found" }, 404);
        }
    }
)

messageRoutes.post(
    "",
    describeRoute({
        description: "Send a message to a channel",
        responses: {
            201: {
                description: "Message sent successfully",
                content: {
                    "application/json": { schema: resolver(sendMessageSchema) }
                }
            },
            401: {
                description: "Unauthorized - invalid token or user credentials",
                content: {
                    "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } }
                }
            },
            500: {
                description: "Server error",
                content: {
                    "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } }
                }
            }
        }
    }),
    zValidator("json", sendMessageSchema),
    async (c) => {
        const { channelId, userId, content, token, repliedMessageId } = await c.req.json();
        
        const result = await sendMessage(
            channelId,
            userId,
            content,
            token,
            repliedMessageId || null
        );

        if (result) {
            return c.json(result, 201);
        } else {
            return c.json({ error: "Failed to send message. Check your credentials and try again." }, 401);
        }
    }
)

export default messageRoutes;