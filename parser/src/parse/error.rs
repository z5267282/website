use std::error::Error;
use std::fmt::Display;
use std::path::PathBuf;

/// An error raised when a blog's metadata is missing or could not be parsed.
#[derive(Debug)]
pub struct MetadataError {
    /// Path of the file whose metadata could not be parsed.
    path: PathBuf,
}

impl MetadataError {
    /// Creates a new `MetadataError` for the given file.
    ///
    /// # Arguments
    /// * `path` - The path of the file with missing or invalid metadata.
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }
}

impl Display for MetadataError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "metadata missing in file {}", self.path.display())
    }
}

impl Error for MetadataError {}
