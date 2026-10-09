import { Head } from "vite-react-ssg";

import parseOneLine, { parseParagraphLine } from "../parser";
import Page from "./Page";
import Header1 from "./Header1";
import Header2 from "./Header2";
import Header3 from "./Header3";

/**
 * Render a piece of parsed Markdown along with its page metadata.
 * @prop: metadata: Object - the markdown's metadata; title is used for the page title and header, description for the meta description and header, date for the header.
 * @prop: html: Object[] - the structured JSON HTML data which follows the parser JSON schema.
 * @prop: elementKey: string - the base of every element's key for React-rendering management.
 */
export default function ParsedMarkdown({ metadata, html, elementKey }) {
  const { title, description, date } = metadata;
  return (
    <>
      <Head>
        <title>{`sunny | ${title}`}</title>
        <meta name="description" content={description} />
      </Head>
      <Page title={title} description={description} date={date}>
        <article className="w-full grid grid-cols-1 gap-y-[15px]">
          {html.map((htmlData, index) =>
            genHTML(htmlData, genElementKey(elementKey, index)),
          )}
        </article>
      </Page>
    </>
  );
}

/**
 * Generate the base part of an element's key for React-rendering management.
 * @param {String} baseKey The base key of the current markdown e.g. its url-safe slug.
 * @param {Number} index The position of the element within the markdown.
 * @returns A String of the current element's key for for managing React rendering formatted as: "baseKey-index". This will form the base of the key to any children the element may have e.g. a child will have key "baseKey-index-subIndex-...".
 */
const genElementKey = (baseKey, index) => {
  return `${baseKey}-${index}`;
};

/**
 * Create a header component for the lower header levels, which all share the same styling.
 * @param {Number} level The header level, from 4 to 6.
 * @returns A component rendering an <h{level}> with the given content.
 */
const makeLowerHeader = (level) => {
  const Tag = `h${level}`;
  const LowerHeader = ({ content }) => (
    <Tag className="text-[1em]">{content}</Tag>
  );
  LowerHeader.displayName = `Header${level}`;
  return LowerHeader;
};

const [Header4, Header5, Header6] = [4, 5, 6].map(makeLowerHeader);

const HEADERS_BY_LEVEL = {
  1: Header1,
  2: Header2,
  3: Header3,
  4: Header4,
  5: Header5,
  6: Header6,
};

function Header({ level, content }) {
  const HeaderLevel = HEADERS_BY_LEVEL[level] ?? Header6;
  return <HeaderLevel content={content} />;
}

function Code({ code }) {
  return (
    <pre className="border-[1.25px] border-black p-[10px] overflow-x-auto">
      <code className="block">{code.join("\n")}</code>
    </pre>
  );
}

function OrderedList({ list, elementKey }) {
  return (
    <ol>
      {list.map((li, index) => (
        <li
          className="list-inside list-decimal"
          key={`${elementKey}-item-${index}`}
        >
          {parseOneLine(li, elementKey)}
        </li>
      ))}
    </ol>
  );
}

function UnorderedList({ list, elementKey }) {
  return (
    <ul>
      {list.map((li, index) => (
        <li
          className="list-inside list-disc"
          key={`${elementKey}-item-${index}`}
        >
          {parseOneLine(li, elementKey)}
        </li>
      ))}
    </ul>
  );
}

function Table({ headers, rows, elementKey }) {
  return (
    <div className="h-full w-full flex justify-center items-center md:justify-start p-2 overflow-x-auto">
      <table className="border-[2px] border-black">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                className="bg-(--nav-colour) p-1"
                scope="col"
                key={`${elementKey}-header-${index}`}
              >
                {parseOneLine(header, elementKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => {
            const rowKey = `${elementKey}-row-${r}`;
            return (
              <tr key={rowKey}>
                {row.map((col, c) => {
                  const colKey = `${rowKey}-col-${c}`;
                  return (
                    <td className="p-1" key={colKey}>
                      {parseOneLine(col, colKey)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Paragraph({ lines, elementKey }) {
  return (
    <div>
      {lines.map((line, index) =>
        parseParagraphLine(line, `${elementKey}-line-${index}`),
      )}
    </div>
  );
}

/**
 * The component to render for each HTML type in the parser JSON schema.
 */
const COMPONENTS_BY_TYPE = {
  Header,
  Code,
  OrderedList,
  UnorderedList,
  Table,
  Paragraph,
};

/**
 * Create the JSX Element from given HTML data as JSON.
 * @param {Object} htmlData The structured JSON HTML data which follows the parser JSON schema.
 * @param {String} elementKey The key from the parent for React-rendering management.
 * @returns The JSX element constructed from the formatted HTML data, or null if the type is unsupported.
 */
const genHTML = (htmlData, elementKey) => {
  const { type, ...props } = htmlData;
  const Component = COMPONENTS_BY_TYPE[type];
  if (!Component) {
    console.log(`ERROR: unsupported HTML type ${type}`);
    return null;
  }
  const subKey = `${elementKey}-${type}`;
  return <Component key={subKey} elementKey={subKey} {...props} />;
};
