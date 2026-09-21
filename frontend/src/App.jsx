import { getLanguages, getBlogTitlesForLanguage } from "./unpack";
import { blogToURL } from "./blogToURL";
import Layout from "./Layout";

import AboutMe from "./pages/AboutMe";
import ProjectHub from "./pages/ProjectHub";
import BlogHub from "./pages/BlogHub";
import LanguageHub from "./pages/LanguageHub";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: AboutMe },
      { path: "projects", Component: ProjectHub },
      { path: "blogs", Component: BlogHub },
      {
        path: "blogs/:lang",
        Component: LanguageHub,
        getStaticPaths: () =>
          Array.from(getLanguages()).map((lang) => `blogs/${lang}`),
      },
      {
        path: "blogs/:lang/:title",
        Component: Blog,
        getStaticPaths: () =>
          Array.from(getLanguages()).flatMap((lang) =>
            Array.from(getBlogTitlesForLanguage(lang)).map(
              (title) => `blogs/${lang}/${blogToURL(title)}`
            )
          ),
      },
      { path: "*", Component: NotFound },
    ],
  },
];
