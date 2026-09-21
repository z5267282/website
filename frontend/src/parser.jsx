import HyperLink from "./components/HyperLink";

/**
 * Parse inline code features.
 */

/**
 * Take in one line and split it up into content strings and jsx as they appear.
 * The content should be wrapped in a parent like a <p> or a <div>.
 * The line can contained nested inline elements like links, code and bold text.
 * @param {String} lineContents Of the current line.
 * @param {String | null} elementKey The key from the parent for React-rendering management. Can be null for testing where the key doesn't matter.
 * @returns A list of JSX elements where some are strings. This can be directly injected into a parent element eg <p>{parseOneLine(contents)}</p>
 */
export default function parseOneLine(lineContents, elementKey = null) {
  const content = [];
  let currSubLine = lineContents;
  let index = 1;

  while (currSubLine.length > 0) {
    const first = findLeftMostFeature(
      currSubLine,
      elementKey === null ? null : `${elementKey}-inline_parsed_item-${index}`
    );
    if (first === null) {
      break;
    }

    const { jsx, start, end } = first;
    content.push(removeEscapedMarkdownBackslashes(currSubLine.slice(0, start)));
    content.push(jsx);
    currSubLine = currSubLine.slice(end);

    ++index;
  }
  // push on the last piece of text to parse
  content.push(removeEscapedMarkdownBackslashes(currSubLine));

  return content;
}

/**
 * Find the left most feature of a line.
 * @param {String} currSubLine The current line we are looking at.
 * @param {String | null} elementKey The key from the parent for React-rendering management. Can be null for testing where the key doesn't matter.
 * @returns null - if there was no feature on the line.
 * @returns Object with the [start, end) position in the original line of the match and jsx of the parsed element.
 */
function findLeftMostFeature(currSubLine, elementKey) {
  const parsedOptions = listParsers().map((parser) =>
    parser.tryParse(currSubLine, elementKey)
  );
  let earliest = null;
  for (const option of parsedOptions) {
    if (option === null) {
      continue;
    }

    if (earliest === null || option.start < earliest.start) {
      earliest = option;
    }
  }
  return earliest;
}

/**
 * An abstract class representing a parsing interface for inline items.
 * These are not styled in PascalCase to differentiate them from React Functional components.
 * Instead they are styled in snake_case.
 */
class parser {
  constructor(regex) {
    this.regex = regex;
  }

  /**
   * Try to parse for the class's feature at the start of the given line; return null if the line could not be parsed.
   * @param {String} line The current line to parse.
   * @param {String | null} elementKey The key from the parent for React-rendering management. Can be null for testing where the key doesn't matter.
   * @returns null if the feature could not be parsed on the line.
   * @returns Object with the [start, end) position in the original line of the match and jsx of the parsed element.
   */
  tryParse(line, elementKey) {
    line; // just to turn off linter yelling
    elementKey; // just to turn off linter yelling
    return null;
  }

  /**
   * Try to generate the element's key for React-rendering purposes.
   * @param {String} parentKey
   * @returns String with the element's type suffixed from the given parent key.
   * @returns null if the key was null.
   */
  genKey(parentKey) {
    parentKey; // just to turn off linter yelling
    return null;
  }
}

/**
 * Create a list of all supported Parser subclasses as a hoisted function so the classes can be written below.
 * @returns {parser[]}
 */
function listParsers() {
  return [new link(), new code(), new bold()];
}

class link extends parser {
  constructor() {
    super(/\[([^\]+]+)\]\(([^)]+)\)/);
  }

  /**
   * For a given line, try to find a link at the start.
   * A link looks like [desc](url).
   */
  tryParse(line, elementKey) {
    const attempt = line.match(this.regex);
    if (attempt === null) {
      return attempt;
    }

    const description = attempt[1];
    const url = attempt[2];

    return {
      jsx: (
        <HyperLink
          url={url}
          description={description}
          key={this.genKey(elementKey)}
        />
      ),
      start: attempt.index,
      end: attempt.index + attempt[0].length,
    };
  }

  genKey(parentKey) {
    return parentKey === null ? null : `${parentKey}-hyperlink`;
  }
}

class code extends parser {
  constructor() {
    super(/`([^`]+)`/);
  }

  /**
   * For a given line, try to find an inline code snippet at the start.
   * Inline code looks like `print()` this - two backtics with non-backtics inside.
   */
  tryParse(line, elementKey) {
    const attempt = line.match(this.regex);

    if (attempt === null) {
      return attempt;
    }

    const contents = attempt[1];

    return {
      jsx: (
        <code
          className="bg-[#eeeeee] rounded-sm p-1"
          key={this.genKey(elementKey)}
        >
          {contents}
        </code>
      ),
      start: attempt.index,
      end: attempt.index + attempt[0].length,
    };
  }

  genKey(parentKey) {
    return parentKey === null ? null : `${parentKey}-inline_code`;
  }
}

class bold extends parser {
  constructor() {
    // okay to use non-posix ?: since this is supported by most browsers as per mdm.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Non-capturing_group
    super(/\*{2}((?:[^*]|\\\*)+)\*{2}/);
  }

  /**
   * For a given line, try to find a piece of bold text.
   * The contents should replaced all escaped asterisks with just normal ones.
   * Bold text looks like **this** where an asterisk can be escaped by a \ i.e. \*.
   */
  tryParse(line, elementKey) {
    const attempt = line.match(this.regex);

    if (attempt === null) {
      return attempt;
    }

    const contents = attempt[1].replace("\\*", "*");
    return {
      jsx: <b key={this.genKey(elementKey)}>{contents}</b>,
      start: attempt.index,
      end: attempt.index + attempt[0].length,
    };
  }

  genKey(parentKey) {
    return parentKey === null ? null : `${parentKey}-bold_text`;
  }
}

/**
 * @param {string} text
 * @returns {string} with all backslashes for escaped characters removed
 */
function removeEscapedMarkdownBackslashes(text) {
  return (
    text
      // link descriptions
      .replaceAll("\\[", "[")
      .replaceAll("\\]", "]")
      // link url
      .replaceAll("\\(", "(")
      .replaceAll("\\)", ")")
      // bold
      .replace("\\*", "*")
      // inline code
      .replace("\\`", "`")
  );
}
