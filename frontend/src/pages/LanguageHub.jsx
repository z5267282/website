import { Link, useParams } from "react-router-dom";

import { getBlogTitlesForLanguage } from "../unpack";
import { blogToURL } from "../blogToURL";
import Header1 from "../components/Header1";

export default function LanguageHub() {
  const { lang } = useParams();

  const titles = Array.from(getBlogTitlesForLanguage(lang));
  titles.sort();

  const mobileGrid = "grid center grid-cols-1 gap-y-[40px]";
  const tabletGrid = "md:grid md:grid-cols-2 md:gap-y-[30px] md:pb-[10px]";
  const desktopGrid = "ld:grid lg:grid-cols-3 lg:gap-y-[30px]";

  const mobileCell = "w-3/4 h-[0.75em] min-h-min justify-self-center";
  const tabletCell = "md:min-h-min md:h-[1.5em] md:justify-self-center";
  const desktopCell = "lg:ml-0 lg:h-[2em] lg:w-3/4";

  return (
    <div className="pb-10 md:pb-0 lg:pb-0">
      <div className="flex justify-center items-center h-[calc(1.5em_+20px)] pt-[20px]">
        <Header1 content={`Language-Semantics for ${lang}`} />
      </div>
      <ul
        className={`mt-10 w-full h-auto pg-5 ${mobileGrid} ${tabletGrid} ${desktopGrid}`}
      >
        {titles.map((title, i) => (
          <li
            className={`${mobileCell} ${tabletCell} ${desktopCell} ${alignDesktopViewPortCell(i)}`}
            key={`${lang}-${title}`}
          >
            <Link
              className="flex justify-center items-center h-full w-full text-[1.em] bg-[#fff4e2] rounded-lg p-5 hover:bg-[#FFE1AF]"
              to={`/blogs/${lang}/${blogToURL(title)}`}
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Determine the class name for a given cell on the desktop viewport.
 * There are three columns.
 * The first should be right-aligned.
 * The middle should be center-aligned.
 * The last should be left-aligned.
 * @param number - index of the current cell.
 * @returns string - of the correct class name.
 */
function alignDesktopViewPortCell(index) {
  // it had to be justify-self center since justify-items didn't work
  switch (index % 3) {
    case 0:
      return "lg:justify-self-end";
    case 1:
      return "lg:justify-self-center";
    // 2
    default:
      return "lg:justify-self-start";
  }
}
