import { io } from "socket.io-client";

export const socket = io("http://:8000");
