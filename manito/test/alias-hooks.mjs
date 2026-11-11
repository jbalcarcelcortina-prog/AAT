import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relative = specifier.slice(2);
    const candidates = [
      `${SRC}${relative}`,
      `${SRC}${relative}.ts`,
      `${SRC}${relative}.tsx`,
      `${SRC}${relative}.js`,
      `${SRC}${relative}/index.ts`,
    ];
    const hit = candidates.find((candidate) => existsSync(candidate));
    if (hit) {
      return nextResolve(pathToFileURL(hit).href, context);
    }
  }

  return nextResolve(specifier, context);
}
