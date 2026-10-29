// Resolve hook: "@/x" → "<repo root>/x", exactly like jsconfig's paths alias.
// Node's ESM resolver (unlike webpack/Next) needs explicit extensions, so we
// also try the usual suffixes when the specifier has none.
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXT = ["", ".js", ".mjs", ".json"];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = join(ROOT, specifier.slice(2));
    for (const ext of EXT) {
      if (existsSync(base + ext) && !existsSync(base + ext + "/")) {
        return nextResolve(pathToFileURL(base + ext).href, context);
      }
    }
    // directory with an index? (not used today, but cheap to support)
    for (const ext of EXT.slice(1)) {
      if (existsSync(join(base, "index" + ext))) {
        return nextResolve(pathToFileURL(join(base, "index" + ext)).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
