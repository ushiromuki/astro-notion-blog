/**
 * @file Notionデータモデルの共通インターフェース定義
 * @description Notionのデータモデルを表す共通のインターフェースを定義します。
 * このファイルは、アプリケーション内で使用するNotionデータの型を提供します。
 */

/**
 * 外部リンク情報を表すインターフェース
 */
export interface External {
  Url: string;
}

/**
 * ファイルオブジェクトを表すインターフェース
 */
export interface FileObject {
  Type: 'external' | 'file';
  Url: string;
  ExpiryTime?: string;
}

/**
 * 絵文字情報を表すインターフェース
 */
export interface Emoji {
  Type: 'emoji';
  Emoji: string;
}

/**
 * テキスト情報を表すインターフェース
 */
export interface Text {
  Content: string;
  Link?: Link;
}

/**
 * リンク情報を表すインターフェース
 */
export interface Link {
  Url: string;
}

/**
 * リッチテキストのアノテーション情報を表すインターフェース
 */
export interface Annotation {
  Bold: boolean;
  Italic: boolean;
  Strikethrough: boolean;
  Underline: boolean;
  Code: boolean;
  Color: string;
}

/**
 * リッチテキスト情報を表すインターフェース
 */
export interface RichText {
  Text?: Text;
  Annotation: Annotation;
  PlainText: string;
  Href?: string;
  Equation?: Equation;
  Mention?: Mention;
}

/**
 * 数式情報を表すインターフェース
 */
export interface Equation {
  Expression: string;
}

/**
 * メンション情報を表すインターフェース
 */
export interface Mention {
  Type: 'page' | 'user' | 'database' | 'date' | 'link_preview';
  Page?: Reference;
}

/**
 * 参照情報を表すインターフェース
 */
export interface Reference {
  Id: string;
}

/**
 * 選択プロパティを表すインターフェース
 */
export interface SelectProperty {
  id: string;
  name: string;
  color: string;
}

/**
 * データベース情報を表すインターフェース
 */
export interface Database {
  Title: string;
  Description: string;
  Icon: FileObject | Emoji | null;
  Cover: FileObject | null;
}

/**
 * 投稿情報を表すインターフェース
 */
export interface Post {
  PageId: string;
  Title: string;
  Icon: FileObject | Emoji | null;
  Cover: FileObject | null;
  Slug: string;
  Date?: string;
  Tags?: SelectProperty[];
  Excerpt?: string;
  FeaturedImage?: FileObject | null;
  Rank: number;
}

/**
 * ブロック情報を表すインターフェース
 */
export interface Block {
  Id: string;
  Type: 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' | 'bulleted_list_item' | 'numbered_list_item' | 
        'to_do' | 'image' | 'file' | 'code' | 'quote' | 'equation' | 'callout' | 'synced_block' | 
        'toggle' | 'embed' | 'video' | 'bookmark' | 'link_preview' | 'table' | 'column_list' | 
        'table_of_contents' | 'link_to_page' | 'column' | 'table_row';
  HasChildren: boolean;

  Paragraph?: Paragraph;
  Heading1?: Heading1;
  Heading2?: Heading2;
  Heading3?: Heading3;
  BulletedListItem?: BulletedListItem;
  NumberedListItem?: NumberedListItem;
  ToDo?: ToDo;
  Image?: Image;
  File?: File;
  Code?: Code;
  Quote?: Quote;
  Equation?: Equation;
  Callout?: Callout;
  SyncedBlock?: SyncedBlock;
  Toggle?: Toggle;
  Embed?: { Url: string };
  Video?: Video;
  Bookmark?: { Url: string };
  LinkPreview?: { Url: string };
  Table?: Table;
  ColumnList?: ColumnList;
  TableOfContents?: TableOfContents;
  LinkToPage?: LinkToPage;
}

/**
 * 段落情報を表すインターフェース
 */
export interface Paragraph {
  RichTexts: RichText[];
  Color: string;
  Children?: Block[];
}

/**
 * 見出し1情報を表すインターフェース
 */
export interface Heading1 {
  RichTexts: RichText[];
  Color: string;
  IsToggleable: boolean;
  Children?: Block[];
}

