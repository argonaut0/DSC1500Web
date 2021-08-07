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
    register(fn: RequestCallback): void;
}

export default class PC1500Socket implements IPC1500Socket {
    private local: Deno.NetAddr & { transport: "udp" };
    private remote: Deno.NetAddr & { transport: "udp" };
    private callbacks: RequestCallback[] = [];
    private enc = new TextEncoder();
    private dec = new TextDecoder();
    private udpSocket: Deno.DatagramConn;

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
            for (const fn of this.callbacks) {
                fn(req);
            }
        }
    }
    register(fn: RequestCallback): void {
        this.callbacks.push(fn);
    }
}

if (import.meta.main) {
    const dec = new TextDecoder();
    const logReqMsg = (req: [Uint8Array, Deno.Addr]) => {
        console.log(dec.decode(req[0]));
    }

    const pcSock = new PC1500Socket("192.168.1.1", 1111, "192.168.1.4", 1111);
    pcSock.register(logReqMsg);
    pcSock.listen();
    console.log("after listen()");
}