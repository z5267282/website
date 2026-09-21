/**
 * Create a button with an icon with an SVG path from: https://icons.getbootstrap.com/icons.
 */
export default function LogoButton({ url, path }) {
  return (
    <a href={url} target="_blank">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d={path} />
      </svg>
    </a>
  );
}
