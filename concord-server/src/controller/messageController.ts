import { getMessageInformation, sendMessageToChannel } from "../services/messageService";

export async function fetchMessageData(id:string) {
    return await getMessageInformation(id);
}

export async function sendMessage(
    channelId: string,
    userId: string,
    content: string,
    token: string,
    repliedMessageId: string | null
) {
    return await sendMessageToChannel(
        channelId,
        userId,
        content,
        token,
        repliedMessageId
    );
}