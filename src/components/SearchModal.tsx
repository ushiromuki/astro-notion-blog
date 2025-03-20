/**
 * 検索モーダルコンポーネント
 * サイト内検索のためのモーダルインターフェースを提供します
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface FeedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

const SearchModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [results, setResults] = useState<FeedItem[]>([]);
  const [fetched, setFetched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultListRef = useRef<HTMLUListElement>(null);

  const fetchRSS = useCallback(async () => {
    if (fetched) return;

    try {
      const url = new URL(location.href);
      const port = url.port ? `:${url.port}` : '';
      const res = await fetch(`${url.protocol}//${url.hostname}${port}/feed`);
      
      if (res.status !== 200) {
        console.log(res.status);
        throw new Error('Failed to fetch RSS feed');
      }

      const body = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(body, 'text/xml');
      const items: FeedItem[] = [];

      Array.from(xml.getElementsByTagName('item')).forEach((item) => {
        const title = item.getElementsByTagName('title')[0]?.textContent || '';
        const link = item.getElementsByTagName('link')[0]?.textContent || '';
        const description = item.getElementsByTagName('description')[0]?.textContent || undefined;
        const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || undefined;

        items.push({ title, link, description, pubDate });
      });

      setFeedItems(items);
      setResults(items);
      setFetched(true);
    } catch (error) {
      console.error('Error fetching RSS:', error);
    }
  }, [fetched]);

  const openModal = useCallback(async () => {
    setIsVisible(true);
    setTimeout(() => inputRef.current?.focus(), 0);
    
    if (!fetched) {
      await fetchRSS();
    }
  }, [fetched, fetchRSS]);

  const closeModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const search = useCallback((query: string) => {
    const filtered = feedItems.filter((item) => 
      item.title.includes(query) || item.description?.includes(query)
    );
    return filtered;
  }, [feedItems]);

  const searchAndRender = useCallback(() => {
    const text = inputRef.current?.value.trim() || '';
    
    if (text !== '') {
      const searchResults = search(text);
      setResults(searchResults);
    } else {
      setResults(feedItems);
    }
    
    setSelectedIndex(0);
  }, [feedItems, search]);

  const select = useCallback(() => {
    const selectedItem = results[selectedIndex];
    if (selectedItem?.link) {
      window.location.href = selectedItem.link;
    }
  }, [results, selectedIndex]);

  const selectUp = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    setSelectedIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : results.length - 1
    );
  }, [results.length]);

  const selectDown = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    setSelectedIndex((prevIndex) => 
      prevIndex < results.length - 1 ? prevIndex + 1 : 0
    );
  }, [results.length]);

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (!isVisible) return;
    
    if (e.keyCode === 13) { // Enter
      select();
    } else if (e.keyCode === 27) { // ESC
      closeModal();
    } else if (e.keyCode === 38) { // Up
      e.preventDefault();
      setSelectedIndex((prevIndex) => 
        prevIndex > 0 ? prevIndex - 1 : results.length - 1
      );
    } else if (e.keyCode === 40) { // Down
      e.preventDefault();
      setSelectedIndex((prevIndex) => 
        prevIndex < results.length - 1 ? prevIndex + 1 : 0
      );
    }
  }, [isVisible, results.length, select, closeModal]);

  useEffect(() => {
    const handleClickOpenButton = () => {
      openModal();
    };

    const searchButtons = document.querySelectorAll('.open-search-modal');
    searchButtons.forEach(button => {
      button.addEventListener('click', handleClickOpenButton);
    });

    document.addEventListener('keydown', handleKeydown);

    return () => {
      searchButtons.forEach(button => {
        button.removeEventListener('click', handleClickOpenButton);
      });
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [openModal, handleKeydown]);

  const handleItemMouseOver = (index: number) => {
    setSelectedIndex(index);
  };

  if (!isVisible) return null;

  return (
    <div className="block">
      <div 
        className="fixed top-0 left-0 w-full h-full backdrop-blur-sm bg-opacity-50 z-[99] p-2"
        onClick={closeModal}
      ></div>
      
      <div className="fixed top-0 h-[calc(100%-40px)] overflow-hidden left-[20%] w-[60%] rounded-md bg-[var(--bg)] z-[100] md:w-[60%] md:left-[20%] sm:w-full sm:left-0">
        <div className="my-1.5 px-1.5">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search..." 
            className="w-full border-0 border-transparent p-1.5 bg-[var(--input-bg)] text-[var(--fg)] text-xl leading-6"
            onChange={searchAndRender}
          />
        </div>
        
        <div className="border-t border-[var(--hr-border)] overflow-y-auto max-h-[100%]">
          <ul ref={resultListRef} className="m-0.5 p-0 list-none">
            {results.map((item, index) => (
              <li 
                key={`result-${index}`} 
                className={`${selectedIndex === index ? 'bg-[rgba(241,241,239,1)]' : ''}`}
                onMouseOver={() => handleItemMouseOver(index)}
              >
                <a 
                  href={item.link} 
                  className="block p-2 rounded-[var(--radius)]"
                >
                  <div className="py-0.5 text-[var(--fg)] text-lg leading-5 font-bold">
                    {item.title}
                  </div>
                  <div className="mb-0.5 text-[var(--fg)] text-sm leading-5">
                    {item.description}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchModal; 