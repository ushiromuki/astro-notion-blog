/**
 * 打ち消し線注釈コンポーネント
 * リッチテキスト内の打ち消し線表示のためのスタイリングを提供します
 */
import React from 'react';
import type { RichText } from '../../../lib/interfaces.ts';

export interface StrikethroughProps {
  richText: RichText;
  children: React.ReactNode;
}

const Strikethrough: React.FC<StrikethroughProps> = ({ richText, children }) => {
  return (
    <>
      {richText.Annotation.Strikethrough ? (
        <s>{children}</s>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default Strikethrough; 