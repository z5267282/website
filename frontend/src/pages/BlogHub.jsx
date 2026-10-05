import { getLanguages } from "../unpack";
import Header1 from "../components/Header1";
import AlignedLink from "../components/AlignedLink";
import AlignedLinkedList from "../components/AlignedLinksList";

export default function BlogHub() {
  const languages = Array.from(getLanguages());
  languages.sort();

  return (
    <>
      <title>sunny | blogs</title>
      <Header1 content="Language-Semantic Blogs" />

      <AlignedLinkedList>
        {languages.map((language) => (
          <AlignedLink
            key={language}
            to={`/blogs/${language}`}
            linkText={`${language}`}
            desc="TODO"
          />
        ))}
      </AlignedLinkedList>
    </>
  );
}
