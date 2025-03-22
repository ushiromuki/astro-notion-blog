/**
 * コード注釈コンポーネント
 * リッチテキスト内のコード表示のためのスタイリングを提供します
 */
import React from 'react';
import type { RichText } from '../../../lib/interfaces.ts';

export interface CodeProps {
  richText: RichText;
  children: React.ReactNode;
}

const Code: React.FC<CodeProps> = ({ richText, children }) => {
  return (
    <>
      {richText.Annotation.Code ? (
        <code className="text-[#eb5757] p-1">{children}</code>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default Code; 