/**
 * 見出し2情報を表すインターフェース
 */
export interface Heading2 {
  RichTexts: RichText[];
  Color: string;
  IsToggleable: boolean;
  Children?: Block[];
}

/**
 * 見出し3情報を表すインターフェース
 */
export interface Heading3 {
  RichTexts: RichText[];
  Color: string;
  IsToggleable: boolean;
  Children?: Block[];
}

/**
 * 箇条書きリストアイテム情報を表すインターフェース
 */
export interface BulletedListItem {
  RichTexts: RichText[];
  Color: string;
  Children?: Block[];
}

/**
 * 番号付きリストアイテム情報を表すインターフェース
 */
export interface NumberedListItem {
  RichTexts: RichText[];
  Color: string;
  Children?: Block[];
}

/**
 * ToDo情報を表すインターフェース
 */
export interface ToDo {
  RichTexts: RichText[];
  Checked: boolean;
  Color: string;
  Children?: Block[];
}

/**
 * 画像情報を表すインターフェース
 */
export interface Image {
  Caption: RichText[];
  Type: 'external' | 'file';
  File?: FileObject;
  External?: External;
  Width?: number;
  Height?: number;
}

/**
 * 動画情報を表すインターフェース
 */
export interface Video {
  Caption: RichText[];
  Type: 'external' | 'file';
  External?: External;
}

/**
 * ファイル情報を表すインターフェース
 */
export interface File {
  Caption: RichText[];
  Type: 'external' | 'file';
  File?: FileObject;
  External?: External;
}

/**
 * コード情報を表すインターフェース
 */
export interface Code {
  Caption: RichText[];
  RichTexts: RichText[];
  Language: string;
}

/**
 * 引用情報を表すインターフェース
 */
export interface Quote {
  RichTexts: RichText[];
  Color: string;
  Children?: Block[];
}

/**
 * コールアウト情報を表すインターフェース
 */
export interface Callout {
  RichTexts: RichText[];
  Icon: FileObject | Emoji | null;
  Color: string;
  Children?: Block[];
}

/**
 * 同期ブロック情報を表すインターフェース
 */
export interface SyncedBlock {
  SyncedFrom: SyncedFrom | null;
  Children?: Block[];
}

/**
 * 同期元情報を表すインターフェース
 */
export interface SyncedFrom {
  BlockId: string;
}

/**
 * トグル情報を表すインターフェース
 */
export interface Toggle {
  RichTexts: RichText[];
  Color: string;
  Children: Block[];
}

/**
 * 埋め込み情報を表すインターフェース
 */
export interface Embed {
  Url: string;
}

/**
 * ブックマーク情報を表すインターフェース
 */
export interface Bookmark {
  Url: string;
}

/**
 * リンクプレビュー情報を表すインターフェース
 */
export interface LinkPreview {
  Url: string;
}

/**
 * テーブル情報を表すインターフェース
 */
export interface Table {
  TableWidth: number;
  HasColumnHeader: boolean;
  HasRowHeader: boolean;
  Rows: TableRow[];
}

/**
 * テーブル行情報を表すインターフェース
 */
export interface TableRow {
  Id: string;
  Type: 'table_row';
  HasChildren: boolean;
  Cells: TableCell[];
}

/**
 * テーブルセル情報を表すインターフェース
 */
export interface TableCell {
  RichTexts: RichText[];
}

/**
 * カラムリスト情報を表すインターフェース
 */
export interface ColumnList {
  Columns: Column[];
}

/**
 * カラム情報を表すインターフェース
 */
export interface Column {
  Id: string;
  Type: 'column';
  HasChildren: boolean;
  Children: Block[];
}

/**
 * リスト情報を表すインターフェース
 */
export interface List {
  Type: 'bulleted_list' | 'numbered_list';
  ListItems: Block[];
}

/**
 * 目次情報を表すインターフェース
 */
export interface TableOfContents {
  Color: string;
}

/**
 * ページリンク情報を表すインターフェース
 */
export interface LinkToPage {
  Type: 'page_id' | 'database_id';
  PageId: string;
} 