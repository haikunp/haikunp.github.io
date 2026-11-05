export const SITE = {
  name: 'MiniAdda',
  tagline: 'Quick answers to the questions everyone is asking.',
  domain: 'miniadda.com',
  url: 'https://miniadda.com',
  description:
    'MiniAdda publishes short, direct answers to the questions everyone is asking about the US and the world — politics, tech, finance, science and more.',
  locale: 'en_US',
  defaultAuthor: 'MiniAdda Editorial',
} as const;

// Two top-level sections replace traditional categories.
export const SECTIONS = [
  { slug: 'us', name: 'US', blurb: 'What America is searching for.' },
  { slug: 'international', name: 'International', blurb: 'Answers from around the world.' },
] as const;

export type SectionSlug = (typeof SECTIONS)[number]['slug'];
export const SECTION_SLUGS = SECTIONS.map((s) => s.slug);

export function sectionName(slug: string): string {
  return SECTIONS.find((s) => s.slug === slug)?.name ?? slug;
}

// Topic chips stay for filtering within sections.
export const TOPICS = [
  { slug: 'politics', name: 'Politics' },
  { slug: 'technology', name: 'Technology' },
  { slug: 'business', name: 'Business' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'entertainment', name: 'Entertainment' },
  { slug: 'science', name: 'Science' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'general-knowledge', name: 'General Knowledge' },
] as const;

export type TopicSlug = (typeof TOPICS)[number]['slug'];
export const TOPIC_SLUGS = TOPICS.map((t) => t.slug);

export function topicName(slug: string): string {
  return TOPICS.find((t) => t.slug === slug)?.name ?? slug;
}

// Country / region tags let readers jump to local answers.
// `slug` is used in URLs and metadata; `name` is display text.
export const REGIONS = [
  { slug: 'us', name: 'United States' },
  { slug: 'florida', name: 'Florida' },
  { slug: 'california', name: 'California' },
  { slug: 'new-york', name: 'New York' },
  { slug: 'texas', name: 'Texas' },
  { slug: 'uk', name: 'United Kingdom' },
  { slug: 'belgium', name: 'Belgium' },
  { slug: 'canada', name: 'Canada' },
  { slug: 'australia', name: 'Australia' },
  { slug: 'india', name: 'India' },
  { slug: 'germany', name: 'Germany' },
  { slug: 'france', name: 'France' },
  { slug: 'global', name: 'Global' },
] as const;

export function regionName(slug: string): string {
  return REGIONS.find((r) => r.slug === slug)?.name ?? slug;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
