import * as socketIO from "socket.io";
import * as socketService from "./socket.service.js";

export const initSocket = (server) => {
  try {
    const io = new socketIO.Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      pingInterval: 5000,
      pingTimeout: 1000 * 60 * 5,
      path: "/socket.io",
    });

    io.on("connection", (socket) => {
      console.log("A user connected");

      socket.on("streamingGenerate", (event) =>
        socketService.onStreamingGenerate(socket, event)
      );

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  } catch (err) {
    console.error(err);
  }
};
