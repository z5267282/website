//! Parses every Markdown file under a content root of the form
//! ```txt
//! root/
//!     blog/
//!     lore/
//!         lang/
//! ```

use log::info;
use std::error::Error;
use std::fs::{read_dir, read_to_string, File};
use std::io::Write;
use std::path::{Path, PathBuf};

use serde_saphyr::from_str;

use super::Strategy;

use crate::parse::dump::dump_to_str;
use crate::parse::error::MetadataError;
use crate::parse::html_element::HTMLElement;
use crate::parse::metadata::Metadata;
use crate::parse::to_html::parse_markdown;

/// Paths for dump files where `parser/`` is considered as current folder
pub mod paths {
    /// content stored in Markdown format.
    pub const MARKDOWN: &str = "../content/lore";

    /// JSON dump of parsed blogs.
    pub const JSON: &str = "../frontend/src/blog-lang.json";
}

/// Line that opens and closes the YAML metadata block at the top of a blog.
const METADATA_DELIMITER: &str = "---";

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
    /// Dumps all blogs from storage into a JSON file. Blogs are stored as Markdown files.
    ///
    /// # Arguments
    /// * `pretty` - If true, the JSON output will be pretty-printed.
    ///
    /// # Errors
    /// If there was an error reading blog files or writing blogs to JSON.
    ///
    /// # Examples
    /// ```
    /// use std::fs::{create_dir, File};
    /// use std::io::{Read, Write};
    /// use std::path::PathBuf;
    /// use tempfile::{tempdir, NamedTempFile, TempDir};
    ///
    /// use parser::strategy::Strategy;
    /// use parser::strategy::content::Content;
    ///
    /// /// Create a temporary folder as the root of blogs for testing.
    /// /// The structure will be
    /// /// ```txt
    /// /// root/
    /// ///     blogs/
    /// ///         + example-blog.md
    /// /// ```
    /// fn setup_testing_blogs(contents: &str) -> TempDir {
    ///     let root = tempdir().expect("could not create temporary directory");
    ///     let blogs_path = root.path().join("blogs");
    ///     create_dir(&blogs_path).expect("could not create blogs subfolder");
    ///
    ///     let blog_path = blogs_path.join("example-blog.md");
    ///     let mut blog = File::create(blog_path).expect("could not create temporary blog file");
    ///
    ///     blog.write(contents.as_bytes()).expect("could not write blog contents");
    ///     root
    /// }
    ///
    /// fn create_json_dump_file() -> NamedTempFile {
    ///     NamedTempFile::with_suffix(".json").expect("could not create temporary blog file")
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
    /// let blogs = setup_testing_blogs(contents);
    /// let mut dump_file = create_json_dump_file();
    ///
    /// let worker = Content::new(PathBuf::from(blogs.path()),PathBuf::from(dump_file.path()), false);
    ///
    /// worker.run().expect("failed to dump blogs");
    /// let mut dump_contents = String::new();
    /// &mut dump_file
    ///     .read_to_string(&mut dump_contents)
    ///     .expect("could not read dumped file");
    ///
    /// assert!(&dump_contents.contains("This is a sample Markdown file."));
    /// assert!(&dump_contents.contains("No further content."));
    /// ```
    fn run(&self) -> Result<(), Box<dyn Error>> {
        info!("commencing dump of {} to json", self.root.display());
        info!("iterating through all languages in {}", self.root.display());

        let mut parsed: Vec<LanguageDump> = vec![];
        for try_lang in read_dir(&self.root)? {
            let lang = try_lang?.path();
            if !lang.is_dir() {
                continue;
            }

            let mut language = LanguageDump {
                language: get_lang_name(&lang)?,
                blogs: Vec::new(),
            };

            for entry in read_dir(&lang)? {
                let blog = entry?.path();
                let html = parse_blog(&blog)?;
                let title = prepare_title(&blog)?;
                language.blogs.push(Blog { title, html });
            }

            parsed.push(language);
        }

        let mut file = File::create(&self.output)?;
        let dump = dump_to_str(&parsed, self.pretty)?;
        file.write_all(dump.as_bytes())?;
        info!("dumped file {}", self.output.display());
        Ok(())
    }

    fn print_success(&self) -> () {
        println!("parsed all files from content-structured folder");
    }
}

/// A structured representation of the parsed blogs, grouped by language.
#[derive(serde::Serialize)]
struct LanguageDump {
    /// Language used, e.g. Rust, Python, etc.
    language: String,
    /// Blogs written in this language.
    blogs: Vec<Blog>,
}

/// A structured representation of a blog, containing its title and parsed HTML elements.
#[derive(serde::Serialize)]
struct Blog {
    /// Title of the blog, derived from the filename.
    title: String,
    /// Parsed HTML elements from the blog's Markdown content.
    html: Vec<HTMLElement>,
}

/// Parses a blog from Markdown into HTML representation.
///
/// # Arguments
/// * `path` - The path to the blog file.
///
/// # Errors
/// If there was an error reading the file from path.
///
/// # Examples
fn parse_blog(path: &PathBuf) -> Result<Vec<HTMLElement>, Box<dyn Error>> {
    info!("loading metadata and markdown from {}", path.display());
    let (metadata, markdown) = parse_metadata_and_content(path)?;

    info!("metadata and markdown loaded, preparing to parse");
    let json = parse_markdown(&markdown);
    info!("parsed json successfully from {}", path.display());
    Ok(json)
}

