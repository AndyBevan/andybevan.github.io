#!/usr/bin/env node
import { spawn, execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const registryPath = new URL("../themes/registry.json", import.meta.url);
const registry = JSON.parse(readFileSync(registryPath, "utf-8"));

const THEMES_DIR = path.resolve("themes");
const ACTIVE_FILE = path.join(THEMES_DIR, ".active-theme.json");

const [, , command, target, ...rest] = process.argv;
const themesById = new Map(registry.map(theme => [theme.id, theme]));

function ensureThemesDir() {
  if (!existsSync(THEMES_DIR)) {
    mkdirSync(THEMES_DIR, { recursive: true });
  }
}

function getTheme(id) {
  return themesById.get(id);
}

function getInstalledPath(theme) {
  return path.join(THEMES_DIR, theme.id);
}

function getThemeProjectPath(theme) {
  return path.join(getInstalledPath(theme), theme.project_path ?? "");
}

function getInstallCommand(packageManager, npmInstallFlags) {
  if (packageManager === "pnpm") {
    return "pnpm install";
  }

  return npmInstallFlags ? `npm install ${npmInstallFlags}` : "npm install";
}

function getNpmExecutable() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function detectPackageManager(theme, projectDir) {
  if (theme?.package_manager) {
    return theme.package_manager;
  }

  const packageJsonPath = path.join(projectDir, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (typeof pkg.packageManager === "string") {
        return pkg.packageManager.split("@")[0];
      }
    } catch {
      // ignore malformed package.json
    }
  }

  if (existsSync(path.join(projectDir, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  return "npm";
}

function prepareProjectForInstall(packageManager, projectDir) {
  if (packageManager !== "pnpm") {
    return;
  }

  const workspacePath = path.join(projectDir, "pnpm-workspace.yaml");
  if (!existsSync(workspacePath)) {
    return;
  }

  const workspaceConfig = readFileSync(workspacePath, "utf-8");
  if (workspaceConfig.includes("packages:")) {
    return;
  }

  // Some third-party themes ship a workspace file without a packages section.
  // Normalizing it here keeps pnpm installs deterministic across environments.
  const normalizedConfig = `packages:\n  - '.'\n\n${workspaceConfig}`;
  writeFileSync(workspacePath, normalizedConfig, "utf-8");
}

function readActiveTheme() {
  const overrideId = process.env.THEME_ID;
  if (overrideId) {
    return getTheme(overrideId) ?? null;
  }

  if (!existsSync(ACTIVE_FILE)) return null;
  try {
    const payload = JSON.parse(readFileSync(ACTIVE_FILE, "utf-8"));
    return getTheme(payload.id) ?? null;
  } catch {
    return null;
  }
}

function writeActiveTheme(theme) {
  if (process.env.THEME_ID) {
    return;
  }

  ensureThemesDir();
  writeFileSync(
    ACTIVE_FILE,
    JSON.stringify({ id: theme.id, enabledAt: new Date().toISOString() }, null, 2),
    "utf-8"
  );
}

function listThemes() {
  const active = readActiveTheme();
  console.log("Available themes:");
  for (const theme of registry) {
    const installed = existsSync(getInstalledPath(theme));
    const isActive = active?.id === theme.id;
    console.log(
      `${isActive ? "*" : " "} ${theme.id} - ${theme.name} ${installed ? "(installed)" : "(missing)"}`
    );
  }
  console.log("");
  console.log("Commands:");
  console.log("  npm run theme:install -- <id>");
  console.log("  npm run theme:enable -- <id>");
  console.log("  npm run theme:dev");
}

function installTheme(id) {
  const theme = getTheme(id);
  if (!theme) {
    console.error(`Unknown theme id: ${id}`);
    process.exit(1);
  }

  ensureThemesDir();
  const target = getInstalledPath(theme);
  if (existsSync(target)) {
    console.log(`Updating ${theme.name} (${theme.id})`);
    execSync(`git -C ${target} pull --ff-only`, { stdio: "inherit" });
  } else {
    console.log(`Cloning ${theme.name} (${theme.id})`);
    const branchArg = theme.branch ? `--branch ${theme.branch}` : "";
    execSync(
      `git clone --depth 1 ${branchArg} ${theme.repo} ${target}`,
      { stdio: "inherit" }
    );
  }
}

function enableTheme(id) {
  const theme = getTheme(id);
  if (!theme) {
    console.error(`Unknown theme id: ${id}`);
    process.exit(1);
  }

  const target = getThemeProjectPath(theme);
  if (!existsSync(target)) {
    console.error(`${theme.name} is not installed yet. Run \`npm run theme:install -- ${id}\` first.`);
    process.exit(1);
  }

  writeActiveTheme(theme);
  console.log(`${theme.name} (${theme.id}) is now the active theme.`);
}

function runTheme() {
  const theme = readActiveTheme();
  if (!theme) {
    console.error("No theme is enabled. Run `npm run theme:enable -- <id>`.");
    process.exit(1);
  }

  const target = getThemeProjectPath(theme);
  if (!existsSync(target)) {
    console.error(`Enabled theme ${theme.id} is missing. Reinstall it first.`);
    process.exit(1);
  }

  const port = process.env.THEME_PORT || "4173";
  const packageManager = detectPackageManager(theme, target);
  prepareProjectForInstall(packageManager, target);
  const npmInstallFlags = (process.env.THEME_NPM_FLAGS ?? "--legacy-peer-deps").trim();
  const installCmd = getInstallCommand(packageManager, npmInstallFlags);
  const npmExec = getNpmExecutable();
  console.log(`Running ${theme.name} on port ${port}...`);
  console.log(`> ${installCmd}`);
  execSync(installCmd, { cwd: target, stdio: "inherit" });

  let child;
  if (theme.run_mode === "preview") {
    const skipBuild = process.env.THEME_SKIP_BUILD === "true";
    if (!skipBuild) {
      rmSync(path.join(target, "dist"), { recursive: true, force: true });
      rmSync(path.join(target, ".vercel"), { recursive: true, force: true });
      child = spawn(
        npmExec,
        ["run", "build"],
        {
          cwd: target,
          stdio: "inherit",
          env: {
            ...process.env,
            JD_BLOG_DEPLOY_TARGET: "",
          },
          shell: false,
        }
      );
      child.on("error", error => {
        console.error(`Failed to build ${theme.name}:`, error.message);
        process.exit(1);
      });
      child.on("close", code => {
        if (code !== 0) {
          process.exit(code);
        }
        const previewChild = spawn(
          npmExec,
          ["run", "preview", "--", "--host", "0.0.0.0", "--port", port, ...rest],
          {
            cwd: target,
            stdio: "inherit",
            env: { ...process.env, THEME_PORT: port, JD_BLOG_DEPLOY_TARGET: "" },
            shell: false,
          }
        );
        previewChild.on("error", error => {
          console.error(`Failed to start ${theme.name}:`, error.message);
          process.exit(1);
        });
        previewChild.on("close", previewCode => process.exit(previewCode));
      });
      return;
    }

    child = spawn(
      npmExec,
      ["run", "preview", "--", "--host", "0.0.0.0", "--port", port, ...rest],
      {
        cwd: target,
        stdio: "inherit",
        env: { ...process.env, THEME_PORT: port, JD_BLOG_DEPLOY_TARGET: "" },
        shell: false,
      }
    );
  } else {
    child = spawn(
      npmExec,
      ["run", "dev", "--", "--host", "0.0.0.0", "--port", port, ...rest],
      {
        cwd: target,
        stdio: "inherit",
        env: { ...process.env, THEME_PORT: port },
        shell: false,
      }
    );
  }
  child.on("error", error => {
    console.error(`Failed to start ${theme.name}:`, error.message);
    process.exit(1);
  });
  child.on("close", code => process.exit(code));
}

switch (command) {
  case "list":
    listThemes();
    break;
  case "install":
    if (!target) {
      console.error("Please supply a theme id.");
      process.exit(1);
    }
    installTheme(target);
    break;
  case "enable":
    if (!target) {
      console.error("Please supply a theme id.");
      process.exit(1);
    }
    enableTheme(target);
    break;
  case "run":
  case "dev":
    runTheme();
    break;
  default:
    console.log("Usage: node scripts/theme-manager.js <list|install|enable|run>");
    process.exit(1);
}
