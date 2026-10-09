//! Parses a content root of the form
//! ```txt
//! root/
//!     blog/
//!         + interesting-topic.md
//!     lore/
//!         :lang/
//!             + langauge-semantic topic.md
//!         + lore.yaml
//! ```
//! into an output folder with the same structure, where every Markdown file becomes a JSON file
//! and `lore/lore.yaml` becomes `lore/lore.json`.

use log::{info, warn};
use std::collections::BTreeMap;
use std::error::Error;
use std::fs::{create_dir_all, read_dir, read_to_string, write};
use std::path::{Path, PathBuf};

use serde::Serialize;
use serde_saphyr::from_str;

use super::Strategy;

use crate::parse::blog::parse_blog;
use crate::parse::dump::dump_to_str;

/// Paths for dump files where `parser/`` is considered as current folder
pub mod paths {
    /// Root of the content folder, stored in Markdown format.
    pub const ROOT: &str = "../content";

    /// Folder that mirrors the content folder, holding the parsed JSON files.
    pub const OUTPUT_DIR: &str = "../frontend/src/content";
}

/// Path of the file holding a one-line qwip for each lore language, relative to the content root.
const LORE_FILE: &str = "lore/lore.yaml";

/// Extension of the Markdown files to parse.
const MARKDOWN_EXTENSION: &str = "md";

/// Extension given to every dumped file.
const JSON_EXTENSION: &str = "json";

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

    /// Recursively dumps every file under a folder, mirroring it into the output folder.
    ///
    /// # Arguments
    /// * `dir` - A folder inside the content root.
    ///
    /// # Errors
    /// If there was an error reading, parsing or dumping any file under the folder.
    fn dump_dir(&self, dir: &Path) -> Result<(), Box<dyn Error>> {
        let out_dir = self.output_path(dir)?;
        info!("creating output folder {}", out_dir.display());
        create_dir_all(&out_dir)?;

        for entry in read_dir(dir)? {
            let path = entry?.path();
            if path.is_dir() {
                self.dump_dir(&path)?;
            } else if path == self.root.join(LORE_FILE) {
                self.dump_file(&path, &parse_lore(&path)?)?;
            } else if path
                .extension()
                .is_some_and(|ext| ext == MARKDOWN_EXTENSION)
            {
                self.dump_file(&path, &parse_blog(&path)?)?;
            } else {
                warn!("skipping unrecognised file {}", path.display());
            }
        }
        Ok(())
    }

    /// Writes a parsed object to the JSON file mirroring its source file.
    ///
    /// # Arguments
    /// * `src` - The path of the source file inside the content root.
    /// * `object` - The parsed contents of the source file.
    ///
    /// # Errors
    /// If there was an error serialising the object or writing the file.
    fn dump_file<T: Serialize>(&self, src: &Path, object: &T) -> Result<(), Box<dyn Error>> {
        let dst = self.output_path(src)?.with_extension(JSON_EXTENSION);
        write(&dst, dump_to_str(object, self.pretty)?)?;
        info!("dumped {} to {}", src.display(), dst.display());
        Ok(())
    }

    /// Maps a path inside the content root to the same relative path inside the output folder.
    ///
    /// # Arguments
    /// * `src` - The path inside the content root.
    ///
    /// # Errors
    /// If the path is not inside the content root.
    fn output_path(&self, src: &Path) -> Result<PathBuf, Box<dyn Error>> {
        Ok(self.output.join(src.strip_prefix(&self.root)?))
    }
}

impl Strategy for Content {
    /// Parses every file in the content folder into a JSON file at the same relative path in the
    /// output folder. Markdown blogs are parsed into their metadata and HTML, and the lore file is
    /// parsed into an object mapping each language to its qwip.
    ///
    /// # Errors
    /// If there was an error reading content files or writing them to JSON.
    ///
    /// # Examples
    /// ```
    /// use std::fs::{create_dir_all, read_to_string, write};
    /// use std::path::PathBuf;
    /// use tempfile::{tempdir, TempDir};
    ///
    /// # use parser::strategy::Strategy;
    /// # use parser::strategy::content::Content;
    ///
    /// /// Create a temporary folder as the content root for testing.
    /// /// The structure will be
    /// /// ```txt
    /// /// root/
    /// ///     blog/
    /// ///         + example-blog.md
    /// ///     lore/
    /// ///         shell/
    /// ///             + example-lore.md
    /// ///         + lore.yaml
    /// /// ```
    /// fn setup_testing_content(contents: &str) -> TempDir {
    ///     let root = tempdir().expect("could not create temporary directory");
    ///     let blog = root.path().join("blog");
    ///     let shell = root.path().join("lore").join("shell");
    ///     create_dir_all(&blog).expect("could not create blog subfolder");
    ///     create_dir_all(&shell).expect("could not create lore subfolder");
    ///
    ///     write(blog.join("example-blog.md"), contents).expect("could not write blog");
    ///     write(shell.join("example-lore.md"), contents).expect("could not write lore");
    ///     write(root.path().join("lore").join("lore.yaml"), "shell: POSIX is a lie :)\n")
    ///         .expect("could not write lore file");
    ///     root
    /// }
    ///
    /// let contents = r#"---
    /// title: Sample Markdown
    /// date: 2026-01-01
    /// description: A sample Markdown file to present for the content strategy doctest
    /// ---
    ///
    /// This is a sample Markdown file.
    /// No further content.
    ///
    /// "#;
    ///
    /// let content = setup_testing_content(contents);
    /// let output = tempdir().expect("could not create output directory");
    ///
    /// let worker = Content::new(PathBuf::from(content.path()), PathBuf::from(output.path()), false);
    /// worker.run().expect("failed to dump content");
    ///
    /// for blog in ["blog/example-blog.json", "lore/shell/example-lore.json"] {
    ///     let dumped = read_to_string(output.path().join(blog)).expect("could not read dumped blog");
    ///     assert!(dumped.contains("Sample Markdown"));
    ///     assert!(dumped.contains("This is a sample Markdown file."));
    ///     assert!(dumped.contains("No further content."));
    /// }
    ///
    /// let lore = read_to_string(output.path().join("lore/lore.json")).expect("could not read lore");
    /// assert_eq!(lore, r#"{"shell":"POSIX is a lie :)"}"#);
    /// ```
    fn run(&self) -> Result<(), Box<dyn Error>> {
        info!(
            "commencing dump of {} into {}",
            self.root.display(),
            self.output.display()
        );
        self.dump_dir(&self.root)
    }

    fn print_success(&self) -> () {
        println!("parsed all files from content-structured folder");
    }
}

/// Parses the lore file, where each line maps a language to a one-line qwip.
///
/// # Arguments
/// * `path` - The path to the lore file.
///
/// # Errors
/// If the file could not be read or is not a mapping of languages to qwips.
fn parse_lore(path: &Path) -> Result<BTreeMap<String, String>, Box<dyn Error>> {
    info!("loading lore qwips from {}", path.display());
    let qwips: BTreeMap<String, String> = from_str(&read_to_string(path)?)?;
    info!("parsed {} lore qwips", qwips.len());
    Ok(qwips)
}
