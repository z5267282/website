//! This module provides a parser for converting Markdown text into HTML elements.

use crate::parse::html_element::HTMLElement;

/// Represents the current parsing region.
enum Region {
    /// Flag indicating that no region is currently being parsed.
    NotSet,
    /// Represents a code block with an optional language.
    Code(String, Vec<String>),
    /// Represents an ordered list.
    OrderedList(Vec<String>),
    /// Represents an unordered list.
    UnorderedList(Vec<String>),
    /// Represents a HTML table.
    Table(Vec<String>, Vec<Vec<String>>, bool),
    /// Represents a paragraph block.
    Paragraph(Vec<String>),
}

/// Returns a list of HTML elements parsed from the provided Markdown text.
/// Parsed paragraph lines have their leading and trailing whitespace stripped.
///
/// # Arguments
/// * `text` - A vector of strings containing Markdown text.
///
/// # Examples
/// ```
/// # use parser::parse::to_html::parse_markdown;
/// # use parser::parse::html_element::HTMLElement;
///
/// let markdown = vec![
///     "# Header".to_string(),
///     "".to_string(),
///     "This is a paragraph.".to_string(),
/// ];
/// let elements = parse_markdown(&markdown);
/// assert_eq!(elements.len(), 2);
/// assert_eq!(elements[0], HTMLElement::Header { level: 1, content: "Header".to_string() });
/// assert_eq!(elements[1], HTMLElement::Paragraph { lines: vec!["This is a paragraph.".to_string()] });
/// ```
pub fn parse_markdown(text: &Vec<String>) -> Vec<HTMLElement> {
    let mut region = Region::NotSet;
    let mut elements: Vec<HTMLElement> = Vec::new();

    for line in text {
        // end the current region
        if line.is_empty() {
            region = handle_blank_line(line, region, &mut elements);
            continue;
        }

        region = match region {
            Region::NotSet => handle_entering_region(line, &mut elements),
            Region::Code(lang, lines) => handle_in_code_region(line, &mut elements, lang, lines),
            Region::OrderedList(list) => handle_in_ordered_list_region(line, &mut elements, list),
            Region::UnorderedList(list) => {
                handle_in_unordered_list_region(line, &mut elements, list)
            }
            Region::Paragraph(lines) => handle_in_paragraph_region(line, lines),
            Region::Table(headers, rows, is_separator) => {
                handle_in_table_region(line, &mut elements, headers, rows, is_separator)
            }
        };
    }
    handle_last_region(region, &mut elements);
    elements
}

/// Handle a blank line for the current region.
/// Return what the new region should be set as.
fn handle_blank_line(line: &String, region: Region, elements: &mut Vec<HTMLElement>) -> Region {
    match region {
        Region::NotSet => region,
        // code should keep blank lines
        Region::Code(lang, mut code) => {
            code.push(line.to_string());
            Region::Code(lang, code)
        }
        Region::OrderedList(list) => {
            elements.push(HTMLElement::OrderedList { list });
            Region::NotSet
        }
        Region::UnorderedList(list) => {
            elements.push(HTMLElement::UnorderedList { list });
            Region::NotSet
        }
        // table has its own syntax for detecting the end of a region
        Region::Table(headers, rows, _) => {
            elements.push(HTMLElement::Table { headers, rows });
            Region::NotSet
        }
        Region::Paragraph(lines) => {
            elements.push(HTMLElement::Paragraph { lines });
            Region::NotSet
        }
    }
}

/// Handle the entering of a new region.
/// Return what the new region should be.
fn handle_entering_region(line: &String, elements: &mut Vec<HTMLElement>) -> Region {
    // header
    if line.starts_with('#') {
        let content = line.trim_start_matches('#').trim_start().to_string();
        let level = line.find(|c| c != '#').unwrap_or(0);
        elements.push(HTMLElement::Header { level, content });
        Region::NotSet
    }
    // code
    else if line.starts_with("```") {
        let lang = line.trim_start_matches("```").trim().to_string();
        Region::Code(lang, Vec::new())
    }
    // ordered list
    else if line.starts_with(char::is_numeric) {
        match line.split_once('.') {
            // list item
            Some((_, rhs)) => Region::OrderedList(vec![rhs.trim_start().to_string()]),
            // normal text
            None => Region::Paragraph(vec![line.to_string()]),
        }
    }
    // unordered list
    else if line.starts_with("- ") {
        Region::UnorderedList(vec![line.trim_start_matches("- ").to_string()])
    }
    // table
    else if line.starts_with("|") {
        let mut headers = Vec::new();

        for cell in line.trim_matches('|').split('|') {
            headers.push(cell.trim().to_string());
        }

        Region::Table(headers, Vec::new(), true)
    }
    // paragraph
    else {
        Region::Paragraph(vec![line.trim().to_string()])
    }
}

