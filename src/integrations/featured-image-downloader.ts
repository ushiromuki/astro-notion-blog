import type { AstroIntegration } from 'astro'
import { getAllPosts, downloadFile } from '../lib/notion/client'
import { chunkArray, wait } from '../lib/utils'

export default (): AstroIntegration => ({
  name: 'featured-image-downloader',
  hooks: {
    'astro:build:start': async () => {
      const posts = await getAllPosts()

      // Download featured images in parallel
      const chunkedPosts = chunkArray(posts, 5)

      // 各チャンクに対して処理を行います
      for (const chunk of chunkedPosts) {
        // console.log('chunk', chunk)
        await Promise.all(
          chunk.map((post) => {
            if (!post.FeaturedImage || !post.FeaturedImage.Url) {
              return Promise.resolve()
            }

            let url!: URL
            try {
              url = new URL(post.FeaturedImage.Url)
            } catch (err) {
              console.log('Invalid FeaturedImage URL')
              return Promise.resolve()
            }

            return downloadFile(url)
          })
        )
        await wait(2000)
      }
    },
  },
})
