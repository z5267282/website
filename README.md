# Overview

Source code for my personal website.

## Project Structure

| Folder      | Description                                                   |
| ----------- | ------------------------------------------------------------- |
| `frontend/` | The React site, plus the scripts that run the build pipeline. |
| `parser/`   | A Rust crate that parses the Markdown content into JSON.      |

## Build Pipeline

The content is written in Markdown in a
[separate repository](https://github.com/z5267282/content). To build the site,
the content is fetched into `frontend/content/`, parsed into JSON by a
pre-compiled WebAssembly build of the parser, and then pre-rendered into a
static site. The whole pipeline runs with `npm run build:site` from
`frontend/`. See the [frontend README](./frontend/README.md) for details.

## Frontend Rendered Features

Some Markdown features are rendered by the frontend rather than the parser.
Quotes, where a line starts with `>`, are part of these frontend-rendered
features. See the [parser README](./parser/README.md#frontend-rendered) for the
full list.
