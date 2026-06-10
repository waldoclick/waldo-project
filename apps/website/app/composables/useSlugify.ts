import slugify from "slugify";

export const useSlugify = () => {
  const toSlug = (value: string) =>
    slugify(value, { lower: true, strict: true, trim: true });

  return { toSlug };
};
