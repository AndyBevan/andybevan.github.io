export type PostFrontmatter = {
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
  heroVariant?: string;
};

type PostModule = {
  default: (props?: Record<string, unknown>) => unknown;
  frontmatter: PostFrontmatter;
};

const modules = import.meta.glob("../content/posts/*.mdx", { eager: true }) as Record<string, PostModule>;

export const posts = Object.entries(modules)
  .map(([path, module]) => {
    const slug = path.split("/").pop()?.replace(".mdx", "") ?? "";
    return {
      slug,
      frontmatter: module.frontmatter,
      Content: module.default
    };
  })
  .filter((post) => post.slug)
  .sort((a, b) => (a.frontmatter.pubDate < b.frontmatter.pubDate ? 1 : -1));

export const getPostBySlug = (slug: string) => posts.find((post) => post.slug === slug);
