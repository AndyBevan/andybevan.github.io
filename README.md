# Andy Bevan · Technical Journal

Fresh Astro-powered blog with MDX, editorial typography, and a hidden theme lab so you can audition blue-led directions without shipping a switch to visitors.

## What’s inside
- Astro 6 + `@astrojs/mdx` for markdown-first editing and in-post component drops.
- Three curated blue themes plus a **theme lab** route that lets you toggle them while you’re iterating.
- Local Docker dev that mounts the repo so you can edit without rebuilding the container.
- GitHub Pages deployment via GitHub Actions (build output lands in `dist` and publishes via `gh-pages`).

## Local development

### Node (preferred)
1. `npm install`
2. `npm run dev -- --host 0.0.0.0 --port 4173`
3. Visit `http://127.0.0.1:4173`

### Docker
1. `docker compose up`
2. `http://127.0.0.1:4173` is served from inside the container.
3. Stop with `docker compose down`.

The Docker setup runs `npm install` once inside the image and then keeps `node_modules` in a named volume so edits to your files refresh instantly without rebuilding the image.

## Theme lab

Go to `http://127.0.0.1:4173/theme-lab` while running locally to switch between the three blue palettes. The main navigation doesn’t expose this route, so once you lock in a palette (`siteConfig.activeThemeId`), the rest of the world only sees that final look.

## Deployment

Push to `main` (or merge your feature branch) and the GitHub Actions workflow at `.github/workflows/deploy.yml` will build the site and publish `dist` to the `gh-pages` branch.

## Future roadmap

1. Publish MDX-based technical posts.
2. Add interactive demos or showcase widgets via Astro Islands inside posts.
3. Keep evolving the theme lab until one palette feels settled, then remove the route or guard it behind a flag.