fn handle_in_code_region(
    line: &String,
    elements: &mut Vec<HTMLElement>,
    lang: String,
    mut lines: Vec<String>,
) -> Region {
    if line.starts_with("```") {
        elements.push(HTMLElement::Code {
            language: lang,
            code: lines,
        });
        Region::NotSet
    } else {
        lines.push(line.to_string());
        Region::Code(lang, lines)
    }
}

fn handle_in_ordered_list_region(
    line: &String,
    elements: &mut Vec<HTMLElement>,
    mut list: Vec<String>,
) -> Region {
    if line.starts_with(char::is_numeric) {
        match line.split_once('.') {
            // list item
            Some((_, rhs)) => {
                list.push(rhs.trim_start().to_string());
                Region::OrderedList(list)
            }
            // end of list
            None => {
                elements.push(HTMLElement::OrderedList { list });
                Region::NotSet
            }
        }
    }
    // assume that there is a blank line to separate the end of the list
    else {
        elements.push(HTMLElement::OrderedList { list });
        Region::NotSet
    }
}

fn handle_in_unordered_list_region(
    line: &String,
    elements: &mut Vec<HTMLElement>,
    mut list: Vec<String>,
) -> Region {
    let no_leading_dash = line.trim_start_matches("- ");
    // end of list
    if no_leading_dash.len() == line.len() {
        elements.push(HTMLElement::UnorderedList { list });
        Region::NotSet
    } else {
        list.push(no_leading_dash.to_string());
        Region::UnorderedList(list)
    }
}

fn handle_in_table_region(
    line: &String,
    elements: &mut Vec<HTMLElement>,
    headers: Vec<String>,
    mut rows: Vec<Vec<String>>,
    is_separator: bool,
) -> Region {
    if is_separator {
        Region::Table(headers, rows, false)
    } else if line.starts_with("|") {
        let mut next_row = Vec::new();
        for cell in line.trim_matches('|').split('|') {
            next_row.push(cell.trim().to_string());
        }
        rows.push(next_row);
        Region::Table(headers, rows, false)
    } else {
        elements.push(HTMLElement::Table { headers, rows });
        Region::NotSet
    }
}

fn handle_in_paragraph_region(line: &String, mut lines: Vec<String>) -> Region {
    // remove trailing "  " for forced line breaks
    lines.push(line.trim().to_string());
    Region::Paragraph(lines)
}

fn handle_last_region(region: Region, elements: &mut Vec<HTMLElement>) -> () {
    match region {
        Region::NotSet => {}
        Region::Code(lang, code) => elements.push(HTMLElement::Code {
            language: lang,
            code,
        }),
        Region::OrderedList(list) => elements.push(HTMLElement::OrderedList { list }),
        Region::UnorderedList(list) => elements.push(HTMLElement::UnorderedList { list }),
        Region::Table(headers, rows, _) => elements.push(HTMLElement::Table { headers, rows }),
        Region::Paragraph(lines) => elements.push(HTMLElement::Paragraph { lines }),
    }
}

/// Unit tests for the Markdown parser.
/// These tests cover various Markdown elements such as headers, paragraphs, code blocks, lists,
/// and tables.
#[cfg(test)]
mod tests {
    use crate::parse::html_element::HTMLElement;
    use crate::parse::to_html::parse_markdown;

    /// Test for a simple paragraph of the py language.
    #[test]
    fn test_code() {
        let code = vec![
            "```py".to_string(),
            "print('hello mate')".to_string(),
            "print('cya')".to_string(),
            "```".to_string(),
        ];
        assert_eq!(
            parse_markdown(&code),
            vec![HTMLElement::Code {
                language: "py".to_string(),
                code: vec![
                    "print('hello mate')".to_string(),
                    "print('cya')".to_string()
                ]
            }]
        );
    }

    /// Test for a simple header and paragraph.
    #[test]
    fn test_header_and_text() {
        let text = vec![
            "# Overview".to_string(),
            "".to_string(),
            "This blog contains some information.  ".to_string(),
            "The information will be explained below.  ".to_string(),
            "".to_string(),
            "## Details".to_string(),
            "".to_string(),
            "There are seven countries in the G7.  ".to_string(),
            "Japan is a part of the G7.  ".to_string(),
            "".to_string(),
        ];
        let parsed = parse_markdown(&text);
        let exp = vec![
            HTMLElement::Header {
                level: 1,
                content: "Overview".to_string(),
            },
            HTMLElement::Paragraph {
                lines: vec![
                    "This blog contains some information.".to_string(),
                    "The information will be explained below.".to_string(),
                ],
            },
            HTMLElement::Header {
                level: 2,
                content: "Details".to_string(),
            },
            HTMLElement::Paragraph {
                lines: vec![
                    "There are seven countries in the G7.".to_string(),
                    "Japan is a part of the G7.".to_string(),
                ],
            },
        ];
        assert_eq!(parsed, exp);
    }

