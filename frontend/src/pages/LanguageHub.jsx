import { useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { getLoreEntries } from "../content";
import MarkdownHub from "../components/MarkdownHub";

export default function LanguageHub() {
  const { lang } = useParams();

  return (
    <>
      <Head>
        <title>{`sunny | lore | ${lang}`}</title>
      </Head>
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
