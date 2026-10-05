import { Link } from "react-router-dom";

export default function AlignedLink({ to, linkText, desc }) {
  return (
    <>
      <Link
        className="inline text-blue-500 underline hover:text-blue-700"
        to={to}
      >
        {linkText}
      </Link>
      <span>: {desc}</span>
    </>
  );
}
