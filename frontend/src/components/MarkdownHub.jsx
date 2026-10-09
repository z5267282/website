import { Link } from "react-router-dom";

import Page from "./Page";

/**
 * A hub of links to pieces of parsed Markdown, laid out as a single column of cards.
 * @prop: heading: string - displayed as the header.
 * @prop: links: { to: string, title: string, date: string, description: string }[] - where each link redirects to and what it displays.
 */
export default function MarkdownHub({ heading, links }) {
  return (
    <Page title={heading}>
      {/* sizes to the widest card, capped at the parent's width */}
      <ul className="flex max-w-full pb-10 flex-col gap-y-[30px]">
        {links.map(({ to, title, date, description }) => (
          <li key={to}>
            <Link
              className="block border-[1.25px] rounded-md p-[15px] hover:bg-(--nav-colour)"
              to={to}
            >
              <div className="flex justify-between items-baseline gap-x-[15px]">
                <span className="font-bold text-[1.1em]">{title}</span>
                <time className="shrink-0" dateTime={date}>
                  {date}
                </time>
              </div>
              <p className="text-[0.85em] mt-[5px]">{description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
