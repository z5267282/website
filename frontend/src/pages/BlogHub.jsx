import { getLanguages } from "../unpack";
import Header1 from "../components/Header1";
import ListItemSubsectionLink from "../components/ListItemSubsectionLink";

export default function BlogHub() {
  const languages = Array.from(getLanguages());
  languages.sort();

  return (
    <>
      <title>sunny | blogs</title>
      <Header1 content="Language-Semantic Blogs" />

      <ul className="mt-[20px]">
        {languages.map((language) => (
          <ListItemSubsectionLink
            to={`/blogs/${language}`}
            linkText={`${language}`}
            desc="TODO"
          />
        ))}
      </ul>
    </>
  );
}
