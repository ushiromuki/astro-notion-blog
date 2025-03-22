/**
 * 太字注釈コンポーネント
 * リッチテキスト内の太字表示のためのスタイリングを提供します
 */
import React from 'react';
import type { RichText } from '../../../lib/interfaces.ts';

export interface BoldProps {
  richText: RichText;
  children: React.ReactNode;
}

const Bold: React.FC<BoldProps> = ({ richText, children }) => {
  return (
    <>
      {richText.Annotation.Bold ? (
        <b>{children}</b>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default Bold; 