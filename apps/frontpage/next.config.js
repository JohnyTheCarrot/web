const generatedRedirects = require('./generated-redirects.json');
const { withPlausibleProxy } = require('next-plausible');

const historicalVersions = [
  '8.1',
  '8.0',
  '7.6',
  '7.5',
  '7.4',
  '7.3',
  '7.2',
  '7.1',
  '7.0',
  '6.5',
  '6.4',
  '6.3',
  '6.2',
  '6.1',
  '6.0',
];

/** @type {import('next').NextConfig} */
module.exports = withPlausibleProxy()({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars3.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars2.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars0.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars1.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.opencollective.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '*.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  async headers() {
    return historicalVersions.map((v) => ({
      source: `/docs/${v}/:path*`,
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex',
        },
      ],
    }));
  },
  // This was added to fix the error with remarkExpressiveCode
  // https://stackoverflow.com/questions/77009138/module-has-no-exports-error-works-fine-on-stackblitz-but-fails-locally
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    return config;
  },
  transpilePackages: ['@repo/ui', '@repo/utils'],
  experimental: {
    /**
     * This ensures that we can read files from these directories when deployed
     * https://vercel.com/guides/how-can-i-use-files-in-serverless-functions#using-next.js
     */
    outputFileTracingIncludes: {
      '/docs/**': ['./content/docs/**', './content/snippets/**'],
    },
  },
  async redirects() {
    return [...generatedRedirects];
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
});
