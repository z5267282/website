import { useParams } from "react-router-dom";

import { getLoreEntries } from "../content";
import MarkdownHub from "../components/MarkdownHub";

export default function LanguageHub() {
  const { lang } = useParams();

  return (
    <>
      <title>{`sunny | lore | ${lang}`}</title>
      <MarkdownHub
        heading={`Language-Semantics for ${lang}`}
        links={getLoreEntries(lang).map(({ slug, metadata }) => ({
          to: `/lore/${lang}/${slug}`,
          title: metadata.title,
          date: metadata.date,
          description: metadata.description,
        }))}
      />
    </>
  );
}
