export default function ListItemWithBoldPrefix({ bold, normal }) {
  return (
    <li>
      <b>{bold}</b>: {normal}
    </li>
  );
}
