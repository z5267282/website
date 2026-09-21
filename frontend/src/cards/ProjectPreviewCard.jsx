import Header2 from "../components/Header2";
import Header3 from "../components/Header3";

export default function ProjectPreviewCard({
  url,
  title,
  dates,
  description,
  technologies,
}) {
  return (
    <a
      href={url}
      className="block w-4/5 lg:w-1/2 min-h-min bg-[#fff4e2] rounded-lg p-5 hover:bg-[#FFE1AF]"
      target="_blank"
    >
      <div className="grid grid-cols-[70%_30%]">
        <b>
          <Header2 content={title} />
        </b>
        <b>
          <Header2 content={dates} />
        </b>
      </div>
      <b>
        <Header3 content="Description" />
      </b>
      <p>{description}</p>
      <b>
        <Header3 content="Technologies" />
      </b>
      <p>{technologies}</p>
    </a>
  );
}
