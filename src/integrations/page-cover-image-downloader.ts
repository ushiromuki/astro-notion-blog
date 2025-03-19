import type { AstroIntegration } from 'astro'
import { downloadFile, getAllPosts } from '../lib/notion/client'
import { chunkArray, wait } from '../lib/utils'

export default (): AstroIntegration => ({
  name: 'page-cover-image-downloader',
  hooks: {
    'astro:build:start': async () => {
      const posts = await getAllPosts()

      // Download featured images in parallel
      const chunkedPosts = chunkArray(posts, 5)

      for (const chunk of chunkedPosts) {
        await Promise.all(
          chunk.map((post) => {
            if (!post.Cover || !post.Cover.Url) {
              return Promise.resolve()
            }
            if (post.Cover.Type !== 'file') {
              return Promise.resolve()
            }

            let url!: URL
            try {
              url = new URL(post.Cover.Url)
            } catch (err) {
              console.log('Invalid PageCoverImage URL')
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
