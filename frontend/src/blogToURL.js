/**
 * To convert between blog raw title and URL.
 */

export const blogToURL = (rawTitle) => rawTitle.replaceAll(" ", "-");

export const URLtoBlog = (url) => url.replaceAll("-", " ");
