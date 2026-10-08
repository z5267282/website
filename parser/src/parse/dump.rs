use std::error::Error;

use log::info;

use serde::Serialize;
use serde_json::{to_string, to_string_pretty};
/// Dumps something serialisable into a JSON string.
///
/// # Arguments
/// * `object` - The object to be dumped.
/// * `pretty` - If true, the JSON output will be pretty-printed.
///
/// # Errors
/// If there was an error serializing the parsed data to a JSON string.
pub fn dump_to_str<T>(object: &T, pretty: bool) -> Result<String, Box<dyn Error>>
where
    T: Sized + Serialize,
{
    info!("preparing to dump markdown");
    let dumper = if pretty {
        to_string_pretty::<T>
    } else {
        to_string
    };

    let dumped = dumper(object).map_err(|e| {
        std::io::Error::other(format!(
            "Serde error occurred when serialising parsed data: {}",
            e
        ))
    })?;
    info!("markdown dumped");
    Ok(dumped)
}
