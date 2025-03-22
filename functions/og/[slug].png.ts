
import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api'
import { Hono } from 'hono'
import { loadGoogleFont } from '../../src/lib/loadGoogleFont'
import { getPostBySlug } from '../../src/lib/notion/client'

/**
 * @description OG画像生成用のCloudflare Functions
 * 
 * このスクリプトは、ブログ記事のOG画像を動的に生成します。
 * Honoフレームワークを利用して、URLのスラッグからNotionの記事データを取得し、
 * カスタマイズされたOG画像をレスポンスとして返します。
 * 
 * @returns {Response} 生成されたOG画像のレスポンス
 */

const U200D = String.fromCharCode(8205)
const UFE0Fg = /\uFE0F/g

type Font = {
  name: string
  data: ArrayBuffer
  weight: number
  style: string
}

// Honoアプリケーションの作成
const app = new Hono()

// OG画像生成用のルートハンドラー
app.get('/:slug.png', async (c) => {
  // スラッグの取得
  const slug = c.req.param('slug')
  
  if (!slug) {
    return c.text('Invalid URL format', 400)
  }
  
  let isPost = false
  let text = 'USRM Blog'
  let emoji = ''

  if (slug !== 'default-og-image') {
    const post = await getPostBySlug(slug)
    text = post?.Title || text // デフォルト値として元の'USRM Blog'を使用
    const postEmoji =
      post?.Icon && post?.Icon.Type === 'emoji' ? post?.Icon.Emoji : ''
    emoji = postEmoji
    isPost = true
  }

  // サブセット済みのフォントデータの読み込み
  const fontData = await loadGoogleFont(`${text}${emoji}`).then((resp) =>
    resp?.arrayBuffer()
  )

  const fonts: Font[] = []
  if (fontData) {
    fonts.push({
      name: 'NotoSansJapanese',
      data: fontData,
      weight: 700,
      style: 'normal',
    })
  }

  // OG画像の生成
  let ogImage = null

  if (isPost) {
    ogImage = new ImageResponse(
      {
        type: 'div',
        props: {
          children: [
            {
              type: 'div',
              props: {
                children: [
                  {
                    type: 'h1',
                    props: {
                      children: `${emoji}`,
                      style: {
                        marginBottom: 0,
                      },
                    },
                  },
                  {
                    type: 'h3',
                    props: {
                      children: `${text}`,
                    },
                  },
                ],
                style: {
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  fontSize: 32,
                  backgroundColor: '#fafafa',
                  borderRadius: '16px',
                },
              },
              key: 'innerDiv',
            },
          ],
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            color: '#413838',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: '#FA8BFF',
            backgroundImage:
              'linear-gradient(45deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
          },
        },
      },
      {
        width: 1200,
        height: 630,
        fonts,
        emoji: 'fluent',
      }
    )
  } else {
    ogImage = new ImageResponse(
      {
        type: 'div',
        props: {
          children: [
            {
              type: 'div',
              props: {
                children: [
                  {
                    type: 'h1',
                    props: {
                      children: `${text}`,
                    },
                  },
                ],
                style: {
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  backgroundColor: '#fafafa',
                  borderRadius: '16px',
                },
              },
            },
          ],
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            color: '#413838',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: '#FA8BFF',
            backgroundImage:
              'linear-gradient(45deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
          },
        },
      },
      {
        width: 1200,
        height: 630,
        fonts,
      }
    )
  }

  // pngデータを返す
  return new Response(ogImage.body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600',
    },
  })
})

export default app
