//! Parses the structured content folder, which contains exactly two subfolders: `blog` and `lore`.

use std::path::{Path, PathBuf};

use super::Strategy;
use crate::parse::dump_file::dump_blogs;
use crate::parse::paths::{JSON, MARKDOWN};

/// Parses every Markdown file under a content root of the form
/// ```txt
/// root/
///     blog/
///     lore/
///         lang/
/// ```
pub struct Content {
    /// Root of the content folder.
    root: PathBuf,
    /// Folder that parsed JSON files are written into.
    output: PathBuf,
    /// Whether to pretty-print the JSON output.
    pretty: bool,
}

impl Content {
    pub fn new(root: PathBuf, output: PathBuf, pretty: bool) -> Self {
        Self {
            root,
            output,
            pretty,
        }
    }
}

impl Strategy for Content {
    fn run(&self) -> Result<(), std::io::Error> {
        let markdown = Path::new(MARKDOWN);
        let json = Path::new(JSON);
        dump_blogs(markdown, json, self.pretty)
    }

    fn print_success(&self) -> () {
        println!("parsed all files from content-structured folder");
    }
}
