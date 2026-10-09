import { Head } from "vite-react-ssg";

import { getLoreLanguages, getLoreQwip } from "../content";
import Header1 from "../components/Header1";
import AlignedLink from "../components/AlignedLink";
import AlignedLinkList from "../components/AlignedLinkList";

export default function LoreHub() {
  return (
    <>
      <Head>
        <title>sunny | lore</title>
      </Head>
      <Header1 content="Language-Semantic Lore" />

      <AlignedLinkList>
        {getLoreLanguages().map((language) => (
          <AlignedLink
            key={language}
            to={`/lore/${language}`}
            linkText={`${language}`}
            desc={getLoreQwip(language)}
          />
        ))}
      </AlignedLinkList>
    </>
  );
}
