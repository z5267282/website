use clap::{ArgAction, Parser};
use parser::strategy::content::paths::{JSON, MARKDOWN};
use parser::strategy::content::Content;
use parser::strategy::standalone::Standalone;
use parser::strategy::Strategy;
use std::error::Error;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();
    env_logger::init();

    let standalone = Standalone::new(PathBuf::from("TODO"), PathBuf::from("TODO"), args.pretty);
    let content = Content::new(PathBuf::from(MARKDOWN), PathBuf::from(JSON), args.pretty);

    let strategy: &dyn Strategy = if args.one { &standalone } else { &content };
    strategy.run()?;
    strategy.print_success();

    Ok(())
}

/// Command line arguments for the blog parser.
#[derive(Parser, Debug)]
struct Args {
    /// Whether to pretty-print the JSON output.
    #[arg(short, long, action = ArgAction::SetTrue)]
    pretty: bool,

    /// Parse a single markdown file instead of the whole `content` folder.
    #[arg(long, action = ArgAction::SetTrue, requires_all = ["src", "dst"])]
    one: bool,

    /// Path to the source markdown file (requires --one).
    #[arg(requires = "one")]
    src: Option<PathBuf>,

    /// Path to write the JSON output to (requires --one).
    #[arg(requires = "one")]
    dst: Option<PathBuf>,
}
