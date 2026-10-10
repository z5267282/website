import { getBlogs, getLoreLanguages, getLoreEntries } from "./content";
import Layout from "./Layout";

import AboutMe from "./pages/AboutMe";
import ProjectHub from "./pages/ProjectHub";
import BlogHub from "./pages/BlogHub";
import Blog from "./pages/Blog";
import LoreHub from "./pages/LoreHub";
import LanguageHub from "./pages/LanguageHub";
import Lore from "./pages/Lore";
import NotFound from "./pages/NotFound";

export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        children: [
          { index: true, Component: AboutMe },
          { path: "projects", Component: ProjectHub },
        ],
      },
      { path: "blogs", Component: BlogHub },
      {
        path: "blogs/:slug",
        Component: Blog,
        getStaticPaths: () => getBlogs().map(({ slug }) => `blogs/${slug}`),
      },
      { path: "lore", Component: LoreHub },
      {
        path: "lore/:lang",
        Component: LanguageHub,
        getStaticPaths: () => getLoreLanguages().map((lang) => `lore/${lang}`),
      },
      {
        path: "lore/:lang/:slug",
        Component: Lore,
        getStaticPaths: () =>
          getLoreLanguages().flatMap((lang) =>
            getLoreEntries(lang).map(({ slug }) => `lore/${lang}/${slug}`),
          ),
      },
      { path: "*", Component: NotFound },
    ],
  },
];
