import type { Server as HttpServer } from "node:http";
import type { Server as HttpsServer } from "node:https";
import net from "node:net";

type DualProtocolServerOptions = {
  httpServer: HttpServer;
  httpsServer: HttpsServer;
  port: number;
  onListen: () => void;
};

const TLS_HANDSHAKE_BYTE = 22;

export function listenWithHttpAndHttps({
  httpServer,
  httpsServer,
  port,
  onListen,
}: DualProtocolServerOptions) {
  const server = net.createServer((socket) => {
    socket.once("data", (chunk) => {
      socket.pause();

      const targetServer = chunk[0] === TLS_HANDSHAKE_BYTE ? httpsServer : httpServer;
      targetServer.emit("connection", socket);

      socket.unshift(chunk);
      socket.resume();
    });
  });

  server.listen(port, onListen);

  return server;
}
