/*
    Handle data extraction from the blogs object.
    This is a stand in for a server.
*/

import blogs from "./blog-lang.json";

export const getLanguages = () =>
  Array.from(blogs.map((blog) => blog.language));

/**
 * Try to get all blog titles for a given language.
 * @param {*} language
 * @returns a list of blog titles for the given language. Return an empty list if the language could not be found.
 */
export const getBlogTitlesForLanguage = (language) => {
  let langBlogs = blogs.find((currLang) => currLang.language == language);
  return langBlogs === undefined
    ? []
    : Array.from(langBlogs.blogs.map((blog) => blog.title));
};

/**
 * Get the blog with a given title already converted to be url safe for the given language.
 * @param {*} urlLang
 * @param {*} title
 * @returns a list of parsed markdown prepared to be injected as HTML. Return an empty list if the language could not be found, nor the title underneath the language could.
 */
export const getBlog = (urlLang, title) => {
  let langBlogs = blogs.find((currLang) => currLang.language === urlLang);
  if (langBlogs === undefined) {
    return [];
  }
  let blogEntry = Array.from(langBlogs.blogs).find(
    (currBlog) => currBlog.title === title
  );
  return blogEntry === undefined ? [] : blogEntry.html;
};
