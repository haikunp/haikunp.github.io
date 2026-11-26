import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://miniadda.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url === 'https://miniadda.com/') {
          return { ...item, priority: 1.0 };
        }
        if (/\/(crypto-prices|crypto-price)\/?$/.test(item.url)) {
          return { ...item, priority: 0.9 };
        }
        if (item.url.includes('/convert/')) {
          return { ...item, priority: 0.6 };
        }
        return { ...item, priority: 0.8 };
      },
    }),
  ],
});
