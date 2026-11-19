import { io } from "socket.io-client";

const socket = io("https://adminapi.gaonse.in/");

export default socket;