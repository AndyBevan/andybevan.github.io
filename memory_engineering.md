# Memory: Multi-theme Astro rebuild

Date: 3/19/2026

## Work performed

1. Added `content/posts` as the canonical articles workspace, created three new MD entries, and built `scripts/posts-sync.js` so each registered theme receives the same posts ahead of previewing or deploying.
2. Expanded `themes/registry.json` to declare the destination folders for each template, plus documented the new approach in `README.md` and linked the workflow to per-theme CLI helpers (`posts:sync`, `scripts/run-theme-containers.ps1`, `scripts/dev.ps1`).
3. Updated `scripts/theme-manager.js` to detect the theme’s package manager (pnpm vs npm), print the install command for transparency, and spawn `npm run dev` via a `shell` on Windows while handling `child` errors; Docker and the PS helper now run via this manager.
4. Adjusted the Dockerfile and `.dockerignore` so the container ships pnpm globally, ignores theme node_modules, and can run the manager with mounted source files without reinstalling everything.

## Issues encountered

- **Theme collection schemas**: AstroPaper, Fuwari, and AstroWind expect `published` to be a date and will reject the shared posts otherwise. Added `published` fields (ISO timestamps) and resynced before rerunning the container.
- **pnpm-only themes**: Several templates (Spectre, Fuwari) are configured with pnpm and even run `only-allow pnpm`. Running `npm install` inside their clones failed. Solved it by detecting `packageManager`/`pnpm-lock` inside each theme and calling `pnpm install` from the manager, plus globally installing pnpm in the Docker image.
- **Docker context size**: The build was repeatedly including every theme’s `node_modules`, blowing up the context and provoking invalid file errors. Added `.dockerignore` entries (themes/*/node_modules and themes/*/.git) before rerunning builds.
- **Post sync workflow**: Without the sync script, each theme tried to load empty directories and failed; the new `posts:sync` copies all files from `content/posts` into the per-theme folders prior to installs or container spins.

## Fixes and validation

- Added README sections explaining the post sync workflow, the multi-theme launcher, and the commands for previewing in Docker.
- Documented steps via `TODO.md` and created `scripts/run-theme-containers.ps1` to fire up separate Compose windows for each theme (unique `THEME_PORT`/`THEME_ID`, `NoBuild` toggle, log windows left open).
- Verified each theme by running `docker compose up --build -d` with appropriate env vars and checking `curl -I` (Ports 4173/4174/4175/4176 all returned HTTP 200 once their installs completed).
- Recorded in this memory file the problems faced and their remediation steps, so future engineers know what was required to keep multi-theme previews working.
