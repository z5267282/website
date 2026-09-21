import Header1 from "../components/Header1";

import ProjectPreviewCard from "../cards/ProjectPreviewCard";

export default function ProjectHub() {
  return (
    <div className="pb-10">
      <title>sunny | projects</title>
      <div className="flex justify-center items-center h-[calc(1.5em_+20px)] pt-[20px]">
        <Header1 content="My Projects" />
      </div>
      <div className="mt-10 w-full flex flex-col items-center gap-y-[30px]">
        <BlogMarkdownParserPreview />
        <MvePreview />
        <FocusTrackerPreview />
      </div>
    </div>
  );
}

function FocusTrackerPreview() {
  return (
    <ProjectPreviewCard
      url="https://github.com/z5267282/thesis"
      title="Focus Tracker"
      dates="2023"
      description="An educational tool that executes a Python program and traces significant points in execution. Fith-Year Software Engineering thesis project."
      technologies="Backend written in Python with unit and integration testing done in Pytest. Frontend written in React JS and vanilla CSS."
    />
  );
}

function MvePreview() {
  return (
    <ProjectPreviewCard
      url="https://github.com/z5267282/mve"
      title="Movie Editor (MVE)"
      dates="2022—present"
      description="A command-line tool to clip videos as an alternative to using a GUI application."
      technologies="Written as a Python module with tests written in Shell."
    />
  );
}

function BlogMarkdownParserPreview() {
  return (
    <ProjectPreviewCard
      url="https://github.com/z5267282/blog/tree/main/parser"
      title="Markdown Blog Parser"
      dates="2025"
      description="An open-source parser that takes in Markdown text and structures in into a fixed-JSON format. The blogs for this website were parsed from markdown using this parser."
      technologies="Written entirely in Rust."
    />
  );
}
