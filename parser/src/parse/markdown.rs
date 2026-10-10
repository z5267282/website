//! Parses a Markdown file, with a YAML metadata block at the top, into its metadata and
//! HTML representation.

use log::info;
use std::error::Error;
use std::fs::read_to_string;
use std::path::Path;

use serde::Serialize;
use serde_saphyr::from_str;

use super::error::MetadataError;
use super::html_element::HTMLElement;
use super::metadata::Metadata;
use super::to_html::parse_markdown;

/// Line that opens and closes the YAML metadata block at the top of a Markdown file.
const METADATA_DELIMITER: &str = "---";

/// A structured representation of a Markdown file, containing its metadata and parsed HTML elements.
#[derive(Serialize)]
pub struct Markdown {
    /// Metadata from the YAML block at the top of the Markdown file.
    metadata: Metadata,
    /// Parsed HTML elements from the file's Markdown content.
    html: Vec<HTMLElement>,
}

/// Parses a Markdown file into its metadata and HTML representation.
///
/// # Arguments
/// * `path` - The path to the Markdown file.
///
/// # Errors
/// If there was an error reading the file from path, or a `MetadataError` if the metadata is
/// missing or invalid.
pub fn parse_markdown_file(path: &Path) -> Result<Markdown, Box<dyn Error>> {
    info!("loading metadata and markdown from {}", path.display());
    let (metadata, markdown) = parse_metadata_and_content(path)?;

    info!("metadata and markdown loaded, preparing to parse");
    let html = parse_markdown(&markdown);
    info!("parsed json successfully from {}", path.display());
    Ok(Markdown { metadata, html })
}

/// Splits a Markdown file into its YAML metadata and its Markdown content.
/// The metadata is enclosed between a `---` on the first line and the next `---` line.
///
/// # Arguments
/// * `path` - The path to the Markdown file.
///
/// # Errors
/// If the file could not be read, or a `MetadataError` if the metadata is missing or invalid.
fn parse_metadata_and_content(path: &Path) -> Result<(Metadata, Vec<String>), Box<dyn Error>> {
    // this has metadata and then content
    let all_lines = read_to_string(path)?
        .lines()
        .map(|s| s.to_string())
        .collect::<Vec<String>>();

    let metadata_error = || MetadataError::new(path.to_path_buf());

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
