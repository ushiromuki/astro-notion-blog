import React, { useEffect, useRef, useState } from 'react';
import type * as interfaces from '../../lib/interfaces';

/**
 * ブラウザ環境かどうかを判定する関数
 * @returns {boolean} ブラウザ環境ならtrue、そうでなければfalse
 */
const isBrowser = () => typeof window !== 'undefined';

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
  const [highlightedCode, setHighlightedCode] = useState<string>(code);
  const [isPrismLoaded, setIsPrismLoaded] = useState<boolean>(false);
  
  const mermaidRef = useRef<HTMLPreElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  // Prismのインポートとハイライト処理の初期化
  useEffect(() => {
    if (!isBrowser()) return;

    // Prismを動的にインポート
    const loadPrism = async () => {
      try {
        const Prism = await import('prismjs');
        
        // 言語コンポーネントを動的にインポート
        await Promise.all([
          // @ts-ignore
          import('prismjs/components/prism-css'),
          // @ts-ignore
          import('prismjs/components/prism-diff'),
          // @ts-ignore
          import('prismjs/components/prism-docker'),
          // @ts-ignore
          import('prismjs/components/prism-elixir'),
          // @ts-ignore
          import('prismjs/components/prism-go'),
          // @ts-ignore
          import('prismjs/components/prism-hcl'),
          // @ts-ignore
          import('prismjs/components/prism-java'),
          // @ts-ignore
          import('prismjs/components/prism-json'),
          // @ts-ignore
          import('prismjs/components/prism-python'),
          // @ts-ignore
          import('prismjs/components/prism-ruby'),
          // @ts-ignore
          import('prismjs/components/prism-sql'),
          // @ts-ignore
          import('prismjs/components/prism-typescript'),
          // @ts-ignore
          import('prismjs/components/prism-yaml')
        ]);
        
        // デフォルトのグラマーを設定
        let grammar = Prism.default.languages.javascript;
        
        // 言語に応じたグラマーを使用
        if (Prism.default.languages[language]) {
          grammar = Prism.default.languages[language];
        }
        
        // コードをハイライト
        const highlighted = Prism.default.highlight(code, grammar, language);
        setHighlightedCode(highlighted);
        setIsPrismLoaded(true);
      } catch (error) {
        console.error('Prism load error:', error);
        setHighlightedCode(code); // エラーが発生した場合は元のコードを表示
      }
    };

    loadPrism();
  }, [code, language]);

  // Mermaidの初期化
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (!isBrowser()) return;
    
    if (language === 'mermaid' && mermaidRef.current) {
      // 動的インポートを使用してMermaidをロード
      const loadMermaid = async () => {
        try {
          // 絶対パスでインポートを試みる（ヌルバイト問題を回避）
          const mermaidModule = await import('mermaid/dist/mermaid.js');
          const mermaid = mermaidModule.default || mermaidModule;
          
          if (mermaid && typeof mermaid.initialize === 'function') {
            mermaid.initialize({ 
              startOnLoad: true, 
              theme: 'neutral',
              securityLevel: 'loose'
            });
            
            if (typeof mermaid.run === 'function') {
              mermaid.run();
            }
          }
        } catch (error) {
          console.error('Mermaid load error:', error);
          
          // Fallback - 直接コードを表示
          if (mermaidRef.current) {
            mermaidRef.current.textContent = code;
          }
        }
      };
      
      loadMermaid();
    }
  }, [language, code]);

  // コピーボタンの設定
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (!isBrowser()) return;
    
    const copyButton = copyButtonRef.current;
    if (!copyButton) return;

    const handleClick = () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const originalText = copyButton.innerText;
          copyButton.innerText = copyButton.getAttribute('data-done-text') || 'Copied!';
          setTimeout(() => {
            if (copyButton) {
              copyButton.innerText = originalText;
            }
          }, 3000);
        }).catch(error => {
          console.error('Copy error:', error);
        });
      }
    };

    copyButton.addEventListener('click', handleClick);
    return () => {
      copyButton.removeEventListener('click', handleClick);
    };
  }, [code]);

  // サーバーサイドレンダリング時はシンプルな表示を返す
  if (!isBrowser()) {
    return (
      <div className="w-full mb-2">
        <div className="bg-[#f7f6f3] rounded">
          <pre className="block overflow-auto px-8 py-8 text-sm leading-[1.2rem] whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  }

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
              {isPrismLoaded ? (
                <code 
                  className="text-[var(--fg)] p-0 bg-[#f7f6f3] rounded-none"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }} 
                />
              ) : (
                <code className="text-[var(--fg)] p-0 bg-[#f7f6f3] rounded-none">
                  {code}
                </code>
              )}
            </pre>
          </>
        )}
      </div>
      <Caption richTexts={block.Code?.Caption || []} />
    </div>
  );
};

export default Code; 