import { Head } from "vite-react-ssg";

import { getLoreLanguages, getLoreQwip } from "../content";
import Page from "../components/Page";
import AlignedLink from "../components/AlignedLink";
import AlignedLinkList from "../components/AlignedLinkList";

export default function LoreHub() {
  return (
    <>
      <Head>
        <title>sunny | lore</title>
      </Head>
      <Page title="Language-Semantic Lore">
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
      </Page>
    </>
  );
}
