# Andy Bevan · Technical Journal

This repo is both the live journal and a lightweight theme manager. Your content stays here, but the UI renders whichever registered Astro template you install and enable from `themes/`. The current workflow targets `Spectre`, `AstroPaper`, `Fuwari`, and `AstroWind` (see `themes/registry.json`), but you can add more entries later.

## Quickstart

1. `npm install`
2. Drop your markdown/MD files under `content/posts`, then run `npm run posts:sync` to push them into every registered theme.
3. `npm run theme:list` – see the registry status.
4. `npm run theme:install -- <id>` – clone/update a template (e.g., `spectre`).
5. `npm run theme:enable -- <id>` – mark that template as the active project.
6. `THEME_PORT=4174 npm run theme:dev` – run the enabled theme locally on your chosen port.
7. When you want a Dockerized preview, keep `THEME_PORT` the same and run `docker compose up --build`.

The commands in steps 3-5 always talk to the `themes/` workspace, so your main repo stays clean and your posts/content are shared across themes.

## Theme manager commands

- `npm run theme:list` shows every registry entry along with its install state and the active theme pointer.
- `npm run theme:install -- <id>` clones (or pulls) `themes/<id>` from the GitHub repo declared in `themes/registry.json`.
- `npm run theme:enable -- <id>` writes `themes/.active-theme.json` so the runner, Docker, and the `/theme-showcase` page all target that project.
- `npm run theme:dev` installs dependencies for the active template (`THEME_NPM_FLAGS` defaults to `--legacy-peer-deps` for Astro 6 themes) and then runs `npm run dev` from that clone with `THEME_PORT`.
- `npm run posts:sync` copies the markdown files under `content/posts` into each theme's configured posts folder before you preview or deploy.

To override install behavior, set `THEME_NPM_FLAGS` before you run `npm run theme:dev`. To preview multiple themes from the same repo, set `THEME_ID=<id>` when you start Docker or `npm run theme:dev`; the manager reads that env first and leaves `themes/.active-theme.json` untouched so each container can target its own theme.

## Content workspace

Keep your canonical blog posts inside `content/posts`. Every entry you add there will be copied to the themes you choose, so you only write the article once. The sync command expects plain Markdown files with front matter keys like `title`, `description`, `createdAt`, `pubDatetime`, and `tags`. Run `npm run posts:sync` whenever you make changes so every template sees the latest drafts.

## Running multiple themes

Need to compare several templates at once? `scripts/run-theme-containers.ps1` automates the workflow by spinning up one `docker compose up` window per theme. It syncs the posts, sets `THEME_ID`/`THEME_PORT`, and keeps each container pinned to a unique port (defaults to `4173`, `4174`, etc.). Example:

```
pwsh scripts/run-theme-containers.ps1 -StartPort 4173
pwsh scripts/run-theme-containers.ps1 -StartPort 4180 -Themes "spectre,astrowind" -NoBuild
```

Each window sets `THEME_NPM_FLAGS=--legacy-peer-deps` and leaves itself open so you can read the logs while you explore different UIs.

## Adding a theme

If you want to register, install, and launch a new theme in one step, use `scripts/add-theme.ps1`. Example:

```powershell
pwsh -File .\scripts\add-theme.ps1 `
  -Id "jd-blog-astro" `
  -Name "JD Blog Astro" `
  -Repo "https://github.com/jonadev-ok/astro-blog-template.git" `
  -Demo "https://astro-blog-template.vercel.app/" `
  -Description "Dark, MDX-driven Astro blog template with search, reading time, and Tailwind styling." `
  -ProjectPath "astro-blog-template" `
  -PostsFolder "astro-blog-template/src/content/posts" `
  -Port 4178
```

The script appends the registry entry if needed, then calls the single-theme launcher with `-InstallTheme` so the new theme is cloned and started immediately.

## Docker development

1. `THEME_PORT=4174 docker compose up --build`.
2. Browse `http://127.0.0.1:${THEME_PORT}` while the container stays up.
3. `docker compose down` tears the container and network down.

Docker now invokes `npm run theme:dev`, so it automatically reads the enabled template and your `THEME_PORT`. The container shares the repo via a bind mount, keeping live reload working as you edit the enabled theme.

## Theme registry

Manage the available themes in `themes/registry.json`. The runner treats `themes/` as a local workspace, and you only commit the registry and `themes/README.md` so you can delete/reclone entries without cluttering the history. Add or reorder entries here to expand or reprioritize your experiments.

## Theme showcase

Visit `/theme-showcase` in the current site to see card links to the registered templates, their demos, and the install/enable commands. It mirrors the CLI commands so you never need to memorize IDs.

## Build & deploy

1. `npm run build` (runs `astro check`, `astro build`, and `pagefind`).
2. Pushing `main` triggers `.github/workflows/deploy.yml` that builds whichever template is enabled and pushes `dist` to `gh-pages`.

## Future ideas

- Integrate interactive demos via Astro islands inside blog posts.
- Add more curated templates to the registry when you find a direction you want to test.
- Once you settle on a final layout, simplify the manager to point permanently to that theme.
