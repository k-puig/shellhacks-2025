import { readonly } from "zod";

const EVENTS = {
  NEW_CHANNEL_MESSAGE: "new_channel_message",
  DELETE_CHANNEL_MESSAGE: "delete_channel_message",
};

export async function sendMessageToChannel(
  instanceId: string,
  categoryId: string,
  channelId: string,
  message: any,
  event: string,
  io: any,
): Promise<string | boolean> {
  try {
    //TODO: implement middleware to replace this
    if (EVENTS.NEW_CHANNEL_MESSAGE === event) {
      throw new Error("Event not implemented");
    }

    //TODO: add prisma to save channel message to DB

    return new Promise((resolve) => {
      io.to(instanceId).emit(event, message, (ack: any) => {
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
