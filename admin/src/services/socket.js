import { io } from "socket.io-client";

export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "https://adminapi.gaonse.in";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export default socket;
