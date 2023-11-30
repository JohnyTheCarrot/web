import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Callout } from "@/components/Callout";
import { CodeSnippets } from "@/components/CodeSnippets";

export async function getPageByName(
  fileName: string
): Promise<PageProps | undefined> {
  const res = await fetch(
    `https://raw.githubusercontent.com/storybookjs/web/main/${fileName}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_STORYBOOK_BOT_PAT}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "storybook-bot",
      },
      cache: "no-store", // To remove when solving the cache error
    }
  );

  if (!res.ok) return undefined;

  const rawMDX = await res.text();

  if (rawMDX === "404: Not Found") return undefined;

  const { frontmatter, content } = await compileMDX<{
    title: string;
    sidebar_title?: string;
    is_tab?: boolean;
  }>({
    source: rawMDX,
    components: {
      CodeSnippets,
      Callout,
    },
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          // [rehypeHighlight, {}],
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
            },
          ],
        ],
      },
    },
  });

  const id = fileName.replace(/\.mdx$/, "");

  const raw = id.replace("docs/", "");
  const split = raw.split("/");

  const pageObj: PageProps = {
    meta: {
      id,
      paths: split,
      href: `/${id}`,
      title: frontmatter.title,
      sidebarTitle: frontmatter.sidebar_title || frontmatter.title || "",
      isTab: frontmatter.is_tab || false,
    },
    content,
  };

  return pageObj;
}