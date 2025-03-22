// Cloudflare Workersでのnode互換性を有効化
export const config = {
  runtime: 'edge',
  nodejs_compat: true
}

import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api'
import type { APIContext } from 'astro'
import { loadGoogleFont } from '../../src/lib/loadGoogleFont'
import { getPostBySlug } from '../../src/lib/notion/client'

const U200D = String.fromCharCode(8205)
const UFE0Fg = /\uFE0F/g

type Font = {
  name: string
  data: ArrayBuffer
  weight: number
  style: string
}

export async function onRequestGet({ request }: APIContext) {
  // WASMファイルの読み込み
  // await initResvg()

  const pathnameMatch = new URL(request.url).pathname.match(
    '.+/(.+?).[a-z]+([?#;].*)?$'
  )
  
  if (!pathnameMatch || !pathnameMatch[1]) {
    return new Response('Invalid URL format', { status: 400 })
  }
  
  const filename = pathnameMatch[1]

  let isPost = false
  let text = 'USRM Blog'
  let emoji = ''

  if (filename !== 'default-og-image') {
    const post = await getPostBySlug(filename)
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

  let svg = null

  // svgの生成
  if (isPost) {
    svg = new ImageResponse(
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
    svg = new ImageResponse(
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
  return svg
}
