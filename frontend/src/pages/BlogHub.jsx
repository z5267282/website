import { getBlogs } from "../content";
import MarkdownHub from "../components/MarkdownHub";

export default function BlogHub() {
  return (
    <>
      <title>sunny | blogs</title>
      <MarkdownHub
        heading="Blogs"
        links={getBlogs().map(({ slug, metadata }) => ({
          to: `/blogs/${slug}`,
          title: metadata.title,
        }))}
      />
    </>
  );
}
