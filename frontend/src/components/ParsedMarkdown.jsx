import { Head } from "vite-react-ssg";

import parseOneLine from "../parser";

/**
 * Render a piece of parsed Markdown along with its page metadata.
 * @prop: metadata: Object - the markdown's metadata; title is used for the page title and header, description for the meta description.
 * @prop: html: Object[] - the structured JSON HTML data which follows the parser JSON schema.
 * @prop: elementKey: string - the base of every element's key for React-rendering management.
 */
export default function ParsedMarkdown({ metadata, html, elementKey }) {
  const { title, description } = metadata;
  return (
    <>
      <Head>
        <title>{`sunny | ${title}`}</title>
        <meta name="description" content={description} />
      </Head>
      <header className="text-[1.5em] flex justify-center items-center">
        {title}
      </header>
      <article className="w-full">
        {html.map((htmlData, index) =>
          genHTML(htmlData, genElementKey(elementKey, index)),
        )}
      </article>
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
 * Create all the JSX Element from given HTML data as JSON.
 * @param {Object} htmlData The structured JSON HTML data which follows the parser JSON schema.
 * @param {String} elementKey The key from the parent for React-rendering management.
 * @returns The JSX element constructed from the formatted HTML data.
 */
const genHTML = (htmlData, elementKey) => {
  switch (htmlData.type) {
    case "Header": {
      const { level, content } = htmlData;
      switch (level) {
        case 1:
          return (
            <h1 className="text-[1.5em] my-[0.25em]" key={`${elementKey}-h1`}>
              {content}
            </h1>
          );
        case 2:
          return (
            <h2 className="text-[1.25em] my-[0.2em]" key={`${elementKey}-h2`}>
              {content}
            </h2>
          );
        case 3:
          return (
            <h3 className="text-[1.1em]" key={`${elementKey}-h3`}>
              {content}
            </h3>
          );
        case 4:
          return (
            <h4 className="text-[1em]" key={`${elementKey}-h4`}>
              {content}
            </h4>
          );
        case 5:
          return (
            <h5 className="text-[1em]" key={`${elementKey}-h5`}>
              {content}
            </h5>
          );
        default:
          return (
            <h6 className="text-[1em]" key={`${elementKey}-h6`}>
              {content}
            </h6>
          );
      }
    }
    case "Code": {
      const { code } = htmlData;
      return (
        <pre
          key={`${elementKey}-code_block`}
          className="border-[1.25px] border-black p-[10px] overflow-x-auto"
        >
          <code className="block">{code.join("\n")}</code>
        </pre>
      );
    }
    case "OrderedList": {
      const { list } = htmlData;
      const subKey = `${elementKey}-unordered_list`;
      return (
        <ol key={subKey}>
          {list.map((li, index) => (
            <li
              className="list-inside list-decimal"
              key={`${subKey}-item-${index}`}
            >
              {parseOneLine(li, subKey)}
            </li>
          ))}
        </ol>
      );
    }
    case "UnorderedList": {
      const { list } = htmlData;
      const subKey = `${elementKey}-ordered_list`;
      return (
        <ul key={subKey}>
          {list.map((li, index) => (
            <li
              className="list-inside list-disc"
              key={`${subKey}-item-${index}`}
            >
              {parseOneLine(li, subKey)}
            </li>
          ))}
        </ul>
      );
    }
    case "Table": {
      const { headers, rows } = htmlData;
      const subKey = `${elementKey}-table`;
      return (
        <div
          className="h-full w-full flex justify-center items-center md:justify-start p-2 overflow-x-auto"
          key={subKey}
        >
          <table className="border-[2px] border-black">
            <thead>
              <tr>
                {headers.map((header, index) => {
                  const headerKey = `${subKey}-header-${index}`;
                  return (
                    <th
                      className="bg-[#e2edff] p-1"
                      scope="col"
                      key={headerKey}
                    >
                      {parseOneLine(header, subKey)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => {
                const rowKey = `${subKey}-row-${r}`;
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
    case "Paragraph": {
      const { lines } = htmlData;
      const subKey = `${elementKey}-paragraph`;
      return (
        <div key={subKey}>
          {lines.map((line, index) => (
            <p className="wrap-break-word" key={`${subKey}-line-${index}`}>
              {parseOneLine(line, subKey)}
            </p>
          ))}
        </div>
      );
    }
    default: {
      console.log(`ERROR: unsupported HTML type ${htmlData.type}`);
      return <></>;
    }
  }
};
