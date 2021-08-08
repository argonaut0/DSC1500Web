import * as path from "std/path/mod.ts";


function recurseRead(p: string): Map<string, string> {
    const routes: Map<string, string> = new Map();
    traverse(p, p, routes);
    return routes;
}


function traverse(p: string, root: string, routes: Map<string, string>): void {
    const entries = Deno.readDirSync(p);
    for (const e of entries) {
        if (e.isFile) {
            const filep = path.join(p,e.name);
            routes.set(filep.substring(filep.indexOf(root) + root.length), filep);
        } else if (e.isDirectory) {
            traverse(path.join(p,e.name), root, routes);
        }
    }
}

function genDirPages(routes: Map<string, string>) {
    for (const route of routes) {
        if (route[0].includes("index.html")) {
            routes.set(route[0].substring(0, route[0].indexOf("index.html")), route[1]);
        }
    }
    return routes;
}

export function genStaticRoutes(p: string) {
    return genDirPages(recurseRead(p));
}


if (import.meta.main) {
    const staticpath = "src/frontend";
    console.log(genStaticRoutes(staticpath));
}
