import { getLoreLanguages, getLoreQwip } from "../content";
import Header1 from "../components/Header1";
import AlignedLink from "../components/AlignedLink";
import AlignedLinkedList from "../components/AlignedLinksList";

export default function LoreHub() {
  return (
    <>
      <title>sunny | lore</title>
      <Header1 content="Language-Semantic Lore" />

      <AlignedLinkedList>
        {getLoreLanguages().map((language) => (
          <AlignedLink
            key={language}
            to={`/lore/${language}`}
            linkText={`${language}`}
            desc={getLoreQwip(language)}
          />
        ))}
      </AlignedLinkedList>
    </>
  );
}
