/**
 * @description OG画像生成用のCloudflare Functions
 * 
 * このスクリプトは、ブログ記事のOG画像を動的に生成します。
 * Honoフレームワークを利用して、URLのスラッグからNotionの記事データを取得し、
 * カスタマイズされたOG画像をレスポンスとして返します。
 * 
 * @returns {Response} 生成されたOG画像のレスポンス
 */

// Node.js互換性フラグを有効化
export const config = {
  runtime: 'edge',
  nodejs_compat: true
}

import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api'
import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

// 定数
const NOTION_API_SECRET = process.env.NOTION_API_SECRET || ''
const DATABASE_ID = process.env.DATABASE_ID || ''

/**
 * Googleフォントをロードしてサブセット化する関数
 * 
 * @param {string} text - サブセット化に使用するテキスト
 * @returns {Promise<ArrayBuffer|null>} フォントデータ
 */
async function loadGoogleFontForFunctions(text: string): Promise<ArrayBuffer | null> {
  try {
    // フォント名
    const fontFamily = 'Noto+Sans+JP'
    // ウェイト指定
    const fontWeight = 700
    
    // GoogleフォントのURL
    const API = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontWeight}&text=${encodeURIComponent(text)}`
    
    // フォントCSSを取得
    const css = await fetch(API, {
      headers: {
        // ブラウザからアクセスしているように見せる
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    }).then((res) => res.text())
    
    // フォントURLを抽出
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!resource) {
      console.error('フォントURLの抽出に失敗しました')
      return null
    }
    
    // フォントバイナリを取得
    const fontRes = await fetch(resource)
    if (!fontRes.ok) {
      console.error(`フォントの取得に失敗しました: ${fontRes.status}`)
      return null
    }
    
    return await fontRes.arrayBuffer()
  } catch (error) {
    console.error('フォントロード中にエラーが発生しました:', error)
    return null
  }
}

/**
 * NotionからPostデータを取得する関数
 * 
 * @param {string} slug - 記事のスラッグ
 * @returns {Promise<{Title?: string, Icon?: {Type: string, Emoji: string}}>} 記事データ
 */
async function getPostBySlugForFunctions(slug: string): Promise<{Title?: string, Icon?: {Type: string, Emoji: string}}> {
  if (!NOTION_API_SECRET || !DATABASE_ID) {
    console.error('環境変数が設定されていません: NOTION_API_SECRET または DATABASE_ID')
    return {}
  }
  
  try {
    // Notionクライアントの初期化
    const notion = new Client({
      auth: NOTION_API_SECRET,
    })
    
    // データベースをクエリ
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slug,
        },
      },
    })
    
    // 該当する記事がなければ空オブジェクトを返す
    if (!response.results.length) {
      return {}
    }
    
    const page = response.results[0] as PageObjectResponse
    
    // タイトルを取得
    let title = ''
    const titleProperty = page.properties.Title
    if (titleProperty && 'title' in titleProperty) {
      title = titleProperty.title.map((t: { plain_text: string }) => t.plain_text).join('')
    }
    
    // アイコン情報を取得
    let icon = undefined
    if (page.icon && 'type' in page.icon && page.icon.type === 'emoji') {
      icon = {
        Type: 'emoji',
        Emoji: page.icon.emoji,
      }
    }
    
    return {
      Title: title,
      Icon: icon,
    }
  } catch (error) {
    console.error('Notionデータ取得中にエラーが発生しました:', error)
    return {}
  }
}

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
app.get(':slug.png', async (c) => {
  // スラッグの取得
  const slug = c.req.param('slug')
  
  if (!slug) {
    return c.text('Invalid URL format', 400)
  }
  
  let isPost = false
  let text = 'USRM Blog'
  let emoji = ''

  if (slug !== 'default-og-image') {
    const post = await getPostBySlugForFunctions(slug)
    text = post?.Title || text // デフォルト値として元の'USRM Blog'を使用
    const postEmoji =
      post?.Icon && post?.Icon.Type === 'emoji' ? post?.Icon.Emoji : ''
    emoji = postEmoji
    isPost = true
  }

  // サブセット済みのフォントデータの読み込み
  const fontData = await loadGoogleFontForFunctions(`${text}${emoji}`)

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

export const onRequest = handle(app)
