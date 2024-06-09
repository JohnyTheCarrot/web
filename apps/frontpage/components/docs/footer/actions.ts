'use server';

import { z } from 'zod';
import dedent from 'dedent';
import fetch from 'node-fetch';

import { headers } from 'next/headers';
import type { TreeProps } from '@repo/utils';
import { docsVersions } from '@repo/utils';
import { generateDocsTree } from '../../../lib/get-tree';
import { language } from 'gray-matter';

export async function sendFeedback(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    feedback: z.string().min(1),
    reaction: z.string(),
    slug: z.string(),
    renderer: z.string(),
    language: z.string(),
    version: z.string(),
  });

  const parse = schema.safeParse({
    slug: formData.get('slug'),
    feedback: formData.get('feedback'),
    reaction: formData.get('reaction'),
    renderer: formData.get('renderer'),
    language: formData.get('language'),
    version: formData.get('version'),
  });

  if (!parse.success) {
    return { message: 'Failed' };
  }

  const data = parse.data;

  const pat = process.env.GITHUB_STORYBOOK_BOT_PAT;
  if (!pat) {
    throw new Error('GITHUB_STORYBOOK_BOT_PAT not found in environment');
  }

  const versions = docsVersions.map(({ id }) => id);

  const slugs = new Set<string>([]);

  function addSlugs(tree: TreeProps[]) {
    tree.forEach((node) => {
      if (node.type === 'directory') {
        addSlugs(node.children!);
      } else {
        slugs.add(node.slug);
      }
    });
  }

  versions.forEach((v) => {
    const tree = generateDocsTree(`content/docs/${v}`);
    addSlugs(tree);
  });

  // TODO: See if this should be used elsewhere
  function buildPathWithVersion(slug: string, overrideVersion: string) {
    const version = overrideVersion; // || (isLatest ? null : versionString);
    const parts = slug.split('/');
    if (version) {
      parts.splice(2, 0, version);
    }
    return parts.join('/');
  }

  // TODO: Use something other than a header?
  // const trickyHeader = process.env.GATSBY_DOCS_FEEDBACK_TRICKY_HEADER;
  // if (!trickyHeader) {
  //   throw new Error(
  //     'GATSBY_DOCS_FEEDBACK_TRICKY_HEADER not found in environment',
  //   );
  // }

  /**
   * Netlify (and Vercel?) doesn't provide a way to determine the deploy context, but we can
   * adjust the value of a custom env var per-context, so we infer the context from that.
   */
  // const isProduction = !trickyHeader.endsWith('-not-prod');
  // const isProduction = true;

  // const { trickyHeaderKey, trickyHeaderValue } =
  //   /^key-(?<trickyHeaderKey>.+)-value-(?<trickyHeaderValue>.+)$/.exec(
  //     trickyHeader,
  //   )?.groups || {};

  const repositoryOwner = 'storybookjs';
  const repositoryName = 'storybook';
  const repositoryId = 'MDEwOlJlcG9zaXRvcnk1NDE3MzU5Mw==';
  // Corresponds to "Documentation feedback" category
  const categoryId = 'DIC_kwDOAzqfmc4CWGpo';

  type Rating = 'up' | 'down';

  function createTitle(path: string) {
    return `Feedback for ${path} docs page`;
  }

  function createRating(upOrDown: Rating, value: number | string) {
    return `<!--start-${upOrDown}-->${value}<!--end-${upOrDown}-->`;
  }

  const ratingSymbols = {
    up: '👍',
    down: '👎',
  };

  function createDiscussionBody(rating: Rating) {
    return [
      `| ${ratingSymbols.up} | ${ratingSymbols.down} |`,
      '| :-: | :-: |',
      `| ${createRating('up', rating === 'up' ? 1 : 0)} | ${createRating('down', rating === 'down' ? 1 : 0)} |`,
    ].join('\r\n');
  }

  function createCommentBody({
    slug,
    version,
    renderer,
    codeLanguage,
    rating,
    comment,
  }: {
    slug: string;
    version: string;
    renderer: string;
    codeLanguage: string;
    rating: Rating;
    comment: string;
  }) {
    const path = buildPathWithVersion(slug, version);
    const link = `**[${path}](https://storybook.js.org${path})**`;

    const meta = [
      `| ${ratingSymbols[rating]} | v${version} | ${renderer} | ${codeLanguage} |`,
      '| - | - | - | - |',
    ].join('\r\n');

    return [link, meta, comment]
      .filter((block) => Boolean(block))
      .join('\r\n\r\n');
  }

  function updateRating(body: string, rating: Rating) {
    const regex = new RegExp(createRating(rating, '(\\d+)'));
    const currentRating = body.match(regex)?.[1];
    if (!currentRating) {
      throw new Error(`
  Could not find current ${rating} rating in:
  "${body}"
      `);
    }

    return body.replace(
      regex,
      createRating(rating, parseInt(currentRating, 10) + 1),
    );
  }

  async function queryGitHub<D extends object>(
    query: string,
    { variables = {} } = {},
  ): Promise<D> {
    let response;
    try {
      response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(pat && {
            Authorization: `bearer ${pat}`,
            'User-Agent': 'storybook-bot',
          }),
        },
        body: JSON.stringify({ query, variables }),
      });

      if (response) {
        const { data, errors } = (await response.json()) as {
          data: D;
          errors: Error[];
        };
        if (!errors || errors.length === 0) {
          return data;
        }
        throw new Error(errors.map((error) => error.message).join('\n'));
      }
      throw new Error('No response');
    } catch (error) {
      throw new Error(
        [
          'Failed to fetch GitHub query',
          `Response: ${JSON.stringify(response, null, 2)}`,
          `Error: ${JSON.stringify(error, null, 2)}`,
          `Query: {${query}`,
          `variables: ${JSON.stringify(variables, null, 2)}`,
        ].join('\n'),
      );
    }
  }

  interface Discussion {
    body: string;
    closed: boolean;
    id: string;
    number: number;
    title: string;
    url: string;
  }

  type PartialDiscussion = Pick<
    Discussion,
    'title' | 'id' | 'number' | 'closed'
  >;

  async function getDiscussion(title: string) {
    console.info('Fetching discussions...');
    let discussions: PartialDiscussion[] = [];
    let after;
    do {
      const {
        repository: {
          discussions: {
            nodes: newDiscussions,
            // @ts-expect-error - The type of `pageInfo` is correct. And the types of these two properties are correct later. WTF?
            pageInfo: { hasNextPage, endCursor },
          },
        },
        // eslint-disable-next-line no-await-in-loop -- This is node; we can deal with it
      } = await queryGitHub<{
        repository: {
          discussions: {
            nodes: PartialDiscussion[];
            pageInfo: { hasNextPage: boolean; endCursor: string };
          };
        };
      }>(
        dedent(`
        query GetDiscussions($owner: String!, $name: String!, $after: String, $categoryId: ID!) {
          repository(owner: $owner, name: $name) {
            discussions(first: 100, after: $after, categoryId: $categoryId) {
              nodes {
                title
                id
                number
                closed
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `),
        {
          variables: {
            owner: repositoryOwner,
            name: repositoryName,
            after,
            categoryId,
          },
        },
      );

      discussions = discussions.concat(newDiscussions);

      after = hasNextPage ? endCursor : undefined;
    } while (after);
    console.info('... done!');

    return discussions.find((discussion) => discussion.title === title);
  }

  async function updateDiscussion({
    number,
    id,
    rating,
  }: Pick<Discussion, 'id' | 'number'> & { rating: Rating }) {
    const {
      repository: {
        discussion: { body: currentBody },
      },
    } = await queryGitHub<{
      repository: {
        discussion: {
          body: string;
        };
      };
    }>(
      dedent(`
        query GetDiscussion($owner: String!, $name: String!, $number: Int!) {
          repository(owner: $owner, name: $name) {
            discussion(number: $number) {
              body
            }
          }
        }
      `),
      {
        variables: {
          owner: repositoryOwner,
          name: repositoryName,
          number,
        },
      },
    );

    console.info('Updating discussion with new rating...');
    const {
      updateDiscussion: {
        discussion: { body: updatedBody },
      },
    } = await queryGitHub<{
      updateDiscussion: {
        discussion: {
          body: string;
        };
      };
    }>(
      dedent(`
        mutation UpdateDiscussion($discussionId: ID!, $body: String!) { 
          updateDiscussion(input: {
            discussionId: $discussionId,
            body: $body,
          }) {
            discussion {
              body
            }
          }
        }
      `),
      {
        variables: {
          discussionId: id,
          body: updateRating(currentBody, rating),
        },
      },
    );
    console.info('... done!', 'Updated body:\n', updatedBody);
  }

  async function reOpenDiscussion({ id }: Pick<Discussion, 'id'>) {
    console.info('Re-opening discussion...');
    await queryGitHub(
      dedent(`
        mutation ReopenDiscussion($discussionId: ID!) {
          reopenDiscussion(input: {
            discussionId: $discussionId
          }) {
            discussion {
              closed
            }
          }
        }
      `),
      {
        variables: {
          discussionId: id,
          closed: false,
        },
      },
    );
    console.info('... done!');
  }

  async function addDiscussionComment({
    id,
    slug,
    version,
    renderer,
    codeLanguage,
    rating,
    comment,
  }: Pick<Discussion, 'id'> & {
    slug: string;
    version: string;
    renderer: string;
    codeLanguage: string;
    rating: Rating;
    comment: string;
  }) {
    console.info('Adding comment to discussion...');
    const {
      addDiscussionComment: {
        comment: { body: addedComment, url },
      },
    } = await queryGitHub<{
      addDiscussionComment: {
        comment: {
          body: string;
          url: string;
        };
      };
    }>(
      dedent(`
        mutation AddDiscussionComment($discussionId: ID!, $body: String!) {
          addDiscussionComment(input: {
            discussionId: $discussionId,
            body: $body,
          }) {
            comment {
              body
              url
            }
          }
        }
      `),
      {
        variables: {
          discussionId: id,
          body: createCommentBody({
            slug,
            version,
            renderer,
            codeLanguage,
            rating,
            comment,
          }),
        },
      },
    );
    console.info('... done!, Added comment:', '\n', url, '\n', addedComment);
    return url;
  }

  async function createDiscussion({
    path,
    rating,
    title,
  }: Pick<Discussion, 'title'> & {
    path: string;
    rating: Rating;
  }): Promise<PartialDiscussion> {
    console.info(`Creating new discussion for ${path}...`);
    const {
      createDiscussion: {
        discussion: {
          title: addedTitle,
          id,
          number,
          closed,
          body: addedBody,
          url,
        },
      },
    } = await queryGitHub<{
      createDiscussion: {
        discussion: Discussion;
      };
    }>(
      dedent(`
        mutation CreateDiscussion($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) { 
          createDiscussion(input: {
            repositoryId: $repositoryId,
            categoryId: $categoryId,
            title: $title,
            body: $body
          }) {
            discussion {
              title
              id
              number
              closed
              body
              url
            }
          }
        }
      `),
      {
        variables: {
          repositoryId,
          categoryId,
          title,
          body: createDiscussionBody(rating),
        },
      },
    );
    console.info(
      '... done!, Added discussion:',
      '\n',
      url,
      '\n',
      addedTitle,
      '\n',
      addedBody,
    );

    return {
      title,
      id,
      number,
      closed,
    };
  }

  const requestsCache: Record<string, number> = {};

  // Beginning submit feedback

  const slug = data.slug;
  const version = data.version;
  const renderer = data.renderer;
  const codeLanguage = data.language;
  const rating = data.reaction as Rating;
  const comment = data.feedback;
  // const spuriousComment = '';

  const now = Date.now();

  const headersList = headers();

  try {
    const ip =
      headersList.get('x-real-ip') ||
      headersList.get('x-forwarded-for') ||
      'unknown';
    if (requestsCache[ip] && now - requestsCache[ip] < 1000) {
      throw new Error(`Too many requests from ${ip}, ignoring`);
    }
    requestsCache[ip] = now;

    const path = slug.replace('/docs', '');

    // const hasValidTrickyHeader =
    //   headersList.get(trickyHeaderKey) === trickyHeaderValue;
    // const hasValidOrigin = isProduction
    //   ? headersList.get('origin') === siteUrl
    //   : true;
    // const hasValidReferer = headersList.get('referer')?.endsWith(path);

    // if (
    //   !hasValidTrickyHeader ||
    //   !hasValidOrigin ||
    //   !hasValidReferer ||
    //   spuriousComment
    // ) {
    //   console.info(
    //     JSON.stringify(
    //       {
    //         hasValidTrickyHeader,
    //         hasValidOrigin,
    //         siteUrl,
    //         hasValidReferer,
    //         path,
    //         headers,
    //       },
    //       null,
    //       2,
    //     ),
    //   );
    //   throw new Error('Invalid request, ignoring');
    // }

    // const hasValidSlug = slugs.has(slug);
    // const hasValidVersion = versions.includes(version);
    // const hasValidRating =
    //   rating && Object.keys(ratingSymbols).includes(rating);

    // if (!hasValidVersion || !hasValidRating) {
    //   console.info(
    //     JSON.stringify(
    //       {
    //         renderer,
    //         hasValidSlug,
    //         slug,
    //         hasValidVersion,
    //         version,
    //         hasValidRating,
    //         rating,
    //       },
    //       null,
    //       2,
    //     ),
    //   );
    //   throw new Error('Invalid data, ignoring');
    // }

    const title = createTitle(path);

    let currentDiscussion = await getDiscussion(title);

    if (currentDiscussion) {
      console.info(`Found discussion for ${path}`);

      await updateDiscussion({ ...currentDiscussion, rating });
    } else {
      currentDiscussion = await createDiscussion({ path, rating, title });
    }

    if (comment && currentDiscussion.closed) {
      console.info('Discussion is closed');
      await reOpenDiscussion(currentDiscussion);
    }

    const url = await addDiscussionComment({
      ...currentDiscussion,
      slug,
      version,
      renderer,
      codeLanguage,
      rating,
      comment,
    });

    return {
      message: 'ok',
      url,
    };
  } catch (error) {
    return { message: 'fail' };
    // throw new Error((error as Error).message);
  }
}