    /// Test for a simple table.
    #[test]
    fn test_table_unit() {
        let table = vec![
            "| Letter | Description           |".to_string(),
            "| ------ | --------------------- |".to_string(),
            "| c      | make new window       |".to_string(),
            "| &      | kill current window   |".to_string(),
            "| 1..9   | go to window 1..9     |".to_string(),
            "| ,      | rename window         |".to_string(),
            "| p      | go to previous window |".to_string(),
            "| n      | go to next window     |".to_string(),
        ];
        let exp_headers = vec!["Letter".to_string(), "Description".to_string()];
        let exp_rows = vec![
            vec!["c".to_string(), "make new window".to_string()],
            vec!["&".to_string(), "kill current window".to_string()],
            vec!["1..9".to_string(), "go to window 1..9".to_string()],
            vec![",".to_string(), "rename window".to_string()],
            vec!["p".to_string(), "go to previous window".to_string()],
            vec!["n".to_string(), "go to next window".to_string()],
        ];
        assert_eq!(
            parse_markdown(&table),
            vec![HTMLElement::Table {
                headers: exp_headers,
                rows: exp_rows
            }]
        );
    }

    #[test]
    fn test_header_paragraph_code() {
        let markdown = vec![
            "# Overview".to_string(),
            "".to_string(),
            "The `upper_bound` and `lower_bound` functions give iterators to the first element matching a condition.  ".to_string(),
            "It is possible to change the behaviour so that the last position is instead returned.".to_string(),
            "".to_string(),
            "Use reverse iterators in conjunction with the `greater<N>` comparator to do this.".to_string(),
            "".to_string(),
            "```cpp".to_string(),
            "#include <algorithm>".to_string(),
            "#include <cassert>".to_string(),
            "#include <utility>".to_string(),
            "#include <vector>".to_string(),
            "".to_string(),
            "auto main(void) -> int {".to_string(),
            "    /**".to_string(),
            "        what is the biggest index from [2, 6) st.".to_string(),
            "        boxes[i] <= 6".to_string(),
            "        it is 2, boxes[2] = 5".to_string(),
            "     */".to_string(),
            "    auto boxes = std::vector<int>{1 , 3 , 5 , 10, 14, 18};".to_string(),
            "    //                            0   1   2   3   4   5".to_string(),
            "    // reverse                 e                      b".to_string(),
            "    //                         -- ->                  <- ++".to_string(),
            "    //                            18, 14, 10, 5 , 3 , 1".to_string(),
            "    //                            0   1   2   3   4   5".to_string(),
            "    //                                        ^ should be this index".to_string(),
            "    auto j = std::lower_bound(boxes.rbegin(), boxes.rend() - 1 - 1, 6, std::greater<int>()) - boxes.rbegin();".to_string(),
            "    assert(j == 3);".to_string(),
            "}".to_string(),
            "```".to_string(),
            "".to_string()
        ];

        let header = HTMLElement::Header {
            level: 1,
            content: "Overview".to_string(),
        };
        let para1= HTMLElement::Paragraph { lines: vec![
            "The `upper_bound` and `lower_bound` functions give iterators to the first element matching a condition.".to_string(),
            "It is possible to change the behaviour so that the last position is instead returned.".to_string(),
        ] };
        let para2 = HTMLElement::Paragraph {
            lines: vec![
                "Use reverse iterators in conjunction with the `greater<N>` comparator to do this."
                    .to_string(),
            ],
        };
        let code = HTMLElement::Code { language: "cpp".to_string(), code: vec![
            "#include <algorithm>".to_string(),
            "#include <cassert>".to_string(),
            "#include <utility>".to_string(),
            "#include <vector>".to_string(),
            "".to_string(),
            "auto main(void) -> int {".to_string(),
            "    /**".to_string(),
            "        what is the biggest index from [2, 6) st.".to_string(),
            "        boxes[i] <= 6".to_string(),
            "        it is 2, boxes[2] = 5".to_string(),
            "     */".to_string(),
            "    auto boxes = std::vector<int>{1 , 3 , 5 , 10, 14, 18};".to_string(),
            "    //                            0   1   2   3   4   5".to_string(),
            "    // reverse                 e                      b".to_string(),
            "    //                         -- ->                  <- ++".to_string(),
            "    //                            18, 14, 10, 5 , 3 , 1".to_string(),
            "    //                            0   1   2   3   4   5".to_string(),
            "    //                                        ^ should be this index".to_string(),
            "    auto j = std::lower_bound(boxes.rbegin(), boxes.rend() - 1 - 1, 6, std::greater<int>()) - boxes.rbegin();".to_string(),
            "    assert(j == 3);".to_string(),
            "}".to_string(),
        ] };

        assert_eq!(parse_markdown(&markdown), vec![header, para1, para2, code]);
    }

