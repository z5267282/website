//! Parses a single Markdown file into a single JSON file.

use std::{error::Error, path::PathBuf};

use super::Strategy;

/// Parses one Markdown src file and writes the result to a dst JSON path.
pub struct Standalone {
    /// Markdown file to parse.
    src: PathBuf,
    /// JSON file to write.
    dst: PathBuf,
    /// Whether to pretty-print the JSON output.
    pretty: bool,
}

impl Standalone {
    pub fn new(src: PathBuf, dst: PathBuf, pretty: bool) -> Self {
        Self { src, dst, pretty }
    }
}

impl Strategy for Standalone {
    fn run(&self) -> Result<(), Box<dyn Error>> {
        todo!()
    }

    fn print_success(&self) -> () {
        println!(
            "successfully parsed standalone file {} to {}",
            self.src.display(),
            self.dst.display()
        );
    }
}
