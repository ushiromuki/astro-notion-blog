import cloudflare from '@astrojs/cloudflare';
import icon from 'astro-icon';
import { defineConfig, passthroughImageService } from 'astro/config';
import CoverImageDownloader from './src/integrations/cover-image-downloader';
import CustomIconDownloader from './src/integrations/custom-icon-downloader';
import FeaturedImageDownloader from './src/integrations/featured-image-downloader';
import pageCoverImageDownloader from './src/integrations/page-cover-image-downloader';
import PublicNotionCopier from './src/integrations/public-notion-copier';
import { BASE_PATH, CUSTOM_DOMAIN } from './src/server-constants';

import tailwindcss from '@tailwindcss/vite';

const getSite = function () {
  if (CUSTOM_DOMAIN) {
    return new URL(BASE_PATH, `https://${CUSTOM_DOMAIN}`).toString();
  }

  if (process.env.VERCEL && process.env.VERCEL_URL) {
    return new URL(BASE_PATH, `https://${process.env.VERCEL_URL}`).toString();
  }

  if (process.env.CF_PAGES) {
    if (process.env.CF_PAGES_BRANCH !== 'main') {
      return new URL(BASE_PATH, process.env.CF_PAGES_URL).toString();
    }

    return new URL(
      BASE_PATH,
      `https://${new URL(process.env.CF_PAGES_URL).host
        .split('.')
        .slice(1)
        .join('.')}`
    ).toString();
  }

  return new URL(BASE_PATH, 'http://localhost:4321').toString();
};

// https://astro.build/config
export default defineConfig({
  site: getSite(),
  base: BASE_PATH,
  output: "static",

  integrations: [
    icon(),
    CoverImageDownloader(),
    CustomIconDownloader(),
    FeaturedImageDownloader(),
    pageCoverImageDownloader(),
    PublicNotionCopier(),
  ],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: [
        'node:fs',
        'node:stream/promises',
        'stream',
        'url',
        'path',
        'fs',
        'vm',
        'events',
        'util',
        'http',
        'https',
        'zlib',
        'crypto',
        'net',
        'tls',
        'assert',
        'child_process',
        'os'
      ],
      noExternal: ['prismjs', 'katex']
    },
  },
  adapter: cloudflare({
    output: "static",
    imageService: passthroughImageService()
  }),
});