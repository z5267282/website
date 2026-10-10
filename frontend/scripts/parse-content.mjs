// Runs the prebuilt WASI parser over the fetched content folder.
// The parser only sees the folders preopened below, so it is given their in-sandbox paths.

import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WASI } from "node:wasi";

const resolve = (path) => fileURLToPath(new URL(path, import.meta.url));

const content = resolve("../content");
const output = resolve("../src/content");

// Preopened folders must already exist.
mkdirSync(output, { recursive: true });

const wasi = new WASI({
  version: "preview1",
  args: [
    "parser",
    "--root",
    "/content",
    "--out",
    "/out",
    ...process.argv.slice(2),
  ],
  env: process.env,
  preopens: {
    "/content": content,
    "/out": output,
  },
});

const wasm = new WebAssembly.Module(
  readFileSync(resolve("../bin/parser.wasm")),
);
const instance = new WebAssembly.Instance(wasm, wasi.getImportObject());
process.exitCode = wasi.start(instance);
