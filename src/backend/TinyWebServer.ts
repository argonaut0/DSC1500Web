/**
 * A very tiny web server wrapper that only has as much functionality as I need.
 */
import { serve, Server, ServerRequest } from "std/http/server.ts";
import * as path from "std/path/mod.ts";
import { genStaticRoutes } from "./StaticRoute.ts";

export type RequestHandler = (req: ServerRequest) => void;

export interface ITinyWebServer {
  /**
     * Register a function to be called on a GET request to a url
     * @param fn Function to handle the request
     * @param url URI to trigger on
     */
  onGET(fn: RequestHandler, url: string): void;

  /**
     * Statically serve a folder
     * @param path Path relative to deno execution directory
     */
  serveStatic(path: string): void;

  /**
     * Starts handling requests
     */
  listen(handler?: RequestHandler): Promise<void>;
}

export default class TinyWebServer implements ITinyWebServer {
  private server: Server;
  private routes: Map<string, string>;
  private endpoints: Map<string, RequestHandler>;

  constructor(port: number) {
    this.routes = new Map();
    this.endpoints = new Map();
    this.server = serve(`:${port}`);
  }

  public onGET(fn: RequestHandler, url: string): void {
    this.endpoints.set(url, fn);
  }

  public serveStatic(dir: string): void {
    this.routes = new Map([...this.routes, ...genStaticRoutes(dir)]);
  }

  public async listen(): Promise<void> {
    for await (const req of this.server) {
      this.handleRequest(req);
    }
  }

  private handleRequest(req: ServerRequest): void {
    const efn = this.endpoints.get(req.url);
    if (typeof efn === "function") {
      efn(req);
    } else if (req.method === "GET") {
      const fpath = this.routes.get(req.url);
      if (typeof fpath === "string") {
        Deno.readFile(fpath).then(
          (data) => {
            req.respond({ status: 200, body: data });
          },
        ).catch(
          (reason) => {
            req.respond({ status: 404, body: "404 Not Found" });
            console.error(`Error Reading ${fpath}`, reason);
          },
        );
      }
    }
  }
}

if (import.meta.main) {
  const testFn = (req: ServerRequest) => {
    console.log(`Callback ran for ${req.url}`);
    req.respond({ status: 418, body: "I'm a teapot" });
  };
  const server = new TinyWebServer(8080);
  server.onGET(testFn, "/rooms");
  server.serveStatic("src/frontend");
  server.listen();
}
