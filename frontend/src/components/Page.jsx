import Header1 from "./Header1";

/**
 * A page with its sole <h1> fixed at the top in a uniformly-spaced header, followed by its content spread evenly over the remaining space.
 * @prop: title: string - displayed as the page's main heading.
 * @prop: children: React.ReactNode - the page's content beneath the header.
 */
export default function Page({ title, children }) {
  return (
    <>
      <header className="w-full py-(--page-header-padding) text-center">
        <Header1 content={title} />
      </header>
      <div className="min-w-0 w-full flex-1 flex flex-col justify-evenly items-center">
        {children}
      </div>
    </>
  );
}
