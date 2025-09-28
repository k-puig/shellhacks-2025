import { PrismaClient } from "@prisma/client";
import type { Server, Socket } from "socket.io";
import { sendMessageToChannel } from "./messageService";

const prisma = new PrismaClient();

const EVENTS = {
  NEW_CHANNEL_MESSAGE: "new_channel_message",
  DELETE_CHANNEL_MESSAGE: "delete_channel_message",
  MESSAGE_PING: "message_ping",
};

export async function sendMessageToChannelEvent(
  instanceId: string,
  categoryId: string,
  channelId: string,
  userId: string,
  content: string,
  token: string,
  repliedMessageId: string | null,
  event: string,
  io: any,
): Promise<string | boolean> {
  try {
    //TODO: implement middleware to replace this
    if (EVENTS.NEW_CHANNEL_MESSAGE === event) {
      throw new Error("Event not implemented");
    }

    const newMessage = await sendMessageToChannel(channelId, userId, content, token, repliedMessageId);

    if (!newMessage) {
      console.log("services::realtime::sendMessageToChannel - could not create new message");
      return "failed to create message"
    }

    return new Promise((resolve) => {
      io.to(instanceId).emit(event, newMessage, (ack: any) => {
        if (ack && ack.status === "received") {
          console.log(`Message ${ack.messageId} acknowledged by client.`);
          resolve(true);
        } else {
          console.log(
            "services::realtime::sendMessageToChannel No acknowledgment received from client.",
          );
          resolve("no acknowledgment");
        }
      });
    });
  } catch (err) {
    const errMessage = err as Error;
    if (errMessage.message === "Event not implemented") {
      console.log(
        `services::realtime::sendMessageToChannel - Event not implemented. Attempted event: ${event}`,
      );
      return "event not implemented";
    }
    console.log("services::realtime::sendMessageToChannel - ", errMessage);
    return false;
  }
}

export async function removeMessageFromChannel(
  instanceId: string,
  categoryId: string,
  channelId: string,
  messageId: string,
  event: string,
  io: any,
): Promise<string | boolean> {
  try {
    //TODO: implement middleware to replace this
    if (EVENTS.DELETE_CHANNEL_MESSAGE === event) {
      throw new Error("event not implemented");
    }

    //TODO: add prisma to flag a channel message as deleted

    return new Promise((resolve) => {
      io.to(instanceId).emit(event, { messageId }, (ack: any) => {
        if (ack && ack.status === "received") {
          console.log(`Message ${ack.messageId} acknowledged by client.`);
          resolve(true);
        } else {
          console.log(
            "services::realtime::deleteMessageFromChannel No acknowledgment received from client.",
          );
          resolve("no acknowledgment");
        }
      });
    });
  } catch (err) {
    const errMessage = err as Error;
    if (errMessage.message === "Event not implemented") {
      console.log(
        `services::realtime::deleteMessageFromChannel - Event not implemented. Attempted event: ${event}`,
      );
      return false;
    }
    console.log("services::realtime::deleteMessageFromChannel - ", errMessage);
    return false;
  }
}


export async function messagePing(
  instanceId: string,
  categoryId: string,
  channelId: string,
  messageId: string,
  userId: string,
  pingType: string,
  text: string,
  io: any,
  mentionedUserIds?: string[],
): Promise<string | boolean> {
  try {
    const curInstance = await prisma.instance.findUnique({ where: { id: instanceId } });
    if (!curInstance) throw new Error("instance not found");

    const curCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!curCategory) throw new Error("category not found");

    const curChannel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!curChannel) throw new Error("channel not found");

    if (pingType === "mention") {
      if (!mentionedUserIds || mentionedUserIds.length === 0) {
        throw new Error("no mentioned users provided for mention ping");
      }

      // Persist pings (best-effort)
      try {
        const rows = mentionedUserIds.map((m) => ({ messageId, pingsUserId: m }));
        await prisma.messagePing.createMany({ data: rows, skipDuplicates: true });
      } catch (e) {
        console.warn("services::realtime::messagePing - could not persist pings", e);
      }

      const timeoutMs = 5000;
      const results: Array<{ userId: string; delivered: boolean }> = [];

      // For each mentioned user, find sockets on this server with matching socket.data.userId
      await Promise.all(
        mentionedUserIds.map(async (mentionedUserId) => {
          const socketsForUser: Socket[] = [];
          for (const sock of Array.from((io as Server).sockets.sockets.values())) {
            try {
              if ((sock as Socket).data?.userId === mentionedUserId) socketsForUser.push(sock as Socket);
            } catch {}
          }

          if (socketsForUser.length === 0) {
            results.push({ userId: mentsocketsionedUserId, delivered: false });
            return;
          }

          const perSocket = socketsForUser.map(
            (sock) =>
              new Promise<boolean>((resolve) => {
                let done = false;
                try {
                  sock.emit(
                    EVENTS.MESSAGE_PING,
                    { categoryId, channelId, messageId, pingType, text, mentionedUserId },
                    (ack: any) => {
                      if (done) return;
                      done = true;
                      resolve(!!ack && ack.status === "received");
                    },
                  );
                } catch (e) {
                  if (!done) {
                    done = true;
                    resolve(false);
                  }
                }

                setTimeout(() => {
                  if (done) return;
                  done = true;
                  resolve(false);
                }, timeoutMs);
              }),
          );

          try {
            const settled = await Promise.all(perSocket);
            const delivered = settled.some(Boolean);
            results.push({ userId: mentionedUserId, delivered });
          } catch {
            results.push({ userId: mentionedUserId, delivered: false });
          }
        }),
      );

      const anyDelivered = results.some((r) => r.delivered);
      if (anyDelivered) {
        console.log("services::realtime::messagePing delivered to some users", results);
        return true;
      }

      console.log("services::realtime::messagePing no acknowledgments", results);
      return "no acknowledgment";
    }

    // Fallback: emit a generic ping to the instance (fire-and-forget ack optional)
    return new Promise((resolve) => {
      (io as Server).emit(EVENTS.MESSAGE_PING, { categoryId, channelId, messageId, pingType, text }, (ack: any) => {
        if (ack && ack.status === "received") {
          resolve(true);
        } else {
          resolve("no acknowledgment");
        }
      });
    });
  } catch (err) {
    const errMessage = err as Error;
    console.log("services::realtime::messagePing - ", errMessage);
    return false;
  }
}