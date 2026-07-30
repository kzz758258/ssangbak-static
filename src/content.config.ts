import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    permalink: z.string(),
    slugPath: z.string(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    affiliateDisclosure: z.string().optional(),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.string().url()
      })
    ).default([]),
    relatedPosts: z.array(z.string()).default([]),
    originalUrl: z.string().url()
  })
});

export const collections = { posts };
