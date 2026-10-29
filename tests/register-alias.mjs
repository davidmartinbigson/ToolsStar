// Maps the repo's "@/…" path alias for plain Node, so the test suite can
// import real app modules (lib/articles.js etc.) without a bundler.
import { register } from "node:module";

register("./alias-loader.mjs", import.meta.url);
