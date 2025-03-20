/**
 * 検索ボタンコンポーネント
 * ユーザーが検索モーダルを開くためのボタンを提供します
 */
import React, { useEffect } from 'react';

const SearchButton: React.FC = () => {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.keyCode === 75 && event.metaKey) {
        // Ctrl+K or Cmd+K
        const button = document.querySelector('.open-search-modal') as HTMLElement;
        if (button) button.click();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <button 
      className="flex justify-self-end flex-none ml-auto mb-2 bg-transparent py-1.5 px-1.5 text-[var(--accents-1)] 
                text-[0.95rem] font-bold border-b-2 border-dotted border-[var(--accents-1)] open-search-modal"
      type="button"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-5 h-5 mr-0.5 text-[var(--accents-1)]"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span></span>
    </button>
  );
};

export default SearchButton; 