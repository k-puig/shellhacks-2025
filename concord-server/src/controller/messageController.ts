import {
  editMessage,
  getMessageInformation,
  getMessagesBefore,
  sendMessageToChannel,
} from "../services/messageService";
import { PutMessage } from "../validators/messageValidator";

export async function fetchMessageData(id: string) {
  return await getMessageInformation(id);
}

export async function fetchMessagesBefore(date: string, channelId: string) {
  return getMessagesBefore(date, channelId);
}

export async function sendMessage(
  channelId: string,
  userId: string,
  content: string,
  token: string,
  repliedMessageId: string | null,
) {
  return await sendMessageToChannel(
    channelId,
    userId,
    content,
    token,
    repliedMessageId,
  );
}

export async function putMessage(data: PutMessage) {
  return await editMessage(data);
}
