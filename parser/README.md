# Overview

This crate parses Markdown text into structured JSON. The full json schema is
written [here](./json_schema.md).

This command parses the whole `../content/` folder into `../frontend/src/content/`.

```sh
cargo run
```

## Content Structure

By default the parser is built around the fixed layout of the `content/`
folder, so it relies on that layout being followed.

```txt
content/
    blog/
        + interesting-topic.md
    lore/
        :lang/
            + langauge-semantic topic.md
        + lore.yaml
```

The output is generated, so it should not be committed. It lives in `src/`
rather than `public/` so that Vite bundles it into the pages that
`vite-react-ssg` pre-renders.

## Flags

To add logging the `RUST_LOG` environment variable needs to be set. For
convenience, this Shell script can be used to run with logs after building.

```sh
RUST_LOG=info ./target/debug/parser
```

To turn on pretty printing, add this argument.

```sh
cargo run -- --pretty
```

## Supported Markdown Language Features

Not all language features are supported. The full list of features was taken
from [markdownguide](https://www.markdownguide.org/basic-syntax/).

The parser runs on the following expectations:

- there is a blank line to end a particular markdown feature;
- the Markdown has been correctly formatted

### Frontmatter

All Markdown files are expected to contain the following frontmatter.

```yaml
title: title of document to show on screen
date: yyyy-mm-dd
description: brief description of file
```

The frontmatter should be enclosed with `---` and be at the top of the file.

### Supported - ✅

#### Headings

These must start with leading `'#'` characters followed by one spacebar `' '`.  
There must also be a blank line before and after a heading.

```txt

# Heading

```

#### Paragraphs and Line Breaks

A blank line is needed to separate paragraphs.  
Two lines forces a newline.

```txt
Paragraph 1 sentence 1.
Paragraph 1 sentence 2.

Paragraph 2.
```

#### Ordered Lists

These must start with a number and then a `'.'`.  
It is assumed that the lists are correctly enumerated from `[1,n]` for an `n`-sized list.

```txt
1. one
2. two
```

#### Unordered Lists

These must start with `'- '`.

```txt
- apple
- orange
```

#### Code Blocks

If a language is provided it must be directly after the `"```"`.

#### Tables

Tables must be formatted like so.

```txt
| header 1 | header 2 ... |
| -------- | ------------ |
| content  | goes         |
| here     | ...          |
```

The second row must start with a pipe `|`.  
All content has its leading and trailing whitespace trimmed so the rows above are parsed to the following.

```json
[
  ["content", "goes"],
  ["here", "..."]
]
```

### Frontend Rendered

These are supported if nested inside a paragraph. They will be rendered by the
frontend as they only involve simple single-line string manipulations.

- Links
- Bold Text, where asterisks are used `** bold text **`
- Inline Code Bacticks
- Quotes, where a line starts with `>`

### Unsupported - ❌

- Italic Text
- Strikethrough
- Horizontal Rules
- Images
- HTML
