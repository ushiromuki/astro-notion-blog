import type { AstroIntegration } from 'astro'

export default (): AstroIntegration => ({
  name: 'page-cover-image-downloader',
  hooks: {
    'astro:build:start': async () => {
      // 一時的にダウンロード機能を無効化
      console.log('⚠️ page-cover-image-downloader: Skipping image downloads to avoid network issues');
      
    },
  },
})
