export type PC1500Request = [Uint8Array, Deno.Addr];

export type RequestCallback = (req: PC1500Request) => void;

export default class PC1500Socket {
  private local: Deno.NetAddr & { transport: "udp" };
  private remote: Deno.NetAddr & { transport: "udp" };
  private requestCallbacks: Map<number, RequestCallback> = new Map();
  private enc = new TextEncoder();
  private dec = new TextDecoder();
  private udpSocket!: Deno.DatagramConn;

  /**
     * Only sets socket settings.
     * @param localAddr Local hostname.
     * @param localPort Local port.
     * @param remoteAddr Remote hostname.
     * @param remotePort Remote port.
     */
  constructor(
    localAddr: string,
    localPort: number,
    remoteAddr: string,
    remotePort: number,
  ) {
    this.local = {
      transport: "udp",
      port: localPort,
      hostname: localAddr,
    };
    this.remote = {
      transport: "udp",
      port: remotePort,
      hostname: remoteAddr,
    };
  }

  /**
     * Binds to underlying socket and starts processing events.
     */
  async listen(): Promise<void> {
    if (!this.udpSocket) {
      this.udpSocket = Deno.listenDatagram(this.local);
      this.udpSocket.send(this.enc.encode("U"), this.remote);
      for await (const req of this.udpSocket) {
        for (const entry of this.requestCallbacks) {
          entry[1](req);
        }
      }
    }
  }
  /**
     * Registers a callback to handle incoming messages.
     * @param fn callback
     * @param id unique id
     */
  onRequest(fn: RequestCallback, id: number): void {
    if (this.requestCallbacks.has(id)) {
      throw new Error(`callback of id ${id} already exists`);
    }
    this.requestCallbacks.set(id, fn);
  }

  unregister(id: number): void {
    if (this.requestCallbacks.has(id)) {
      this.requestCallbacks.delete(id);
    }
  }
}

if (import.meta.main) {
  const dec = new TextDecoder();
  const logReqMsg = (req: [Uint8Array, Deno.Addr]) => {
    console.log(dec.decode(req[0]));
  };

  const pcSock = new PC1500Socket("192.168.1.1", 1111, "192.168.1.4", 1111);
  pcSock.onRequest(logReqMsg, 1);
  pcSock.listen();
  console.log("after listen()");
}