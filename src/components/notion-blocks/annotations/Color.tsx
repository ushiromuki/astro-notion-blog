/**
 * カラー注釈コンポーネント
 * リッチテキスト内のカラー表示のためのスタイリングを提供します
 */
import React from 'react';
import type { RichText } from '../../../lib/interfaces.ts';
import { snakeToKebab } from '../../../lib/style-helpers.ts';
import '../../../styles/notion-color.css';

export interface ColorProps {
  richText: RichText;
  children: React.ReactNode;
}

const Color: React.FC<ColorProps> = ({ richText, children }) => {
  return (
    <>
      {richText.Annotation.Color && richText.Annotation.Color !== 'default' ? (
        <span className={snakeToKebab(richText.Annotation.Color)}>{children}</span>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default Color; 