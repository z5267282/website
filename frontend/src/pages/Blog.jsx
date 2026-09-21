import { useParams } from "react-router-dom";
import { URLtoBlog } from "../blogToURL";
import { getBlog } from "../unpack";
import parseOneLine from "../parser";

export default function Blog() {
  const { lang, title } = useParams();
  const displayTitle = URLtoBlog(title);

  return (
    <div className="min-y-screen">
      <header className="text-[1.5em] flex justify-center items-center h-[calc(1.5em_+20px)] w-full pt-[20px]">
        {capitalise(displayTitle)}
      </header>
      <div className="w-full h-auto ml-0 mr-0 pl-[5%] pr-[5%] md:pl-[10vw] md:pr-[10vw] pb-10 overflow-x-auto">
        {getBlog(lang, displayTitle).map((html, index) =>
          genHTML(html, genElementKey(title, index))
        )}
      </div>
    </div>
  );
}

/**
 * Convert the first letter of each word spliy by whitespace to uppercase.
 * @param {String} text
 * @returns A copy of the original string with each word capitalised.
 */
const capitalise = (text) => {
  let inWord = false;
  const result = Array.from(text.split("")).map((c) => {
    // non-letter
    if (/\s/.test(c)) {
      inWord = false;
      return c;
    }
    // letter in middle of word
    else if (inWord) {
      return c;
    }
    // start of word
    else {
      inWord = true;
      return c.toUpperCase();
    }
  });
  return result.join("");
};

/**
 * Generate the base part of an element's key for React-rendering management.
 * @param {String} urlTitle The title of the current blog as a url-safe String - i.e. it is in kebab case.
 * @param {Number} index The position of the element within the blog.
 * @returns A String of the current element's key for for managing React rendering formatted as: "urlTitle-index". This will form the base of the key to any children the element may have e.g. a child will have key "urlTitle-index-subIndex-...".
 */
const genElementKey = (urlTitle, index) => {
  return `${urlTitle}-${index}`;
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
        // this div is needed to ensure code blocks appear on their own lines even if there is room for both to appear on the same one
        <div key={`${elementKey}-code_block`}>
          {/* inline-block allows the <pre> to grow as big as the <code> */}
          <pre className="inline-block border-[2px] my-2 border-black p-2 overflow-x-auto">
            <code className="w-max">{code.join("\n")}</code>
          </pre>
        </div>
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
