import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export async function getAllArticles(): Promise<Article[]> {
  const all = await getCollection('articles');
  return all.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
}

export async function getSectionArticles(section: string): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.data.section === section);
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.data.tags.includes(tag));
}

export function articleUrl(article: Article): string {
  return `/${article.data.section}/${article.id}`;
}

export async function getRelated(article: Article, limit = 4): Promise<Article[]> {
  const all = await getAllArticles();
  const sameTopic = all.filter(
    (a) => a.id !== article.id && a.data.topic === article.data.topic
  );
  if (sameTopic.length >= limit) return sameTopic.slice(0, limit);
  const sameSection = all.filter(
    (a) => a.id !== article.id && a.data.section === article.data.section
  );
  const merged = [...sameTopic, ...sameSection].filter(
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

// All tags actually in use, with counts.
export function tagCounts(articles: Article[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const a of articles) {
    for (const t of a.data.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return counts;
}
