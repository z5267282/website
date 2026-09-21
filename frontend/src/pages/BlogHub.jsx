import { Link } from "react-router-dom";

import { getLanguages } from "../unpack";
import Header1 from "../components/Header1";

export default function BlogHub() {
  const languages = Array.from(getLanguages());
  languages.sort();

  return (
    <div className="min-h-screen">
      <title>sunny | blogs</title>
      <div className="flex justify-center items-center h-[calc(1.5em_+20px)] pt-[20px]">
        <Header1 content="Language-Semantic Blogs" />
      </div>
      <ul className="mt-10 w-full h-auto flex flex-col items-center gap-y-[20px]">
        {languages.map((language) => (
          <LanguageLinkCard language={language} key={`hub-${language}`} />
        ))}
      </ul>
    </div>
  );
}

function LanguageLinkCard({ language }) {
  return (
    <li className="bg-green-50 h-[2.5em] w-1/4" key={`lang-${language}`}>
      <Link
        className="flex justify-center items-center h-full w-full text-[1.15em] bg-[#fff4e2] rounded-lg p-5 hover:bg-[#FFE1AF]"
        to={`/blogs/${language}`}
      >
        {language}
      </Link>
    </li>
  );
}
