/**
 * アンカー注釈コンポーネント
 * リッチテキスト内のリンクのためのスタイリングを提供します
 */
import React from 'react';
import type { RichText } from '../../../lib/interfaces.ts';

export interface AnchorProps {
  richText: RichText;
  children: React.ReactNode;
}

const Anchor: React.FC<AnchorProps> = ({ richText, children }) => {
  return (
    <>
      {richText.Href && !richText.Mention ? (
        <a href={richText.Href} className="underline">{children}</a>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default Anchor; 