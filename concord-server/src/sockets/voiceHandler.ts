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
      
      // Store userId in socket.data for easier access later
      socket.data.userId = payload.userId;
      socket.data.currentVoiceChannelId = payload.voiceChannelId;
    });

    // Leave voice channel
    socket.on("leave-voicechannel", async (data) => {
      const payload = data as {
        userId: string,
        userToken: string,
        voiceChannelId: string,
      };
      if (!payload) {
        socket.emit("error-voicechannel", "no payload in leave voice request");
        return;
      }

      const channelMembers = voiceChannelMembers.get(payload.voiceChannelId);
      if (!channelMembers) {
        socket.emit("error-voicechannel", "voice channel not found");
        return;
      }

      // authenticate user
      const userCreds = await getUserCredentials(payload.userId);
      if (!userCreds || !userCreds.token || userCreds.token != payload.userToken) {
        socket.emit("error-voicechannel", "bad user creds in leave voice request");
        return;
      }

      // Remove user from channel
      if (channelMembers.has(payload.userId)) {
        channelMembers.delete(payload.userId);
        
        // Leave the socket.io room
        socket.leave(payload.voiceChannelId);
        
        // Notify other users in the channel
        socket.to(payload.voiceChannelId).emit("user-left-voicechannel", { 
          userId: payload.userId, 
          voiceChannelId: payload.voiceChannelId 
        });
        
        // Clean up empty channels
        if (channelMembers.size === 0) {
          voiceChannelMembers.delete(payload.voiceChannelId);
        }
        
        // Confirm to the user that they've left
        socket.emit("left-voicechannel", { 
          voiceChannelId: payload.voiceChannelId 
        });
        
        // Clear socket data
        socket.data.currentVoiceChannelId = undefined;
      } else {
        socket.emit("error-voicechannel", "user not in voice channel");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Get the user ID and current voice channel from socket data
      const userId = socket.data.userId;
      const voiceChannelId = socket.data.currentVoiceChannelId;

      // If we have the channel ID stored, use it directly
      if (userId && voiceChannelId) {
        const channelMembers = voiceChannelMembers.get(voiceChannelId);
        if (channelMembers && channelMembers.has(userId)) {
          // Remove the user from the channel
          channelMembers.delete(userId);
          
          // Notify other members
          socket.to(voiceChannelId).emit("user-left-voicechannel", { 
            userId,
            voiceChannelId,
            reason: "disconnected"
          });
          
          // Clean up empty channels
          if (channelMembers.size === 0) {
            voiceChannelMembers.delete(voiceChannelId);
          }
        }
      } else {
        // If we don't have the info stored, search through all channels
        voiceChannelMembers.forEach((members, channelId) => {
          // Use Array.from to convert Map entries to array for iteration
          Array.from(members.entries()).forEach(([memberId, memberSocket]) => {
            if (memberSocket.id === socket.id) {
              // Found the user in this channel
              members.delete(memberId);
              
              // Notify other members
              socket.to(channelId).emit("user-left-voicechannel", { 
                userId: memberId,
                voiceChannelId: channelId,
                reason: "disconnected"
              });
              
              // Clean up empty channels
              if (members.size === 0) {
                voiceChannelMembers.delete(channelId);
              }
            }
          });
        });
      }
    });
  });
}
