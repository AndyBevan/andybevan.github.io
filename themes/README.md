# Theme workspace

This directory houses the cloned theme repos that you can install and enable from the orchestration scripts.
The clones stay local to keep the real repo tidy—only `themes/registry.json` lives in Git.

## Workflow

1. `npm run theme:list` to see the registry.
2. `npm run theme:install -- <id>` clones or updates the upstream theme.
3. `npm run theme:enable -- <id>` marks that theme as the active project.
4. `npm run theme:dev` runs the currently enabled theme.

Docker, Compose, and the docs all use this folder to find the active theme and match the right code base.
