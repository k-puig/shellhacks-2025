import {
  Message,
  MessagePing,
  PrismaClient,
  Role,
  Reply,
} from "@prisma/client";
import { CreateUserInput } from "../validators/userValidator";

const prisma = new PrismaClient();

export async function sendMessageToChannel(
  channelId: string,
  userId: string,
  content: string,
  repliedMessageId: string | null,
): Promise<{
  id: string;
  channelId: string;
  userId: string;
  text: string;
  deleted: boolean;
  replies: null | {
    messageId: string;
    repliesToId: string;
    repliesToText: string;
  };
} | null> {
  try {
    const newMessage = await prisma.message.create({
      data: {
        channelId: channelId,
        userId: userId,
        text: content,
        deleted: false,
      },
    });

    if (!newMessage) {
      return null;
    }

    let origMessage;
    if (repliedMessageId) {
      origMessage = await prisma.message.findUnique({
        where: {
          id: repliedMessageId,
        },
      });

      if (!origMessage) {
        throw new Error("could not find original message to reply to");
      }

      await prisma.reply.create({
        data: {
          messageId: newMessage.id,
          repliesToId: origMessage.id,
        },
      });
    }

    return {
      ...newMessage,
      channelId: newMessage.channelId!,
      userId: newMessage.userId!,
      replies: origMessage
        ? {
            messageId: newMessage.id,
            repliesToId: origMessage?.id,
            repliesToText: origMessage?.text,
          }
        : null,
    };
  } catch (error) {
    return null;
  }
}
