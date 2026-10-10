//! A strategy is a defined way of parsing some Markdown files.
//! Each strategy owns everything it needs (input paths, output paths, formatting options),
//! which is supplied when it is constructed. Running it performs the whole parse-and-dump.

use std::error::Error;

pub mod content;

pub mod standalone;

/// A self-contained procedure for parsing Markdown and writing the result as JSON.
pub trait Strategy {
    /// Executes the strategy.
    fn run(&self) -> Result<(), Box<dyn Error>>;

    fn print_success(&self) -> ();
}
