import io, { Server, type DefaultEventsMap } from "socket.io";
import http from "http";

class IoServer {
  ioServer: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  constructor(
    private httpServer: http.Server<
      typeof http.IncomingMessage,
      typeof http.ServerResponse
    >,
  ) {
    this.ioServer = new io.Server(httpServer);

    this.ioServer.use((socket) => {});

    this.ioServer.on("connection", (socket: io.Socket) => {
      socket.id;
    });
  }
}
