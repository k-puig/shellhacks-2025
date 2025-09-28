import { Server } from "socket.io";
import { registerVoiceHandlers } from "./voiceHandler";
import { registerMessageHandlers } from "./messageHandler";

export function registerSocketHandlers(io: Server) {
  // bad practice
  io.on("connection", (socket) => {
    console.log("connected");
    socket.on("ping", (c) => {
      console.log(c);
      socket.emit("pong", c);
    });
  });

  // good practice
  registerVoiceHandlers(io);
  registerMessageHandlers(io);

}
