#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const registryFile = fileURLToPath(new URL("../themes/registry.json", import.meta.url));
const canonicalPostsDir = path.resolve("content/posts");
const themesDir = path.resolve("themes");

const args = process.argv.slice(2);
const requestedThemes = new Set();

function parseArgs() {
  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (token === "--theme" || token === "--id" || token === "-t") {
      const raw = args[i + 1];
      if (!raw) {
        console.error("Missing theme id after", token);
        process.exit(1);
      }
      raw
        .split(",")
        .map(part => part.trim())
        .filter(Boolean)
        .forEach(entry => requestedThemes.add(entry));
      i += 1;
    }
  }

  if (process.env.THEME_ID) {
    requestedThemes.add(process.env.THEME_ID);
  }
}

function collectFiles(dir, relative = "") {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryRelative = relative ? path.join(relative, entry.name) : entry.name;
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath, entryRelative));
    } else if (entry.isFile()) {
      files.push({ absolute: entryPath, relative: entryRelative });
    }
  }
  return files;
}

function clearDestination(destDir) {
  if (!existsSync(destDir)) {
    return;
  }
  for (const entry of readdirSync(destDir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) {
      continue;
    }
    const entryPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      rmSync(entryPath, { recursive: true, force: true });
    } else {
      rmSync(entryPath);
    }
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function splitFrontmatter(content) {
  if (!content.startsWith("---\n")) {
    return null;
  }

  const endIndex = content.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return null;
  }

  return {
    frontmatter: content.slice(4, endIndex),
    body: content.slice(endIndex + 5),
  };
}

function ensureJdBlogFrontmatter(content) {
  const parsed = splitFrontmatter(content);
  if (!parsed) {
    return content;
  }

  const { frontmatter, body } = parsed;
  if (/(^|\n)date:\s*/.test(frontmatter)) {
    return content;
  }

  const createdAtMatch = frontmatter.match(/(^|\n)createdAt:\s*([^\n]+)/);
  const pubDatetimeMatch = frontmatter.match(/(^|\n)pubDatetime:\s*([^\n]+)/);
  const publishedMatch = frontmatter.match(/(^|\n)published:\s*([^\n]+)/);
  const dateValue =
    createdAtMatch?.[2]?.trim() ??
    pubDatetimeMatch?.[2]?.trim() ??
    publishedMatch?.[2]?.trim();

  if (!dateValue) {
    return content;
  }

  const normalizedFrontmatter = `${frontmatter}\ndate: ${dateValue}`;
  return `---\n${normalizedFrontmatter}\n---\n${body}`;
}

function transformContent(theme, file) {
  const original = readFileSync(file.absolute, "utf-8");

  if (theme.id === "jd-blog-astro") {
    return ensureJdBlogFrontmatter(original);
  }

  return original;
}

function syncTheme(theme, files) {
  const themeDir = path.join(themesDir, theme.id);
  if (!existsSync(themeDir)) {
    console.warn(`[${theme.id}] theme not installed; skipping sync.`);
    return;
  }

  if (!theme.posts_folder) {
    console.warn(`[${theme.id}] has no posts_folder defined; skipping.`);
    return;
  }

  const destDir = path.join(themeDir, theme.posts_folder);
  ensureDir(destDir);
  clearDestination(destDir);

  for (const file of files) {
    const targetPath = path.join(destDir, file.relative);
    ensureDir(path.dirname(targetPath));
    const transformedContent = transformContent(theme, file);
    if (transformedContent === readFileSync(file.absolute, "utf-8")) {
      copyFileSync(file.absolute, targetPath);
    } else {
      writeFileSync(targetPath, transformedContent, "utf-8");
    }
  }

  console.log(`[${theme.id}] synced ${files.length} post(s) to ${path.relative(process.cwd(), destDir)}`);
}

function main() {
  parseArgs();

  if (!existsSync(canonicalPostsDir)) {
    console.error(`Canonical posts directory "${canonicalPostsDir}" does not exist.`);
    process.exit(1);
  }
  const canonicalFiles = collectFiles(canonicalPostsDir);
  if (!canonicalFiles.length) {
    console.warn("No posts were found in content/posts.");
    return;
  }

  const registry = JSON.parse(readFileSync(registryFile, "utf-8"));
  const themes = registry.filter(theme => {
    if (!theme.posts_folder) {
      return false;
    }
    if (!requestedThemes.size) {
      return true;
    }
    return requestedThemes.has(theme.id);
  });

  if (!themes.length) {
    console.warn("No themes matched the requested filters.");
    return;
  }

  for (const theme of themes) {
    syncTheme(theme, canonicalFiles);
  }
}

main();
