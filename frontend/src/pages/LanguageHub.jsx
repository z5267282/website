import { useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { getLoreEntries } from "../content";
import MarkdownHub from "../components/MarkdownHub";

export default function LanguageHub() {
  const { lang } = useParams();
  const entries = getLoreEntries(lang);

  return (
    <>
      <Head>
        <title>{`sunny | lore | ${lang}`}</title>
      </Head>
      <MarkdownHub
        key={lang}
        heading={`Language-Semantics for ${lang}`}
        subheading={`${entries.length} ${entries.length === 1 ? "entry" : "entries"} for ${lang}`}
        links={entries.map(({ slug, metadata }) => ({
          to: `/lore/${lang}/${slug}`,
          title: metadata.title,
          date: metadata.date,
          description: metadata.description,
        }))}
      />
    </>
  );
}
