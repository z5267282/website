import { Link, useMatch } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-(--nav-colour) grid grid-cols-[1fr_50%_1fr]">
      <div className="border-b-[1.25px] border-black"></div>
      <ol className="flex flex-row justify-center">
        <Tab path="/" contents="home" />
        <Tab path="/projects" contents="projects" />
        <Tab path="/blogs" contents="blogs" />
      </ol>
      <div className="border-b-[1.25px] border-black"></div>
    </nav>
  );
}

/**
 * A component that centers text within a tab cell in the navigation bar.
 * @prop: path: string - path from root that the tab redirects to.
 * @prop: contents: string - what the tab displays.
 */
function Tab({ path, contents }) {
  let classes =
    "list-none w-full h-full flex justify-center items-center border-black border-b-[1.25px] hover:border-b-[2px] hover:font-bold hover:border-b-blue-600";
  if (useMatch(`${path}/*`)) {
    classes += " bg-(--tab-selected-colour)";
  }
  return (
    <li className={classes}>
      <Link
        className="w-full h-full flex justify-center items-center"
        to={path}
      >
        {contents}
      </Link>
    </li>
  );
}
