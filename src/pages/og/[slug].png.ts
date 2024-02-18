export const prerender = false

import type { APIContext } from 'astro'
import { getPostBySlug } from '../../lib/notion/client'
import { Font } from 'satori'
import { loadGoogleFont } from '../../lib/loadGoogleFont'
import { ImageResponse } from '@vercel/og'

const U200D = String.fromCharCode(8205)
const UFE0Fg = /\uFE0F/g

const toCodePoint = (unicodeSurrogates: string) => {
  const r = []
  let c = 0,
    p = 0,
    i = 0

  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i++)
    if (p) {
      r.push((65536 + ((p - 55296) << 10) + (c - 56320)).toString(16))
      p = 0
    } else if (55296 <= c && c <= 56319) {
      p = c
    } else {
      r.push(c.toString(16))
    }
  }
  return r.join('-')
}

const getIconCode = (char: string) => {
  return toCodePoint(char.indexOf(U200D) < 0 ? char.replace(UFE0Fg, '') : char)
}

const apis = {
  twemoji: (code: string) =>
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/' +
    code.toLowerCase() +
    '.svg',
  openmoji: 'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/',
  blobmoji: 'https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/',
  noto: 'https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/',
  fluent: (code: string) =>
    'https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/' +
    code.toLowerCase() +
    '_color.svg',
  fluentFlat: (code: string) =>
    'https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/' +
    code.toLowerCase() +
    '_flat.svg',
}

const emojiCache: Record<string, Promise<any>> = {}

const loadEmoji = (type: keyof typeof apis, code: string) => {
  const key = type + ':' + code
  if (key in emojiCache) return emojiCache[key]

  if (!type || !apis[type]) {
    type = 'twemoji'
  }

  const api = apis[type]
  if (typeof api === 'function') {
    return (emojiCache[key] = fetch(api(code)).then((r) => r.text()))
  }
  return (emojiCache[key] = fetch(`${api}${code.toUpperCase()}.svg`).then((r) =>
    r.text()
  ))
}

export async function GET({ request }: APIContext) {
  // WASMファイルの読み込み
  // await initResvg()

  const filename = new URL(request.url).pathname.match(
    '.+/(.+?).[a-z]+([?#;].*)?$'
  )[1]

  let isPost = false
  let text = 'USRM Blog'
  let emoji = ''

  if (filename !== 'default-og-image') {
    const post = await getPostBySlug(filename)
    text = post?.Title
    emoji = post?.Icon && post?.Icon.Type === 'emoji' ? post?.Icon.Emoji : ''
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
        emoji: 'noto',
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
