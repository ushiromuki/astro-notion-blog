/**
 * 下線注釈コンポーネント
 * リッチテキスト内の下線表示のためのスタイリングを提供します
 */
import React from 'react';
import type { RichText } from '../../../lib/interfaces.ts';

export interface UnderlineProps {
  richText: RichText;
  children: React.ReactNode;
}

const Underline: React.FC<UnderlineProps> = ({ richText, children }) => {
  return (
    <>
      {richText.Annotation.Underline ? (
        <u>{children}</u>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default Underline; 