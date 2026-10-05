import { Link } from "react-router-dom";

export default function ListItemSubsectionLink({ to, linkText, desc }) {
  return (
    <li>
      <Link
        className="inline text-blue-500 underline hover:text-blue-700"
        to={to}
      >
        {linkText}
      </Link>
      <span>: {desc}</span>
    </li>
  );
}
