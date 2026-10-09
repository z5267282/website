import { useParams } from "react-router-dom";

import { getLoreEntry } from "../content";
import ParsedMarkdown from "../components/ParsedMarkdown";
import NotFound from "./NotFound";

export default function Lore() {
  const { lang, slug } = useParams();
  const entry = getLoreEntry(lang, slug);
  if (entry === undefined) {
    return <NotFound />;
  }

  return (
    <ParsedMarkdown
      metadata={entry.metadata}
      html={entry.html}
      elementKey={`${lang}-${slug}`}
    />
  );
}
