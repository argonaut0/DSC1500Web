import TinyWebServer from "./TinyWebServer.ts";
import PC1500Socket from "./pc1500-socket.ts";
import { acceptWebSocketRequest } from "./WSS.ts";
import { WebSocket, isWebSocketCloseEvent } from "std/ws/mod.ts";
import { ServerRequest } from "std/http/server.ts";

const dec = new TextDecoder();

const pcSock = new PC1500Socket("192.168.1.1", 1111, "192.168.1.4", 1111);
const server = new TinyWebServer(8080);

pcSock.listen();

/**
 * use Deno.Conn.rid to identify callback for each function
 * rid should be unique per program execution
 * I have no idea what happens if it overflows.. can it overflow?
 * it is a js number (int), so max safe int is 9 quadrillion.
 * the server would need to handle >28 million
 * new connections per second to overflow within 10 years of non-stop operation.
 *
 */
async function wsCallback(ws: WebSocket) {
  pcSock.onRequest(
    (req) => {
      ws.send(dec.decode(req[0]));
    }, ws.conn.rid
  );
  for await(const event of ws) {
    if (isWebSocketCloseEvent(event)) {
      pcSock.unregister(ws.conn.rid);
    }
  }
}

function handleWS(req: ServerRequest) {
  acceptWebSocketRequest(req, wsCallback);
}

server.serveStatic("src/frontend");
server.onGET(handleWS, "/websocket");

server.listen();
