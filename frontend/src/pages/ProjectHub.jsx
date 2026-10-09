import { Head } from "vite-react-ssg";

import Header1 from "../components/Header1";

import ProjectPreviewCard from "../cards/ProjectPreviewCard";

export default function ProjectHub() {
  return (
    <>
      <Head>
        <title>sunny | projects</title>
      </Head>
      <Header1 content="My Projects" />
      <div className="flex mt-[20px] flex-col items-center gap-y-[30px]">
        <BlogMarkdownParserPreview />
        <MvePreview />
        <FocusTrackerPreview />
      </div>
    </>
  );
}

function FocusTrackerPreview() {
  return (
    <ProjectPreviewCard
      url="https://github.com/z5267282/thesis"
      title="Focus Tracker"
      description="An educational tool that executes a Python program and traces significant points in execution. Fith-Year Software Engineering thesis project."
      technologies="Python, React JS"
    />
  );
}

function MvePreview() {
  return (
    <ProjectPreviewCard
      url="https://github.com/z5267282/mve"
      title="Movie Editor (MVE)"
      description="A command-line tool to edit and name videos with logging."
      technologies="Python"
    />
  );
}

function BlogMarkdownParserPreview() {
  return (
    <ProjectPreviewCard
      url="https://github.com/z5267282/website/tree/main/parser"
      title="Markdown Blog Parser"
      description="Parse Markdown into a defined fixed-JSON format. The blogs for this website were parsed from markdown using this parser."
      technologies="Rust"
    />
  );
}
