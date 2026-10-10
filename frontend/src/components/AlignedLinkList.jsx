/**
 * A list of links that are aligned, each with a text description
 * @param {{ children: React.ReactNode }} props
 */
export default function AlignedLinkList({ children }) {
  return <div className="grid grid-cols-[auto_1fr]">{children}</div>;
}
