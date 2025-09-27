import {
  PrismaClient,
} from "@prisma/client";
import { getUserCredentials } from "./userService";

const prisma = new PrismaClient();

export async function getMessageInformation(id:string): Promise<{
  id: string,
  channelId: string,
  userId: string,
  text: string,
  deleted: boolean,
  replies: null | {
    messageId: string;
    repliesToId: string;
    repliesToText: string;
  };
} | null> {
  try {
    if (!id) {
      throw new Error("missing messageId");
    }

    const message = await prisma.message.findUnique({
      where: {
        id: id,
      },
    });

    if (!message) {
      throw new Error("could not find message");
    }

    // Check if this message is a reply to another message
    const replyData = await prisma.reply.findFirst({
      where: {
        messageId: id,
      },
    });

    let originalMessage = null;
    if (replyData) {
      originalMessage = await prisma.message.findUnique({
        where: {
          id: replyData.repliesToId,
        },
      });
    }

    return {
      id: message.id,
      channelId: message.channelId!,
      userId: message.userId!,
      text: message.text,
      deleted: message.deleted,
      replies: originalMessage
        ? {
            messageId: message.id,
            repliesToId: originalMessage.id,
            repliesToText: originalMessage.text,
          }
        : null,
    };
  } catch (err) {
    const errMessage = err as Error;

    if (errMessage.message === "missing messageId") {
      console.log("services::actions::getMessageInformation - missing messageId");
      return null;
    }

    if (errMessage.message === "could not find message") {
      console.log(
        "services::actions::getMessageInformation - unable to find message"
      );
      return null;
    }

    console.log(
      "services::actions::getMessageInformation - unknown error",
      errMessage
    );
    return null;
  }
}

export async function sendMessageToChannel(
  channelId: string,
  userId: string,
  content: string,
  token: string,
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
    const userCreds = await getUserCredentials(userId);
    if (!userCreds || userCreds.token != token) {
      return null;
    }

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
