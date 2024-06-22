import { Preview } from '../components/preview';
import { buildTagLinks } from '../lib/build-tag-links';
import { fetchHomeData } from '../lib/fetch-home-data';
import { TagList } from '../components/tag-list';
import { PlusIcon, SearchIcon } from '@storybook/icons';

export default async function Home() {
  const {
    popularAddons = [],
    popularRecipes = [],
    trendingTags = [],
    vta,
  } = (await fetchHomeData()) || {};

  const tagLinks = buildTagLinks(trendingTags);

  const categories = [
    { name: 'Popular', href: '/integrations' },
    { name: 'Essential', href: '/integrations/tag/essentials' },
    { name: 'Code', href: '/integrations/tag/essentials' },
    { name: 'Data & State', href: '/integrations/tag/essentials' },
    { name: 'Test', href: '/integrations/tag/essentials' },
    { name: 'Style', href: '/integrations/tag/essentials' },
    { name: 'Design', href: '/integrations/tag/essentials' },
    { name: 'Appearance', href: '/integrations/tag/essentials' },
    { name: 'Organize', href: '/integrations/tag/essentials' },
  ];

  return (
    <>
      <div className="flex items-start justify-between mt-12 mb-8">
        <div>
          <h1 className="mb-4 text-4xl font-bold">Integrations</h1>
          <p>
            Integrate your tools with Storybook to connect workflows and unlock
            advanced features.
          </p>
        </div>
        <a
          href="/docs/react/addons/integration-catalog"
          className="flex items-center flex-shrink-0 h-10 gap-2 px-5 text-white bg-blue-500 rounded-full text-md"
        >
          <PlusIcon />
          Add your integration
        </a>
      </div>

      <div className="flex flex-col gap-12 mb-24 md:flex-row">
        <div className="w-[260px] flex-shrink-0">
          <div className="flex items-center w-full h-10 gap-2 px-5 border rounded-full border-zinc-300">
            <SearchIcon /> Search integrations
          </div>
          <h3 className="mt-12 mb-8 text-2xl font-bold">Categories</h3>
          <div className="flex flex-col gap-2 mt-8">
            {categories.map((category) => (
              <div key={category.name}>{category.name}</div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center h-10">
            <TagList tagLinks={tagLinks} />
          </div>
          <h3 className="mt-12 mb-8 text-2xl font-bold">New to Storybook 8</h3>
          {vta && <Preview key={vta.id} orientation="horizontal" {...vta} />}
          <h3 className="mt-12 mb-8 text-2xl font-bold">Popular addons</h3>
          <div className="grid grid-cols-3 gap-6">
            {popularAddons.map((addon) => (
              <Preview key={addon.id} orientation="vertical" {...addon} />
            ))}
          </div>
          <h3 className="mt-12 mb-8 text-2xl font-bold">Popular recipes</h3>
          <div className="flex flex-col gap-6">
            {popularRecipes.slice(0, 6).map((recipe) => (
              <Preview key={recipe.id} orientation="horizontal" {...recipe} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
