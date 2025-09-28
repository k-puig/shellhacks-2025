import { Context } from "hono";
import {
  sendMessageToChannelEvent,
  removeMessageFromChannel,
} from "../services/realtime.js";
import { success } from "zod";
import { PostMessageToChannelInput } from "../validators/realtimeValidator.js";
import { sendMessage } from "./messageController.js";

export async function postMessageToChannel(io: any, c: Context, data: PostMessageToChannelInput) {
  const instanceId = data.instanceId;
  const categoryId = data.categoryId;
  const channelId = data.channelId;
  const userId = data.userId;
  const content = data.content;
  const token = data.token;
  const repliedMessageId = data.repliedMessageId ?? null;
  const event = "new_channel_message";
  return sendMessageToChannelEvent(
    instanceId,
    categoryId,
    channelId,
    userId,
    content,
    token,
    repliedMessageId,
    event,
    io
  );
}

export async function deleteMessageFromChannel(io: any, c: Context) {
  try {
    io = c.get("io");

    const instanceId = c.req.param("instanceId");
    const categoryId = c.req.param("categoryId");
    const channelId = c.req.param("channelId");
    const messageId = c.req.param("messageId");

    const result = await removeMessageFromChannel(
      instanceId,
      categoryId,
      channelId,
      messageId,
      "delete_channel_message",
      io,
    );

    if (result === "event not implemented") {
      console.log(
        "controller::realtime::deleteMessageFromChannel - Event not implemented",
      );
      return c.json({
        success: false,
        message: "Event not implemented or recognized",
        status: 400,
      });
    }

    if (result === "no acknowledgment") {
      console.log(
        "controller::realtime::deleteMessageFromChannel - No acknowledgment received from client",
      );
      return c.json({
        success: false,
        message: "No acknowledgment received from client",
        status: 500,
      });
    }

    if (!result) {
      throw new Error("failed to delete message");
    }

    c.json({
      success: true,
      message: "Message deleted successfully",
      status: 200,
    });
  } catch (err) {
    const errMessage = err as Error;
    console.log("services::realtime::deleteMessageFromChannel - ", errMessage);
    return c.json({
      success: false,
      message: errMessage.message,
      status: 500,
    });
  }
}
