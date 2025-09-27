import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, resolver } from "hono-openapi";
import { postMessageToChannel, 
    deleteMessageFromChannel 
} from "../controller/realtime";

const app = new Hono();

app.post(
    "message/",
    zValidator({
        body: z.object({
            content: z.string().min(1).max(500)
        })
    }),
    async (c) => {
        const { instanceId, categoryId, channelId } = c.req.params;
        const { content } = c.req.body;

        return postMessageToChannel(c.get("io"), {
            instanceId,
            categoryId,
            channelId,
            content
        });
    }
);