import { io } from "socket.io-client";

const URL = import.meta.env.PROD === true ? undefined : "http://localhost:5173";

export const socket = io(URL);
