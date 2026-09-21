import { Link, useMatch } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-[#e2edff] w-screen h-[35px] flex justify-center align-center top-[0] fixed">
      <ol className="w-1/2 flex flex-row justify-center align-center">
        <Tab path="/" contents="home" />
        <Tab path="/projects" contents="projects" />
        <Tab path="/blogs" contents="blogs" rightBorder />
      </ol>
    </nav>
  );
}

/**
 * A component that centers text within a tab cell in the navigation bar.
 * @prop: path: string - path from root that the tab redirects to.
 * @prop: contents: string - what the tab displays.
 * @prop rightBorder: bool - whether to set the right border or not.
 */
function Tab({ path, contents, rightBorder = false }) {
  let classes =
    "list-none w-full h-full flex justify-center items-center border-l-[5px] border-white";
  if (rightBorder) {
    classes += " border-r-[5px]";
  }
  if (useMatch(`${path}/*`)) {
    classes += " bg-[#AFCDFF]";
  }
  return (
    <li className={classes}>
      <Link
        className="w-full h-full flex justify-center items-center hover:bg-[#FFE2FC]"
        to={path}
      >
        {contents}
      </Link>
    </li>
  );
}
