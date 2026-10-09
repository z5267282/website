use clap::Parser;
use parser::strategy::content::paths::{OUTPUT_DIR, ROOT};
use parser::strategy::content::Content;
use parser::strategy::standalone::Standalone;
use parser::strategy::Strategy;
use std::error::Error;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();
    env_logger::init();

    let strategy: Box<dyn Strategy> = match (args.src, args.dst) {
        (Some(src), Some(dst)) => Box::new(Standalone::new(src, dst, args.pretty)),
        (None, None) => Box::new(Content::new(
            PathBuf::from(ROOT),
            PathBuf::from(OUTPUT_DIR),
            args.pretty,
        )),
        _ => unreachable!("clap enforces that src and dst are given together"),
    };
    strategy.run()?;
    strategy.print_success();

    Ok(())
}

/// Command line arguments for the blog parser.
///
/// With no paths, the whole `content` folder is parsed.
/// With both `SRC` and `DST`, a single markdown file is parsed instead.
#[derive(Parser, Debug)]
struct Args {
    /// Whether to pretty-print the JSON output.
    #[arg(short, long)]
    pretty: bool,

    /// Path to the source markdown file.
    #[arg(requires = "dst")]
    src: Option<PathBuf>,

    /// Path to write the JSON output to.
    #[arg(requires = "src")]
    dst: Option<PathBuf>,
}
