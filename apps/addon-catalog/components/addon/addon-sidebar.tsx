'use client';

import { BookIcon, EditIcon } from '@storybook/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function AddonSidebar({ addon }: { addon: Addon }) {
  const [moreAuthorsVisible, setMoreAuthorsVisible] = useState(false);
  const authors = addon?.authors || [];
  const moreAuthors = authors.slice(6);

  return (
    <div className="flex-shrink-0 md:w-[250px]">
      <div className="mb-4 flex items-center py-2 text-sm font-bold">
        Made by
      </div>
      <ul className="mb-6 flex flex-col gap-4">
        {authors.slice(0, 6).map((author) => (
          <li className="flex items-center gap-2" key={author.username}>
            {author.gravatarUrl && (
              <div className="relative h-7 w-7 overflow-hidden rounded-full">
                <Image
                  src={`https:${author.gravatarUrl}`}
                  alt={author.username}
                  fill={true}
                />
              </div>
            )}
            {author.username}
          </li>
        ))}
        {moreAuthorsVisible &&
          moreAuthors.map((author) => (
            <li className="flex items-center gap-2" key={author.username}>
              {author.gravatarUrl && (
                <div className="relative h-7 w-7 overflow-hidden rounded-full">
                  <Image
                    src={`https:${author.gravatarUrl}`}
                    alt={author.username}
                    fill={true}
                  />
                </div>
              )}
              {author.username}
            </li>
          ))}
      </ul>
      {moreAuthors.length > 0 && !moreAuthorsVisible && (
        <button
          onClick={() => {
            setMoreAuthorsVisible(true);
          }}
          type="button"
          className="flex text-sm transition-colors hover:text-blue-500"
        >
          {`+ ${moreAuthors.length} more`}
        </button>
      )}
      <div className="mt-6 flex flex-col gap-4 border-t border-t-zinc-300 pt-6 dark:border-t-slate-700">
        <Link
          href="/docs/addons/install-addons"
          className="flex items-center gap-2 text-sm transition-colors hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-500"
        >
          <BookIcon /> How to install addons
        </Link>
        <Link
          href="/docs/addons/writing-addons"
          className="flex items-center gap-2 text-sm transition-colors hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-500"
        >
          <EditIcon /> Create an addon
        </Link>
      </div>
    </div>
  );
}
