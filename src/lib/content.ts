import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type ContentKind = 'news' | 'article';

// Manual order wins (lower first); ties fall back to newest published date.
function byOrder(a: Article, b: Article): number {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  return b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
}

export async function getAllArticles(): Promise<Article[]> {
  const all = await getCollection('articles');
  return all.sort(byOrder);
}

export async function getByKind(kind: ContentKind): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.data.kind === kind);
}

export async function getOtherKind(kind: ContentKind): Promise<Article[]> {
  return getByKind(kind === 'news' ? 'article' : 'news');
}

export function articleUrl(article: Article): string {
  return `/${article.data.kind}/${article.id}`;
}

export async function getRelated(article: Article, limit = 3): Promise<Article[]> {
  const all = await getAllArticles();
  const sameTopic = all.filter((a) => a.id !== article.id && a.data.topic === article.data.topic);
  if (sameTopic.length >= limit) return sameTopic.slice(0, limit);
  const sameKind = all.filter((a) => a.id !== article.id && a.data.kind === article.data.kind);
  const merged = [...sameTopic, ...sameKind].filter(
    (a, i, arr) => arr.findIndex((x) => x.id === a.id) === i
  );
  return merged.slice(0, limit);
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export async function getTopicList(): Promise<{ slug: string; name: string; count: number }[]> {
  const all = await getAllArticles();
  const counts = new Map<string, number>();
  for (const a of all) counts.set(a.data.topic, (counts.get(a.data.topic) ?? 0) + 1);
  return [...counts.entries()].map(([slug, count]) => ({
    slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count,
  }));
}
