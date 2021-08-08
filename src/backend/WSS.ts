import { ServerRequest } from "std/http/server.ts";
import {
  acceptable,
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "std/ws/mod.ts";

export type WebSocketCallback = (ws: WebSocket) => void;

export function acceptWebSocketRequest(
  req: ServerRequest,
  callback: WebSocketCallback,
) {
  if (acceptable(req)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    }).then(callback).catch(async (err) => {
      console.error(`failed to accept websocket: ${err}`);
      await req.respond({ status: 400 });
    });
  }
}
