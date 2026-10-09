export default function Header1({ content, className = "" }) {
  return <h1 className={`text-[1.5em] ${className}`}>{content}</h1>;
}
