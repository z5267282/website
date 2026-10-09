import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Page from "./Page";

const PAGE_SIZE = 5;
const CARD_HEIGHT = "90px";
// the most space between cards; it shrinks when the viewport is too short to fit a full page of cards
const CARD_GAP = "30px";

/**
 * A hub of links to pieces of parsed Markdown, laid out as a single column of uniformly-sized cards, paginated `PAGE_SIZE` at a time.
 * The hub fills the page's remaining height without ever making it scroll.
 * The left and right arrow keys go to the previous and next page.
 * @prop: heading: string - displayed as the header.
 * @prop: subheading: string (optional) - shown centred just above the cards.
 * @prop: links: { to: string, title: string, date: string, description: string }[] - where each link redirects to and what it displays.
 */
export default function MarkdownHub({ heading, subheading, links }) {
  const [page, setPage] = useState(0);
  const numPages = Math.ceil(links.length / PAGE_SIZE);
  const shown = links.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < numPages - 1;
  // every page reserves room for a full page of cards, so the cards and buttons stay put when paging
  const rows = Math.min(links.length, PAGE_SIZE);

  useEffect(() => {
    function onKeyDown(e) {
      // leave modified arrows (e.g. alt+left for browser back) and arrows typed into a field alone
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest("input, textarea, select, [contenteditable]")) {
        return;
      }
      if (e.key === "ArrowLeft") {
        setPage((p) => Math.max(p - 1, 0));
      } else if (e.key === "ArrowRight") {
        setPage((p) => Math.min(p + 1, numPages - 1));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [numPages]);

  return (
    <Page title={heading}>
      {/* contain:size stops the cards' gaps from stretching the page, so the hub fills the leftover space instead;
          it can then only grow the page as far as its min-height, which fits the cards with no gaps */}
      <div
        className="w-[90%] flex-1 [contain:size] flex flex-col justify-center"
        style={{
          minHeight: `calc(${rows} * ${CARD_HEIGHT}${subheading ? " + 1lh + var(--page-header-padding)" : ""}${numPages > 1 ? " + 1lh + 15px" : ""})`,
        }}
      >
        {subheading && (
          <p className="text-center pb-(--page-header-padding)">{subheading}</p>
        )}
        <ul
          className="flex-1 grid grid-cols-[minmax(0,1fr)]"
          style={{
            // fixed-height card tracks interleaved with shrinkable gap tracks
            gridTemplateRows: `repeat(${rows - 1}, ${CARD_HEIGHT} minmax(0, ${CARD_GAP})) ${CARD_HEIGHT}`,
            minHeight: `calc(${rows} * ${CARD_HEIGHT})`,
            maxHeight: `calc(${rows} * ${CARD_HEIGHT} + ${rows - 1} * ${CARD_GAP})`,
          }}
        >
          {shown.map(({ to, title, date, description }, i) => (
            <li key={to} style={{ gridRow: 2 * i + 1 }}>
              <Link
                className="h-full block border-[1.25px] rounded-md p-[15px] hover:bg-(--nav-colour)"
                to={to}
              >
                <div className="flex justify-between items-baseline gap-x-[15px]">
                  <span className="truncate font-bold text-[1.1em]">
                    {title}
                  </span>
                  <time className="shrink-0" dateTime={date}>
                    {date}
                  </time>
                </div>
                <p className="whitespace-nowrap overflow-x-auto text-[0.85em] mt-[5px]">
                  {description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        {numPages > 1 && (
          <nav className="flex justify-between items-baseline pt-[15px]">
            <span>{`Page ${page + 1} of ${numPages}`}</span>
            {/* the buttons are hidden rather than removed so they keep their positions */}
            <div className="flex gap-x-[15px]">
              <button
                type="button"
                className={`inline text-blue-500 hover:text-blue-700 cursor-pointer ${hasPrev ? "" : "invisible"}`}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <button
                type="button"
                className={`inline text-blue-500 hover:text-blue-700 cursor-pointer ${hasNext ? "" : "invisible"}`}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </Page>
  );
}
