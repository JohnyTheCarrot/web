import getFormattedDate from "@/lib/getFormattedDate";
import { getDocsMeta, getPostByName } from "@/lib/docs";
import { notFound } from "next/navigation";
import Link from "next/link";
import "highlight.js/styles/github-dark.css";

// export const revalidate = 86400;
export const revalidate = 0;

type Props = {
  params: {
    pageId: string;
    subPageId: string;
  };
};

// export async function generateStaticParams() {
//   const pages = await getDocsMeta(); //deduped!

//   if (!pages) return [];

//   return pages.map((page) => ({
//     pageId: page.id,
//   }));
// }

// export async function generateMetadata({ params: { pageId } }: Props) {
//   const page = await getPostByName(`${pageId}.mdx`); //deduped!

//   if (!page) {
//     return {
//       title: "Post Not Found",
//     };
//   }

//   return {
//     title: page.meta.title,
//   };
// }

export default async function Post({ params: { pageId, subPageId } }: Props) {
  const page = await getPostByName(`docs/${pageId}/${subPageId}.mdx`); //deduped!

  if (!page) notFound();

  const { meta, content } = page;

  return (
    <>
      <h2 className="text-3xl mt-4 mb-0">{meta.title}</h2>
      <article>{content}</article>
    </>
  );
}
