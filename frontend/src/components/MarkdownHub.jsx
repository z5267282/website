import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Page from "./Page";

const PAGE_SIZE = 5;
const CARD_HEIGHT = "80px";
// the most space between cards; it shrinks when the viewport is too short to fit a full page of cards
const CARD_GAP = "20px";
const SEARCH_BAR_HEIGHT = "40px";

/**
 * A hub of links to pieces of parsed Markdown, laid out as a single column of uniformly-sized cards, paginated `PAGE_SIZE` at a time.
 * The hub fills the page's remaining height without ever making it scroll.
 * The left and right arrow keys go to the previous and next page.
 * A search bar above the cards narrows them down to those whose title, description or date contains the search term.
 * @prop: heading: string - displayed as the header.
 * @prop: subheading: string (optional) - shown centred just above the cards; while searching it says how many cards were found instead.
 * @prop: links: { to: string, title: string, date: string, description: string }[] - where each link redirects to and what it displays.
 */
export default function MarkdownHub({ heading, subheading, links }) {
  const [page, setPage] = useState(0);
  const [term, setTerm] = useState("");
  const inputRef = useRef(null);
  const results = term ? links.filter((link) => matches(link, term)) : links;
  const numPages = Math.ceil(results.length / PAGE_SIZE);
  const shown = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < numPages - 1;
  // every page reserves room for a full page of cards and the page navigation, whatever the search term,
  // so the search bar, cards and buttons stay put when paging or searching
  const rows = Math.min(links.length, PAGE_SIZE);
  const hasNav = links.length > PAGE_SIZE;

  function search(newTerm) {
    setTerm(newTerm);
    setPage(0);
  }

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
        setPage((p) => Math.max(Math.min(p + 1, numPages - 1), 0));
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
        className="w-[90%] flex-1 [contain:size] flex flex-col justify-start"
        style={{
          minHeight: `calc(${rows} * ${CARD_HEIGHT}${subheading ? " + 1lh + var(--page-header-padding)" : ""} + ${SEARCH_BAR_HEIGHT} + 15px${hasNav ? " + 1lh + 15px" : ""})`,
        }}
      >
        {subheading && (
          <p className="truncate text-center pb-(--page-header-padding)">
            {term
              ? `found ${results.length} ${results.length === 1 ? "result" : "results"} for ${term}`
              : subheading}
          </p>
        )}
        <form
          className="shrink-0 flex items-center mb-[15px] px-[15px] rounded-md bg-gray-200"
          style={{ height: SEARCH_BAR_HEIGHT }}
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            ref={inputRef}
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-gray-400"
            type="text"
            placeholder="Search"
            aria-label="Search"
            value={term}
            onChange={(e) => search(e.target.value)}
          />
          {term && (
            <button
              type="button"
              className="ml-[10px] text-gray-600 hover:text-gray-600 cursor-pointer"
              aria-label="Clear search"
              onClick={() => {
                search("");
                inputRef.current.focus();
              }}
            >
              ✕
            </button>
          )}
        </form>
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
                className="h-full block border-[1.25px] rounded-md px-[15px] py-[10px] hover:bg-(--nav-colour)"
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
          {results.length === 0 && (
            <li className="row-1 self-center text-center text-gray-500">
              No results
            </li>
          )}
        </ul>
        {hasNav && (
          <nav className="flex justify-between items-baseline pt-[15px]">
            <span className={numPages > 0 ? "" : "invisible"}>
              {`Page ${page + 1} of ${numPages}`}
            </span>
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

/**
 * Whether a link's title, description or date contains the search term, ignoring case.
 */
const matches = ({ title, date, description }, term) => {
  const needle = term.toLowerCase();
  return [title, description, date].some((field) =>
    field.toLowerCase().includes(needle),
  );
};
