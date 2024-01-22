import Image from "next/image";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import sizeOf from "image-size";
import fs from "fs";

type ImageProps = DetailedHTMLProps<
  HTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

interface Props extends ImageProps {
  activeVersion: string;
  src?: string;
  alt?: string;
}

export const ImgDocs = ({ src, alt, activeVersion }: Props) => {
  const pathWithoutDotSlash = src?.replace(/^\.\//, "");
  const path = `/docs/${activeVersion}/${pathWithoutDotSlash}`;
  const localPath = `public${path}`;

  console.log("src", src);
  console.log("path", path);
  console.log("localPath", localPath);

  // Check if the file exists
  const fileExists = fs.existsSync(localPath);
  if (!fileExists) return null;

  // Get the dimensions of the image
  const dimensions = sizeOf(localPath);

  if (!dimensions.width || !dimensions.height) return null;

  return (
    <Image
      width={dimensions.width}
      height={dimensions.height}
      className="text-blue-700"
      src={path}
      alt={alt || ""}
    />
  );
};