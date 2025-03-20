import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-elixir';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-hcl';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';
import React, { useEffect, useRef } from 'react';
import type * as interfaces from '../../lib/interfaces';

interface CodeProps {
  block: interfaces.Block;
}

/**
 * Captionコンポーネント
 */
const Caption: React.FC<{ richTexts: interfaces.RichText[] }> = ({ richTexts }) => {
  if (!richTexts || richTexts.length === 0) {
    return null;
  }

  return (
    <div className="text-sm px-8 pb-6">
      {richTexts.map((richText, index) => {
        const textContent = richText.Text?.Content || '';
        const isLink = !!richText.Text?.Link;
        
        if (isLink) {
          return (
            <a 
              key={`caption-${index}`}
              href={richText.Text?.Link?.Url} 
              className={`
                ${richText.Annotation.Bold ? 'font-bold' : ''}
                ${richText.Annotation.Italic ? 'italic' : ''}
                ${richText.Annotation.Strikethrough ? 'line-through' : ''}
                ${richText.Annotation.Underline ? 'underline' : ''}
                ${richText.Annotation.Code ? 'font-mono bg-gray-100 rounded px-1' : ''}
              `}
            >
              {textContent}
            </a>
          );
        }
        
        return (
          <span 
            key={`caption-${index}`}
            className={`
              ${richText.Annotation.Bold ? 'font-bold' : ''}
              ${richText.Annotation.Italic ? 'italic' : ''}
              ${richText.Annotation.Strikethrough ? 'line-through' : ''}
              ${richText.Annotation.Underline ? 'underline' : ''}
              ${richText.Annotation.Code ? 'font-mono bg-gray-100 rounded px-1' : ''}
            `}
          >
            {textContent}
          </span>
        );
      })}
    </div>
  );
};

/**
 * コードブロックを表示するReactコンポーネント
 */
const Code: React.FC<CodeProps> = ({ block }) => {
  const code = block.Code?.RichTexts.map(
    (richText: interfaces.RichText) => richText.Text?.Content || ''
  ).join('') || '';
  
  const language = block.Code?.Language.toLowerCase() || '';
  const grammar = Prism.languages[language.toLowerCase()] || Prism.languages.javascript;
  
  const mermaidRef = useRef<HTMLPreElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  // Mermaidの初期化
  useEffect(() => {
    if (language === 'mermaid' && mermaidRef.current) {
      import('mermaid').then((mermaid) => {
        mermaid.default.initialize({ 
          startOnLoad: true, 
          theme: 'neutral' 
        });
        mermaid.default.run();
      });
    }
  }, [language]);

  // コピーボタンの設定
  useEffect(() => {
    const copyButton = copyButtonRef.current;
    if (!copyButton) return;

    const handleClick = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const originalText = copyButton.innerText;
          copyButton.innerText = copyButton.getAttribute('data-done-text') || 'Copied!';
          setTimeout(() => {
            if (copyButton) {
              copyButton.innerText = originalText;
            }
          }, 3000);
        });
      }
    };

    copyButton.addEventListener('click', handleClick);
    return () => {
      copyButton.removeEventListener('click', handleClick);
    };
  }, [code]);

  return (
    <div className="w-full mb-2">
      <div className="bg-[#f7f6f3] rounded">
        {language === 'mermaid' ? (
          <pre ref={mermaidRef} className="mermaid p-8">
            {code}
          </pre>
        ) : (
          <>
            <div className="flex justify-end">
              <button 
                ref={copyButtonRef} 
                className="w-16 border-0 rounded bg-[rgba(227,226,224,0.5)] text-[var(--fg)] leading-[1.2rem] cursor-pointer" 
                data-code={code} 
                data-done-text="Copied!"
              >
                Copy
              </button>
            </div>
            <pre className="block overflow-auto px-8 pt-2 pb-8 text-sm leading-[1.2rem] whitespace-pre w-[100px] min-w-full overflow-x-auto">
              <code 
                className="text-[var(--fg)] p-0 bg-[#f7f6f3] rounded-none"
                dangerouslySetInnerHTML={{ 
                  __html: Prism.highlight(code, grammar, language) 
                }} 
              />
            </pre>
          </>
        )}
      </div>
      <Caption richTexts={block.Code?.Caption || []} />
    </div>
  );
};

export default Code; 