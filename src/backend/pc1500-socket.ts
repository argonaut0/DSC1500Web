export type PC1500Request = [Uint8Array, Deno.Addr];

export type RequestCallback = (req: PC1500Request) => void;

export interface IPC1500Socket {
    /**
     * Starts listening for and processing requests.
     */
    listen(): Promise<void>;

    /**
     * Register a function to be called when an request arrives.
     * @param fn Callback Function.
     */
    onRequest(fn: RequestCallback): void;
}

export default class PC1500Socket implements IPC1500Socket {
    private local: Deno.NetAddr & { transport: "udp" };
    private remote: Deno.NetAddr & { transport: "udp" };
    private requestCallbacks: RequestCallback[] = [];
    private enc = new TextEncoder();
    private dec = new TextDecoder();
    private udpSocket: Deno.DatagramConn;

    /**
     * 
     * @param localAddr Local hostname.
     * @param localPort Local port.
     * @param remoteAddr Remote hostname.
     * @param remotePort Remote port.
     */
    constructor(localAddr: string, localPort: number, remoteAddr: string, remotePort: number) {
        this.local = {
            transport: "udp",
            port: localPort,
            hostname: localAddr
        };
        this.remote = {
            transport: "udp",
            port: remotePort,
            hostname: remoteAddr
        };
        this.udpSocket = Deno.listenDatagram(this.local);
    }

    async listen(): Promise<void> {
        this.udpSocket.send(this.enc.encode("U"), this.remote);
        for await (const req of this.udpSocket) {
            for (const fn of this.requestCallbacks) {
                fn(req);
            }
        }
    }
    onRequest(fn: RequestCallback): void {
        this.requestCallbacks.push(fn);
    }
}

if (import.meta.main) {
    const dec = new TextDecoder();
    const logReqMsg = (req: [Uint8Array, Deno.Addr]) => {
        console.log(dec.decode(req[0]));
    }

    const pcSock = new PC1500Socket("192.168.1.1", 1111, "192.168.1.4", 1111);
    pcSock.onRequest(logReqMsg);
    pcSock.listen();
    console.log("after listen()");
}

/**
 * todo: implement unsubscribe via register with Deno.Conn.rid
 * rid should be unique per program execution
 * I have no idea what happens if it overflows.. can it overflow?
 * it is a js number (int), so max safe int is 9 quadrillion.
 * the server would need to handle >28 million
 * new connections per second to overflow within 10 years of non-stop operation.
 * 
 */