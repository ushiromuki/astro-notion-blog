/**
 * @file インターフェース再エクスポートファイル
 * @description このファイルは既存のコードの互換性を維持するため、
 * Notionのデータモデルを定義している`./notion/model.ts`からすべてのインターフェースを再エクスポートします。
 */

import type { RichText } from './notion/model';

export * from './notion/model';

export interface Embed {
  Url: string
  Caption?: RichText[]
}
