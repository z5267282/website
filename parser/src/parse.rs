//! This crate parses Markdown text into structured JSON that can be readily converted to HTML DOM elements in the front-end.
//! This crate is both a library and a binary.
//! The binary parses blogs written in ../blog.
//! To library can be used via the `parse.to_html.parse_markdown` function.

pub mod error;

pub mod html_element;

pub mod metadata;

pub mod paths;

pub mod to_html;
