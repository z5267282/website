//! Parses a single Markdown file into a single JSON file.

use log::info;
use std::fs::write;
use std::{error::Error, path::PathBuf};

use super::Strategy;

use crate::parse::blog::parse_blog;
use crate::parse::dump::dump_to_str;

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
    /// Parses the source Markdown blog into its metadata and HTML, and writes it as JSON to the
    /// destination file.
    ///
    /// # Errors
    /// If there was an error reading or parsing the source file, or writing the destination file.
    ///
    /// # Examples
    /// ```
    /// use std::fs::{read_to_string, write};
    /// use tempfile::tempdir;
    ///
    /// # use parser::strategy::Strategy;
    /// # use parser::strategy::standalone::Standalone;
    ///
    /// let contents = r#"---
    /// title: Sample Markdown
    /// date: 2026-01-01
    /// description: A sample Markdown file to present for the standalone strategy doctest
    /// ---
    ///
    /// This is a sample Markdown file.
    /// No further content.
    ///
    /// "#;
    ///
    /// let dir = tempdir().expect("could not create temporary directory");
    /// let src = dir.path().join("example-blog.md");
    /// let dst = dir.path().join("example-blog.json");
    /// write(&src, contents).expect("could not write blog");
    ///
    /// let worker = Standalone::new(src, dst.clone(), false);
    /// worker.run().expect("failed to dump standalone file");
    ///
    /// let dumped = read_to_string(&dst).expect("could not read dumped blog");
    /// assert!(dumped.contains("Sample Markdown"));
    /// assert!(dumped.contains("This is a sample Markdown file."));
    /// assert!(dumped.contains("No further content."));
    /// ```
    fn run(&self) -> Result<(), Box<dyn Error>> {
        info!(
            "commencing dump of {} into {}",
            self.src.display(),
            self.dst.display()
        );
        let blog = parse_blog(&self.src)?;
        write(&self.dst, dump_to_str(&blog, self.pretty)?)?;
        info!("dumped {} to {}", self.src.display(), self.dst.display());
        Ok(())
    }

    fn print_success(&self) -> () {
        println!(
            "successfully parsed standalone file {} to {}",
            self.src.display(),
            self.dst.display()
        );
    }
}
