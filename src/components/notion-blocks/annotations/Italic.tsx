/**
 * イタリック注釈コンポーネント
 * リッチテキスト内のイタリック表示のためのスタイリングを提供します
 */
import React from 'react';
import type { RichText } from '../../../lib/interfaces.ts';

export interface ItalicProps {
  richText: RichText;
  children: React.ReactNode;
}

const Italic: React.FC<ItalicProps> = ({ richText, children }) => {
  return (
    <>
      {richText.Annotation.Italic ? (
        <i>{children}</i>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default Italic; 