import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://andybevan.github.io",
  output: "static",
  markdown: {
    syntaxHighlight: "prism"
  },
  integrations: [mdx()]
});
