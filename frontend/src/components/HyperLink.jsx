export default function HyperLink({ description, url }) {
  return (
    <a className="text-blue-400 underline" href={url} target="_blank">
      {description}
    </a>
  );
}
