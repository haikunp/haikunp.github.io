import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const dateLike = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), { message: 'Invalid date' });

const BODY_KINDS = ['news', 'article'] as const;

// A single collection for both News and Articles. `kind` decides which
// homepage section a story appears in; `order` controls manual arrangement
// (lower first) so editors can rearrange freely from the dashboard.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().min(5).max(140),
    kind: z.enum(BODY_KINDS).default('news'),
    // Short standfirst shown on cards and near the top of the story.
    answer: z.string().min(10).max(600),
    topic: z.string().min(2).max(40).default('crypto'),
    description: z.string().min(20).max(320),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(320).optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        })
      )
      .default([]),
    author: z.string().default('MiniAdda Editorial'),
    publishedAt: dateLike,
    updatedAt: dateLike.optional(),
    lastVerified: dateLike.optional(),
    featured: z.boolean().default(false),
    trending: z.boolean().default(false),
    // Manual arrangement weight (lower = earlier). Managed by the dashboard.
    order: z.number().int().default(0),
  }),
});

export const collections = { articles };
