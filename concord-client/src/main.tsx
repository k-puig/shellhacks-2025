import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { io } from "socket.io-client";
import "./index.css";

function printPayload(data: unknown) {
  console.log(data);
}

const socket = io("http://localhost:3000");
socket.on("connect", () => {
  console.log("connected!");
  socket.emit("ping", "world");
});
socket.on("pong", () => {
  console.log("pong");
});

socket.on("joined-voicechannel", printPayload);
socket.on("user-joined-voicechannel", printPayload);
socket.on("error-voicechannel", printPayload);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
