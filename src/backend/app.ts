import TinyWebServer from "./TinyWebServer.ts";
import PC1500Socket from "./pc1500-socket.ts";
import { acceptWebSocketRequest } from "./WSS.ts";
import { WebSocket } from "std/ws/mod.ts";
import { ServerRequest } from "std/http/server.ts";

const dec = new TextDecoder();

const pcSock = new PC1500Socket("192.168.1.1", 1111, "192.168.1.4", 1111);
const server = new TinyWebServer(8080);

pcSock.listen();

function wsCallback(ws: WebSocket) {
  pcSock.onRequest(
    (req) => {
      ws.send(dec.decode(req[0]));
    },
  );
}

function handleWS(req: ServerRequest) {
  acceptWebSocketRequest(req, wsCallback);
}

server.serveStatic("src/frontend");
server.onGET(handleWS, "/websocket");

server.listen();
