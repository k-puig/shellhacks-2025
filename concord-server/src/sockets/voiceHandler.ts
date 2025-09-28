import { Server, Socket } from "socket.io";

//TEST IGNORE
export function registerVoiceHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Voice socket connected: ${socket.id}`);

    socket.on("join-voice-channel", (channelId: string) => {
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined voice channel ${channelId}`);
      // Optionally, notify others in the channel
      socket.to(channelId).emit("user-joined-voice", socket.id);
    });

    socket.on("leave-voice-channel", (channelId: string) => {
      socket.leave(channelId);
      console.log(`Socket ${socket.id} left voice channel ${channelId}`);
      // Optionally, notify others in the channel
      socket.to(channelId).emit("user-left-voice", socket.id);
    });

    socket.on("voice-data", (channelId: string, data: any) => {
      // Broadcast voice data to all other clients in the same channel
      socket.to(channelId).emit("voice-data", socket.id, data);
    });

    socket.on("disconnect", () => {
      console.log(`Voice socket disconnected: ${socket.id}`);
      // Handle user leaving all voice channels they were in
      // (e.g., iterate through socket.rooms if you need to emit to specific channels)
    });
  });
}
