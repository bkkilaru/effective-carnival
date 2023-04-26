import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `posts/*.md`,
  fields: {
    title: { type: "string", required: true },
    author: { type: "string", required: true },
    brief: { type: "string", required: true },
    heroImage: { type: "string", required: true },
    readTimeInMinutes: { type: "number", required: true },
    createdAt: { type: "date", required: true },
    updatedAt: { type: "date", required: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => {
        const parts = post._raw.flattenedPath.split("/");
        return parts[parts.length - 1];
      },
    },
    url: {
      type: "string",
      resolve: (post) => {
        const parts = post._raw.flattenedPath.split("/");
        const slug = parts[parts.length - 1];
        return `/blog/${slug}`;
      },
    },
  },
}));

export const Author = defineDocumentType(() => ({
  name: "Author",
  filePathPattern: `authors/*.md`,
  fields: {
    name: { type: "string", required: true },
    image: { type: "string", required: true },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (author) => {
        const parts = author._raw.flattenedPath.split("/");
        return parts[parts.length - 1];
      },
    },
  },
}));

export default makeSource({
  contentDirPath: "blog",
  documentTypes: [Post, Author],
});