    #[test]
    fn test_complex_composition() {
        let markdown = vec![
            "# Notes".to_string(),
            "".to_string(),
            "1. Enter `tmux` to start".to_string(),
            "2. Cannot enter `Command + k` to clear screen".to_string(),
            "3. Any command letter that is a shift-pressed key, must have shift pressed to work".to_string(),
            "".to_string(),
            "# Modifier".to_string(),
            "".to_string(),
            "Press the modifier key and then a command letter.  ".to_string(),
            "In Zac's `.tmux.conf` this was `Control + a`.".to_string(),
            "".to_string(),
            "- It is apparently the most ergonomic combination.".to_string(),
            "".to_string(),
            "By default it is `Control + b`.  ".to_string(),
            "You have to release the modifier and then press the command letter as per this [guide](https://superuser.com/questions/266725/tmux-ctrlb-not-working).  ".to_string(),
            "This is a list of [default command letters](https://man.openbsd.org/tmux#DEFAULT_KEY_BINDINGS).".to_string(),
            "".to_string(),
            "# Windows".to_string(),
            "".to_string(),
            "They are more like tabs in a browser.".to_string(),
            "".to_string(),
            "| Letter | Description           |".to_string(),
            "| ------ | --------------------- |".to_string(),
            "| c      | make new window       |".to_string(),
            "| &      | kill current window   |".to_string(),
            "| 1..9   | go to window 1..9     |".to_string(),
            "| ,      | rename window         |".to_string(),
            "| p      | go to previous window |".to_string(),
            "| n      | go to next window     |".to_string(),
            "| x      | close window          |".to_string(),
            "".to_string(),
            "# Pane".to_string(),
            "".to_string(),
            "A window can be split into panes.  ".to_string(),
            "Panes are closed by `Control + d` or the command letter `x`.  ".to_string(),
            "Can switch using arrow keys as the command letter or `o`.".to_string(),
            "".to_string(),
        ];

        assert_eq!(parse_markdown(&markdown), vec![
            HTMLElement::Header { level: 1, content: "Notes".to_string() },
            HTMLElement::OrderedList { list: vec![
                "Enter `tmux` to start".to_string(),
                "Cannot enter `Command + k` to clear screen".to_string(),
                "Any command letter that is a shift-pressed key, must have shift pressed to work".to_string(),
            ] },
            HTMLElement::Header { level: 1, content: "Modifier".to_string() },
            HTMLElement::Paragraph { lines: vec![
                "Press the modifier key and then a command letter.".to_string(),
                "In Zac's `.tmux.conf` this was `Control + a`.".to_string(),
            ] },
            HTMLElement::UnorderedList { list: vec!["It is apparently the most ergonomic combination.".to_string()] },
            HTMLElement::Paragraph { lines: vec![
                "By default it is `Control + b`.".to_string(),
                "You have to release the modifier and then press the command letter as per this [guide](https://superuser.com/questions/266725/tmux-ctrlb-not-working).".to_string(),
                "This is a list of [default command letters](https://man.openbsd.org/tmux#DEFAULT_KEY_BINDINGS).".to_string(),
            ] },
            HTMLElement::Header { level: 1, content: "Windows".to_string() },
            HTMLElement::Paragraph { lines: vec!["They are more like tabs in a browser.".to_string() ] },
            HTMLElement::Table { headers: vec!["Letter".to_string(), "Description".to_string()], rows: vec![
                vec!["c".to_string(), "make new window".to_string()],
                vec!["&".to_string(), "kill current window".to_string()],
                vec!["1..9".to_string(), "go to window 1..9".to_string()],
                vec![",".to_string(), "rename window".to_string()],
                vec!["p".to_string(), "go to previous window".to_string()],
                vec!["n".to_string(), "go to next window".to_string()],
                vec!["x".to_string(), "close window".to_string()],
            ] },
            HTMLElement::Header { level: 1, content: "Pane".to_string() },
            HTMLElement::Paragraph { lines: vec![
                "A window can be split into panes.".to_string(),
                "Panes are closed by `Control + d` or the command letter `x`.".to_string(),
                "Can switch using arrow keys as the command letter or `o`.".to_string(),
            ] }
        ]);
    }
}
