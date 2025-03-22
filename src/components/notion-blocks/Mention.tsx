/**
 * メンションコンポーネント
 * Notionのリンクメンション機能を表示するコンポーネント
 */
import React from 'react';
import type { RichText } from '../../lib/interfaces.ts';
import '../../styles/notion-color.css';
// @ts-ignore
import arrow from '../../images/icon-arrow-link.svg';

export interface MentionProps {
  richText: RichText;
}

const Mention: React.FC<MentionProps> = ({ richText }) => {
  // クライアントサイドではpostデータを直接取得せず、リンクとして表示するだけにする
  const mentionId = richText?.Mention?.Page?.Id || '';
  
  return (
    <a 
      href={`/posts/${mentionId}`}
      className="inline-flex font-semibold gap-1"
      title="Mentioned page"
    >
      <span className="h-fit flex-shrink-0 relative">
        📄
        <img 
          src={typeof arrow === 'string' ? arrow : arrow.src}
          className="block absolute top-4 right-0 w-2 h-2 icon-link" 
          alt="Arrow icon of a page link" 
        />
      </span>
      <span className="text-[var(--fg)] font-medium underline">
        {richText?.PlainText || 'リンク先のページ'}
      </span>
    </a>
  );
};

export default Mention; 