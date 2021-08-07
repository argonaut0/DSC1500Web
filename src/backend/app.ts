import { serve, ServerRequest } from "https://deno.land/std@0.103.0/http/server.ts";
import {
    acceptWebSocket,
    isWebSocketCloseEvent,
    isWebSocketPingEvent,
    WebSocket,
    acceptable,
} from "https://deno.land/std@0.103.0/ws/mod.ts";

import PC1500Socket, { PC1500Request } from "./pc1500-socket.ts";

/*
wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {

    });

    function printmsg(msg) {
        ws.send(msg.toString('utf-8'));
    }
    pcsocket.register(printmsg);    
});


*/

const staticFolder = "./src/frontend";

async function handleRequest(req: ServerRequest) {
    console.log(`Requested ${req.method} : ${req.url}`);
    if (req.url === "/websocket" && acceptable(req)) {
        const { conn, r: bufReader, w: bufWriter, headers } = req;
        acceptWebSocket({
            conn,
            bufReader,
            bufWriter,
            headers
        }).then(handleWebSocket).catch(async (err) => {
            console.error(`failed to accept websocket: ${err}`);
            await req.respond({ status: 400 });
        });
    } else if (req.method === "GET") {
        Deno.readFile(staticFolder + req.url).then(
            (data) => {
                req.respond({ status: 200, body: data});
            }).catch(
                (reason) => {
                    req.respond({ status: 404, body: "404 Not Found" });
                    console.error(`Error Reading ${staticFolder + req.url}`, reason);
                }
            );
    } else {
        await req.respond({ status: 500 });
    }
}



for (const iterator of Deno.readDirSync("./")) {
    console.log(iterator.name);
}

const dec = new TextDecoder();

const pcSock = new PC1500Socket("192.168.1.1", 1111, "192.168.1.4", 1111);
pcSock.listen();

function handleWebSocket(sock: WebSocket) {
    const sendmsg = (req: PC1500Request) => {
        sock.send(dec.decode(req[0]));
    }
    pcSock.register(sendmsg);

}

if (import.meta.main) {
    const port = "8080";
    const server = serve(`:${port}`);

    

    for await (const req of server) {
        handleRequest(req);
    }
}