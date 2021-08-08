/**
 * Module responsible for recursively generating routes from a folder.
 */
import * as path from "std/path/mod.ts";

/**
 * Helper for traversing directory recursively.
 * @param p directory to traverse.
 * @returns Map<string,string> where K = url and V = local path to file
 */
function recurseRead(p: string): Map<string, string> {
  const routes: Map<string, string> = new Map();
  traverse(p, p, routes);
  return routes;
}

/**
 *
 * @param p directory to traverse.
 * @param root relative path of folder to serve.
 * @param routes accumulated routes.
 */
function traverse(p: string, root: string, routes: Map<string, string>): void {
  const entries = Deno.readDirSync(p);
  for (const e of entries) {
    if (e.isFile) {
      const filep = path.join(p, e.name);
      routes.set(filep.substring(filep.indexOf(root) + root.length), filep);
    } else if (e.isDirectory) {
      traverse(path.join(p, e.name), root, routes);
    }
  }
}

/**
 * Adds additional routes for the root of each folder with an index.html
 * Example: /index.html -> adds / as a route
 *          /test/index.html -> adds /test/ as a route
 */
function genDirPages(routes: Map<string, string>) {
  for (const route of routes) {
    if (route[0].includes("index.html")) {
      routes.set(
        route[0].substring(0, route[0].indexOf("index.html")),
        route[1],
      );
    }
  }
  return routes;
}

/**
 * Generates routes for staticly serving a directory.
 * @param p relative directory to generate routes from, without leading "./"
 * @returns Map<string,string> where K = url and V = local path to file.
 */
export function genStaticRoutes(p: string) {
  return genDirPages(recurseRead(p));
}

if (import.meta.main) {
  const staticpath = "src/frontend";
  console.log(genStaticRoutes(staticpath));
}
