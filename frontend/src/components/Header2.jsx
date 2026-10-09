export default function Header2({ content, styles = "" }) {
  return <h2 className={`text-[1.2em] ${styles}`}>{content}</h2>;
}
