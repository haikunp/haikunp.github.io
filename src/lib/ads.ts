// Central ad configuration. No ads render while `enabled` is false.
//
// Two placement types are supported:
//   'banner'   -> horizontal unit placed inline in the article flow.
//   'sidebar'  -> sticky unit shown on wide screens (falls back to hidden on mobile).
//
// To go live later:
//   1. Get approved by Google AdSense and note your publisher id (ca-pub-XXXX).
//   2. Create two ad units in AdSense and note their slot ids.
//   3. Set `enabled: true` and fill `publisherId` + each placement's `slotId`.
//   4. Add the AdSense loader script in BaseLayout (guarded by `ads.enabled`).

export type AdPlacement = 'banner' | 'sidebar';

export interface AdConfig {
  enabled: boolean;
  publisherId: string;
  placements: Record<
    AdPlacement,
    {
      enabled: boolean;
      slotId: string;
      // Optional: where the banner appears within the article.
      position?: 'after-answer' | 'mid-article';
    }
  >;
}

export const ads: AdConfig = {
  enabled: false,
  publisherId: '',
  placements: {
    banner: { enabled: false, slotId: '', position: 'after-answer' },
    sidebar: { enabled: false, slotId: '' },
  },
};
