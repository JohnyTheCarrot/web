import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { common } from "lowlight";
import { Callout } from "@/components/mdx/Callout";
import { CodeSnippets } from "@/components/mdx/CodeSnippets";
import { IfRenderer } from "@/components/mdx/IfRenderer";
import { YouTubeCallout } from "@/components/mdx/YouTubeCallout";
import { FeatureSnippets } from "@/components/mdx/FeatureSnippets";
import { getSlug } from "./getSlug";
import { P, H1, H3 } from "@/components/mdx";
import fs from "fs";

export async function getPage(path: string) {
  if (!path) return undefined;

  const fileContents = fs.readFileSync(`content/${path}`, "utf8");

  const { frontmatter, content } = await compileMDX<{
    title: string;
    short_title?: string;
    show_as_tab?: boolean;
  }>({
    source: fileContents,
    components: {
      h1: H1,
      h2: H1,
      h3: H3,
      h4: H1,
      p: P,
      CodeSnippets,
      Callout,
      IfRenderer,
      YouTubeCallout,
      FeatureSnippets,
    },
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          [
            // @ts-ignore TODO: fix types
            rehypeHighlight,
            {
              languages: { ...common },
              subset: false,
            },
          ],
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

  const id = path.replace(/\.mdx$/, "");
  const segments = id.replace("docs/", "").split("/");
  const lastSegment = id.split("/").pop();
  const lastRealSegment =
    lastSegment === "index" ? segments[segments.length - 2] : lastSegment;
  const slug = getSlug(lastRealSegment);

  const pageObj: PageProps = {
    meta: {
      path,
      name: path.split("/").pop() || "",
      slug: slug || "",
      title: frontmatter.title,
      shortTitle: frontmatter.short_title || frontmatter.title || "",
      showAsTabs: frontmatter.show_as_tab || false,
      segments,
    },
    content,
  };

  return pageObj;
}
