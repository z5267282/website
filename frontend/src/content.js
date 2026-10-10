/*
    Handle data extraction from the structured content folder.
    This is a stand in for a server.

    content/
        blog/<slug>.json
        lore/lore.json          - maps each language to its qwip
        lore/<lang>/<slug>.json

    Each markdown file follows the parser JSON schema: { metadata, html }.
*/

import qwips from "./content/lore/lore.json";

const blogFiles = import.meta.glob("./content/blog/*.json", {
  eager: true,
  import: "default",
});
const loreFiles = import.meta.glob("./content/lore/*/*.json", {
  eager: true,
  import: "default",
});

/**
 * Get the slug of a content file, which is its file name without the extension.
 * @param {String} path
 * @returns the slug e.g. "./content/blog/journey-into-docker.json" -> "journey-into-docker"
 */
const toSlug = (path) =>
  path
    .split("/")
    .at(-1)
    .replace(/\.json$/, "");

const blogs = Object.fromEntries(
  Object.entries(blogFiles).map(([path, markdown]) => [toSlug(path), markdown]),
);

const lore = {};
for (const [path, markdown] of Object.entries(loreFiles)) {
  const lang = path.split("/").at(-2);
  lore[lang] ??= {};
  lore[lang][toSlug(path)] = markdown;
}

/**
 * Summarise a slug to markdown mapping.
 * @param {Object} markdowns
 * @returns a list of { slug, metadata } sorted by title.
 */
const summarise = (markdowns) =>
  Object.entries(markdowns)
    .map(([slug, { metadata }]) => ({ slug, metadata }))
    .sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));

/**
 * @returns a list of { slug, metadata } for every blog, sorted by title.
 */
export const getBlogs = () => summarise(blogs);

/**
 * @param {String} slug
 * @returns the { metadata, html } of the blog. Return undefined if the blog could not be found.
 */
export const getBlog = (slug) => blogs[slug];

/**
 * @returns a sorted list of every language with lore.
 */
export const getLoreLanguages = () => Object.keys(lore).sort();

/**
 * @param {String} lang
 * @returns the qwip for a language. Return an empty string if it has none.
 */
export const getLoreQwip = (lang) => qwips[lang] ?? "";

/**
 * @param {String} lang
 * @returns a list of { slug, metadata } for every lore entry of the language, sorted by title. Return an empty list if the language could not be found.
 */
export const getLoreEntries = (lang) => summarise(lore[lang] ?? {});

/**
 * @param {String} lang
 * @param {String} slug
 * @returns the { metadata, html } of the lore entry. Return undefined if the language could not be found, nor the slug underneath the language could.
 */
export const getLoreEntry = (lang, slug) => lore[lang]?.[slug];
