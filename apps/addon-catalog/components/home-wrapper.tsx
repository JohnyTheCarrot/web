'use client';

import { type ReactNode, useEffect, useState } from 'react';
import {
  BookIcon,
  CloseIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
} from '@storybook/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/utils';
import { fetchSearchData } from '../lib/fetch-search-data';
import type { Addon, TagLinkType } from '../types';
import { SearchResults } from './search-results';
import { TagList } from './tag-list';

interface HomeProps {
  tagLinks?: TagLinkType[];
  children: ReactNode;
}

const categories = [
  { name: 'Popular', href: '/' },
  { name: 'Essential', href: '/tag/essentials' },
  { name: 'Code', href: '/tag/code' },
  { name: 'Data & State', href: '/tag/data-state' },
  { name: 'Test', href: '/tag/test' },
  { name: 'Style', href: '/tag/style' },
  { name: 'Design', href: '/tag/design' },
  { name: 'Appearance', href: '/tag/appearance' },
  { name: 'Organize', href: '/tag/organize' },
];

export const HomeWrapper = ({ tagLinks, children }: HomeProps) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Addon[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);

    const getData = setTimeout(() => {
      if (search.length > 1) {
        void fetchSearchData(search).then((data) => {
          setLoading(false);
          setSearchResults(data);
        });
      }
    }, 600);

    return () => {
      clearTimeout(getData);
    };
  }, [search]);

  return (
    <>
      <div className="flex items-start justify-between mt-12 mb-8">
        <div>
          <h1 className="mb-4 text-4xl font-bold">Integrations</h1>
          <p className="text-black dark:text-slate-400">
            Integrate your tools with Storybook to connect workflows and unlock
            advanced features.
          </p>
        </div>
        <a
          href="/docs/addons/integration-catalog"
          className="items-center flex-shrink-0 hidden h-10 gap-2 px-5 text-sm font-bold text-white bg-blue-500 rounded-full md:flex"
        >
          <PlusIcon />
          Add your integration
        </a>
      </div>
      <div className="mb-24">
        <div className="flex flex-col gap-8 mb-12 md:flex-row md:items-center md:gap-12">
          <div className="relative flex h-10 w-full flex-shrink-0 items-center rounded-full border border-zinc-300 md:w-[250px] dark:border-slate-700">
            <SearchIcon className="absolute left-4 dark:text-slate-500" />
            <input
              className="w-full h-full pl-10 bg-transparent rounded-full placeholder:text-slate-500 dark:placeholder:text-slate-400"
              placeholder="Search integrations"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            {search.length > 0 && (
              <div
                className="absolute flex items-center justify-center -translate-y-1/2 cursor-pointer right-2 top-1/2 h-7 w-7"
                onClick={() => {
                  setSearch('');
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    setSearch('');
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Clear search"
              >
                <CloseIcon />
              </div>
            )}
          </div>
          {tagLinks ? <TagList tagLinks={tagLinks} /> : null}
        </div>
        {search ? (
          <SearchResults
            search={search}
            loading={loading}
            searchResults={searchResults}
          />
        ) : null}
        {!search && (
          <div className="flex flex-col gap-12 md:flex-row">
            <div className="hidden flex-shrink-0 md:block md:w-[250px]">
              <h3 className="mb-6 text-2xl font-bold">Categories</h3>
              <ul className="pb-6 -ml-2 border-b border-b-zinc-300 dark:border-b-slate-700">
                {categories.map(({ name, href }) => (
                  <li key={name}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center px-2 py-[5px] text-sm text-zinc-600 transition-colors hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-500',
                        pathname === href && 'text-blue-500',
                      )}
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4 mt-6">
                <a
                  href="/docs/addons/install-addons"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-500"
                >
                  <BookIcon /> How to install addons
                </a>
                <a
                  href="/docs/addons/writing-addons"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-500"
                >
                  <EditIcon /> Create an addon
                </a>
              </div>
            </div>
            <div className="flex-1">{children}</div>
          </div>
        )}
      </div>
    </>
  );
};
