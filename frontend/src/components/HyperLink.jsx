export default function HyperLink({ description, url }) {
  return (
    <a
      className="inline text-blue-500 underline hover:text-blue-700"
      href={url}
      target="_blank"
    >
      {description}
    </a>
  );
}
