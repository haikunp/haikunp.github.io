## What this project is

MiniAdda — a lightweight tool-aggregation site. Four static pages: `/` (homepage
= site name + tool cards), `/crypto-price`, `/sigcamp`, `/cpu-mining`. No navbar,
no footer; every page uses the single `src/styles/global.css`. Keep it simple and
plain — avoid adding fancy design, extra dependencies, or new pages unless asked.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Before changing code

- Verify with `npm run check` and `npm run build`.
- Compile the dashboard: `python3 -m py_compile dashboard/*.py`.
- The two dashboard-managed tables live in `src/data/sigcamp.yml` and
  `src/data/cpu-coins.yml` (flat row format parsed by `src/lib/table.ts`). Edit
  them via the dashboard (`python3 -m dashboard.run`) or by hand in the same
  format; never change column meaning without updating `dashboard/content.py`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages or dynamic routes](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding styles](https://docs.astro.build/en/guides/styling/)
