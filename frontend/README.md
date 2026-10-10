# Overview

The website, built as a static site with
[`vite-react-ssg`](https://github.com/Daydreamer-riri/vite-react-ssg).

## Build Pipeline

The site is built from Markdown content in three steps.

1. **Fetch** - `scripts/fetch-content.sh` downloads the
   [content repository](https://github.com/z5267282/content) into `content/`.
2. **Parse** - `scripts/parse-content.mjs` runs the pre-compiled parser,
   `bin/parser.wasm`, over `content/` and writes JSON into `src/content/`.
3. **Build** - `vite-react-ssg` pre-renders the pages from `src/content/`.

The parser is compiled to WebAssembly so the build only needs Node, not Rust.
Both `content/` and `src/content/` are generated and should not be committed.

## Scripts

| Command                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Starts the development server.                                |
| `npm run build`        | Pre-renders the site into `dist/`.                            |
| `npm run fetch`        | Downloads the content into `content/`.                        |
| `npm run parse`        | Parses `content/` into `src/content/` with `bin/parser.wasm`. |
| `npm run build:site`   | Runs the full pipeline: `fetch`, then `parse`, then `build`.  |
| `npm run build:parser` | Recompiles `bin/parser.wasm` from `../parser`. Needs Rust.    |
| `npm run preview`      | Serves the built site locally.                                |
| `npm run lint`         | Lints the code with ESLint.                                   |
| `npm run test`         | Runs the tests with Vitest.                                   |

`npm run build:parser` must be rerun whenever the parser changes, so that
`bin/parser.wasm` stays up to date.
