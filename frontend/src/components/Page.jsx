import Header1 from "./Header1";

/**
 * A page with its sole <h1> fixed at the top in a uniformly-spaced header, followed by its content flowing down from beneath it.
 * @prop: title: string - displayed as the page's main heading.
 * @prop: description: string (optional) - shown on the left beneath the heading.
 * @prop: date: string (optional) - an ISO date (YYYY-MM-DD) shown on the right beneath the heading.
 * @prop: spread: boolean (optional) - spreads the content evenly over the remaining space instead.
 * @prop: children: React.ReactNode - the page's content beneath the header.
 */
export default function Page({
  title,
  description,
  date,
  spread = false,
  children,
}) {
  return (
    <>
      <header className="w-full text-center">
        <Header1 content={title} className="py-(--page-header-padding)" />
        {(description || date) && (
          <div className="w-full flex justify-between items-baseline gap-x-[15px] text-left pb-(--page-header-padding)">
            {description && <p className="italic">{description}</p>}
            {date && (
              <time className="ml-auto shrink-0" dateTime={date}>
                {date}
              </time>
            )}
          </div>
        )}
      </header>
      <div
        className={`min-w-0 w-full flex-1 flex flex-col items-center ${spread ? "justify-evenly" : "justify-start"}`}
      >
        {children}
      </div>
    </>
  );
}
