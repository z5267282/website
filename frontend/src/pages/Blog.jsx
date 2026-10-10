import { useParams } from "react-router-dom";

import { getBlog } from "../content";
import ParsedMarkdown from "../components/ParsedMarkdown";
import NotFound from "./NotFound";

export default function Blog() {
  const { slug } = useParams();
  const blog = getBlog(slug);
  if (blog === undefined) {
    return <NotFound />;
  }

  return (
    <ParsedMarkdown
      metadata={blog.metadata}
      html={blog.html}
      elementKey={slug}
    />
  );
}
