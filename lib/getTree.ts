import { getPage } from "./getPage";
import { getListOfPaths } from "./getListOfPaths";

export async function getTree(
  version: string
): Promise<TreeProps[] | undefined> {
  const listOfPaths = getListOfPaths(version);
  const pages: PageMetaProps[] = [];

  // For every path, get the page
  for (const file of listOfPaths) {
    const post = await getPage(file, { metaOnly: true });
    if (post) pages.push(post);
  }

  // Add metadata to pages to create the tree
  const flatTree = pages
    .filter((page) => !page.isTab)
    .map((page) => {
      // Clean up path
      const relativePath = page.path.replace("content/test-docs/", "");
      const relativePathWithoutExtension = relativePath.replace(/\.mdx?$/, "");

      // Utils
      const segments = relativePathWithoutExtension.split("/");
      const lastSegment = relativePathWithoutExtension.split("/").pop() || "";
      const isIndex = lastSegment === "index";
      const isLeaf = lastSegment !== "index";

      let level = 0;

      // Level 1
      if (isIndex && segments.length === 2) level = 1;
      if (isLeaf && segments.length === 1) level = 1;

      // Level 2
      if (isLeaf && segments.length === 2) level = 2;
      if (isIndex && segments.length === 3) level = 2;

      // Level 3
      if (isLeaf && segments.length === 3) level = 3;

      return {
        ...page,
        level,
      };
    });

  const tree: TreeProps[] = flatTree
    .filter((page) => page.level === 1)
    .map((level1) => {
      const level2 = flatTree
        .filter((page) => page.level === 2)
        .filter((child) => child.parent === level1.id)
        .sort((a, b) => a.order - b.order); // Sort level 2 pages by order

      const children = level2.map((level2) => {
        const level3 = flatTree
          .filter((page) => page.level === 3)
          .filter((lvl3) => lvl3.parent === level2.id)
          .sort((a, b) => a.order - b.order); // Sort level 3 pages by order

        return { ...level2, children: level3 };
      });

      return { ...level1, children };
    })
    .sort((a, b) => a.order - b.order); // Sort level 1 pages by order

  return tree;
}
