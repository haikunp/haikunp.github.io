// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';


// https://astro.build/config
export default defineConfig({
  site: 'https://miniadda.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      serialize(item) {
        // Homepage gets top priority; tools and hubs next; long-tail price pages lower.
        if (item.url === 'https://miniadda.com/') {
          return { ...item, priority: 1.0 };
        }
        if (/\/(prices|sigcamp|news|article)\/?$/.test(item.url)) {
          return { ...item, priority: 0.9 };
        }
        if (item.url.includes('/prices/')) {
          return { ...item, priority: 0.7 };
        }
        if (/\/(news|article)\//.test(item.url)) {
          return { ...item, priority: 0.8 };
        }
        return { ...item, priority: 0.6 };
      },
    }),
  ],
});