/// Splits a blog file into its YAML metadata and its Markdown content.
/// The metadata is enclosed between a `---` on the first line and the next `---` line.
///
/// # Arguments
/// * `path` - The path to the blog file.
///
/// # Errors
/// If the file could not be read, or a `MetadataError` if the metadata is missing or invalid.
fn parse_metadata_and_content(path: &PathBuf) -> Result<(Metadata, Vec<String>), Box<dyn Error>> {
    // this has metadata and then content
    let all_lines = read_to_string(path)?
        .lines()
        .map(|s| s.to_string())
        .collect::<Vec<String>>();

    let metadata_error = || MetadataError::new(path.clone());

    if all_lines.first().map(|line| line.trim()) != Some(METADATA_DELIMITER) {
        return Err(Box::new(metadata_error()));
    }

    let end = all_lines
        .iter()
        .skip(1)
        .position(|line| line.trim() == METADATA_DELIMITER)
        .map(|i| i + 1)
        .ok_or_else(metadata_error)?;

    let yaml = all_lines[1..end].join("\n");
    let metadata: Metadata = from_str(&yaml).map_err(|_| metadata_error())?;
    let content = all_lines[end + 1..].to_vec();

    info!("parsed metadata from {} as {metadata:?}", path.display());
    Ok((metadata, content))
}

/// Extracts the basename from a path and returns it as a `String`.
///
/// # Arguments
/// * `path` - The path from which to extract the basename.
///
/// # Errors
/// If the basename could not be extracted from the path.
fn basename(path: &Path) -> Result<String, std::io::Error> {
    info!("trying to extract basename for {}", path.display());
    let basename = path
        .file_name()
        .ok_or(gen_cannot_extract_basename(path))?
        .to_str()
        .ok_or(gen_cannot_extract_basename(path))?
        .to_string();
    info!("extracted basename {}", basename.as_str());
    Ok(basename)
}

/// Gets the language name from the path by extracting the basename.
///
/// # Arguments
/// * `lang` - The path to the language directory.
///
/// # Errors
/// If the basename could not be extracted from the path.
fn get_lang_name(lang: &Path) -> Result<String, std::io::Error> {
    basename(lang)
}

/// Helper function to generate an error when the basename cannot be extracted.
///
/// # Arguments
/// * `path` - The path from which the basename could not be extracted.
///
/// # Examples
fn gen_cannot_extract_basename(path: &Path) -> std::io::Error {
    std::io::Error::other(format!(
        "basename could not be extracted from absolute path {}",
        path.display()
    ))
}

/// Prepares the title for a blog by extracting the basename and formatting it.
///
/// # Arguments
/// * `blog` - The path to the blog file.
///
/// # Errors
/// If there was an error extracting the basename or formatting the title.
fn prepare_title(blog: &Path) -> Result<String, std::io::Error> {
    info!("preparing blog title for {}", blog.display());
    let base = basename(blog)?;
    let title = base.replace('-', " ").trim_end_matches(".md").to_string();
    info!("prepared title {}", title.as_str());
    Ok(title)
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::*;

    #[test]
    fn test_doctest() {}

    #[test]
    fn test_basename_good() {
        let mut path = PathBuf::new();
        path.push("root");
        path.push("parent");
        path.push("child.md");
        match basename(&path) {
            Err(_) => assert!(false),
            Ok(base) => assert_eq!(base, "child.md"),
        };
    }

    #[test]
    fn test_lang_name_good() {
        let mut path = PathBuf::new();
        path.push("root");
        path.push("parent");
        match get_lang_name(&path) {
            Err(_) => assert!(false),
            Ok(lang) => assert_eq!(lang, "parent"),
        };
    }

    // TODO: fix this so that it's a doctest in dump - also need a type that is serialisable
    // #[test]
    // fn test_dump_to_str_not_pretty() {
    //     let parsed = vec![LanguageDump {
    //         language: "cpp".to_string(),
    //         blogs: vec![Blog {
    //             title: "My Blog Post".to_string(),
    //             html: vec![HTMLElement::Paragraph {
    //                 lines: vec!["This is the content of my blog post.".to_string()],
    //             }],
    //         }],
    //     }];
    //     let json = dump_to_str(&parsed, false).expect("Failed to dump to JSON");
    //     assert!(json.contains("My Blog Post"));
    //     assert!(json.contains("This is the content of my blog post."));
    // }

    #[test]
    fn test_cannot_extract_basename() {
        let path = PathBuf::from("my-blog-post.md");
        let error = gen_cannot_extract_basename(&path);
        assert!(error
            .to_string()
            .contains("basename could not be extracted from absolute path my-blog-post.md"));
    }

    #[test]
    fn test_prepare_title() {
        let blog = PathBuf::from("my-blog-post.md");
        let title = prepare_title(&blog).expect("Failed to prepare title");
        assert_eq!(title, "my blog post");
    }
}
