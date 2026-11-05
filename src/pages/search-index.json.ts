import type { APIRoute } from 'astro';
import { getAllArticles, articleUrl } from '../lib/content';

export const GET: APIRoute = async () => {
  const articles = await getAllArticles();
  const index = articles.map((a) => ({
    title: a.data.title,
    answer: a.data.answer,
    description: a.data.description,
    topic: a.data.topic,
    section: a.data.section,
    tags: a.data.tags,
    url: articleUrl(a),
    publishedAt: a.data.publishedAt.toISOString(),
  }));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
