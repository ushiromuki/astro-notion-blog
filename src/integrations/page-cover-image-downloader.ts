import type { AstroIntegration } from 'astro'
import { downloadFile, getAllPosts } from '../lib/notion/client'

export default (): AstroIntegration => ({
  name: 'page-cover-image-downloader',
  hooks: {
    'astro:build:start': async () => {
      console.log('Downloading page cover images...') // メッセージを修正

      const posts = await getAllPosts()

      await Promise.all(
        posts.map((post) => {
          // post.Cover が存在し、かつ Url プロパティを持つことを確認
          if (!post.Cover || !post.Cover.Url) {
            // カバー画像がない場合はスキップ
            // console.log(`No cover image for post: ${post.Title}`) 
            return Promise.resolve()
          }

          let url: URL
          try {
            url = new URL(post.Cover.Url)
          } catch (err) {
            console.error(`Invalid cover image URL for post ${post.Title}: ${post.Cover.Url}`, err)
            return Promise.resolve()
          }

          // console.log(`Downloading cover for ${post.Title}: ${url.toString()}`)
          return downloadFile(url)
        })
      )
      console.log('Finished downloading page cover images.')
    },
  },
})
