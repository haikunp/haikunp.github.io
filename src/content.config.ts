import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { SECTION_SLUGS, TOPIC_SLUGS } from '../src/lib/constants';

const dateLike = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), { message: 'Invalid date' });

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().min(5).max(140),
    // Direct answer shown near the top of the article.
    answer: z.string().min(10).max(600),
    // Top-level section: us | international
    section: z.enum(SECTION_SLUGS as [string, ...string[]]),
    // Topic chip used for filtering.
    topic: z.enum(TOPIC_SLUGS as [string, ...string[]]),
    // Country / region tags (e.g. us, florida, belgium).
    tags: z.array(z.string()).default([]),
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
  }),
});

// BitcoinTalk signature campaigns (Sigcamp).
const sigcamp = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sigcamp' }),
  schema: z.object({
    title: z.string().min(5).max(140),
    project: z.string().min(2).max(80),
    // active | closed | upcoming
    status: z.enum(['active', 'closed', 'upcoming']).default('active'),
    reward: z.string().min(1).max(120), // e.g. "0.0002 BTC / post"
    slots: z.string().max(60).optional(), // e.g. "20 / 50 filled"
    startedAt: dateLike.optional(),
    threadUrl: z.string().url().optional(),
    description: z.string().min(10).max(320),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { articles, sigcamp };
