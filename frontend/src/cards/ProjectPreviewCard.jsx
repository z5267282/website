import Header2 from "../components/Header2";

export default function ProjectPreviewCard({
  url,
  title,
  description,
  technologies,
}) {
  return (
    <a
      href={url}
      className="block w-[90%] border-[1.25px] rounded-md p-[15px] hover:bg-(--nav-colour)"
      target="_blank"
    >
      <Header2 content={title} styles="font-bold" />
      <div>{description}</div>
      <div className="mt-[10px]">{technologies}</div>
    </a>
  );
}
