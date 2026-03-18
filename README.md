# Andy Bevan · Technical Journal

Powered by the off-the-shelf AstroPaper theme, this repo now focuses purely on the writing: two MD posts, a curated layout, and a theme showcase where you can swap between other ready-made Astro templates (Journal, Writer, etc.) without rebuilding the tooling.

## Local development

### Node (preferred)

1. Install Node `24.14.0` or newer.
2. `npm install`
3. `npm run dev -- --host 0.0.0.0 --port 4173`
4. Visit `http://127.0.0.1:4173` and explore `/theme-showcase`.

### Docker

1. `docker compose up --build`
2. Browse `http://127.0.0.1:4173` while the container runs; edits on your host refresh instantly because the workspace is mounted.
3. Stop with `docker compose down`.

The Dockerfile pins `node:24.14-slim` to match Astro’s requirement.

## Theme showcase

Visit `/theme-showcase` for curated links to other Astro templates. Each card includes a live demo and the `npx create astro@latest --template …` command so you can spin up a new look in seconds.

## Build & deploy

1. `npm run build` (runs `astro check`, `astro build`, and `pagefind` for search).
2. When you push to `main`, `.github/workflows/deploy.yml` runs the same build and publishes `dist` to `gh-pages`.

## Future ideas

1. Keep integrating interactive demos inside these posts via Astro islands.
2. Expand the theme showcase content when more off-the-shelf directions appear.
3. Lock the theme you eventually ship under `src/config.ts` and remove the showcase link if you prefer a single permanent brand.
