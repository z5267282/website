import { Head } from "vite-react-ssg";

import { getBlogs } from "../content";
import MarkdownHub from "../components/MarkdownHub";

export default function BlogHub() {
  return (
    <>
      <Head>
        <title>sunny | blogs</title>
      </Head>
      <MarkdownHub
        heading="Blogs"
        links={getBlogs().map(({ slug, metadata }) => ({
          to: `/blogs/${slug}`,
          title: metadata.title,
          date: metadata.date,
          description: metadata.description,
        }))}
      />
    </>
  );
}
