import { Server, Socket } from "socket.io";
import { getUserCredentials, getUserInformation } from "../services/userService";
import { getAllInstances, getInstanceByChannelId, getInstancesByUserId } from "../services/instanceService";
import { getCategoriesByInstance, getCategory, getChannel } from "../services/channelService";

// Change to Map of voiceChannelId to Map of userId to socket
const voiceChannelMembers = new Map<string, Map<string, Socket>>();

export function registerVoiceHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    // Join voice channel
    socket.on("join-voicechannel", async (data) => {
      const payload = data as {
        userId: string
        userToken: string,
        voiceChannelId: string,
      };
      if (!payload) {
        socket.emit("error-voicechannel", "no payload in voice conn")
        return;
      }

      // Initialize map for channel if not present
      if (!voiceChannelMembers.has(payload.voiceChannelId)) {
        voiceChannelMembers.set(payload.voiceChannelId, new Map());
      }

      const channelMembers = voiceChannelMembers.get(payload.voiceChannelId)!;

      // Remove user if already present in this channel
      if (channelMembers.has(payload.userId)) {
        channelMembers.delete(payload.userId);
      }

      // authenticate user
      const userCreds = await getUserCredentials(payload.userId);
      if (!userCreds || !userCreds.token || userCreds.token != payload.userToken) {
        socket.emit("error-voicechannel", "bad user creds in voice conn");
        return;
      }

      // determine if channel is voice channel
      const channel = await getChannel(payload.voiceChannelId);
      if (!channel || channel.type !== "voice" || !channel.categoryId) {
        socket.emit("error-voicechannel", "bad channel or channel type in voice conn");
        return;
      }

      // authorize user using role
      const user = await getUserInformation(payload.userId);
      const instance = await getInstanceByChannelId(payload.voiceChannelId);
      const instances = await getInstancesByUserId(payload.userId);
      if (!user || !instance || !instances || !instances.find(e => e.id === instance.id)) {
        socket.emit("error-voicechannel", "user not authorized for channel in voice conn");
        return;
      }

      // add to map
      channelMembers.set(payload.userId, socket);

      socket.join(payload.voiceChannelId);
      socket.emit("joined-voicechannel", { 
        voiceChannelId: payload.voiceChannelId,
        connectedUserIds: Array.from(channelMembers.keys()).filter(e => e !== payload.userId)
      });
      socket.to(payload.voiceChannelId).emit("user-joined-voicechannel", { userId: payload.userId });
    });

  });
}
