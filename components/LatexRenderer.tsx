
import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    katex: any;
  }
}

interface LatexRendererProps {
  text: string;
  block?: boolean;
  className?: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ text, block = false, className = '' }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if KaTeX is loaded
    if (window.katex) {
        setIsReady(true);
    } else {
        const interval = setInterval(() => {
            if (window.katex) {
                setIsReady(true);
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }
  }, []);

  // Guard against non-string input to prevent crashes
  if (typeof text !== 'string') return null;

  if (!isReady) return <span className={className}>{text}</span>;

  // Block Rendering (Forces Display Mode for the whole string)
  if (block) {
    // Robustly strip delimiters ($$, $, \[, \]) from start and end
    let cleanContent = text.trim();
    
    // Strip leading delimiters
    cleanContent = cleanContent.replace(/^(\$\$|\\\[|\$)/, '');
    
    // Strip trailing delimiters
    cleanContent = cleanContent.replace(/(\$\$|\\\]|\$)$/, '');
    
    cleanContent = cleanContent.trim();

    try {
      const html = window.katex.renderToString(cleanContent, {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
      return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (e) {
      return <div className={className}>{text}</div>;
    }
  }

  // Inline/Mixed Rendering (Parses string for delimiters)
  // Split by delimiters: $$...$$, \[...\], \(...\), $...$
  const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<!\\)\$(?:\\.|[^\\])*?(?<!\\)\$)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if part is a math segment
        if (part.match(/^(\$\$|\\\[)/)) {
          // Display Mode Delimiters
          const content = part.replace(/^(\$\$|\\\[)|(\$\$|\\\])$/g, '');
          try {
            const html = window.katex.renderToString(content, { displayMode: true, throwOnError: false, strict: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch { return <span key={index}>{part}</span>; }
        } 
        else if (part.match(/^(\$|\\\()/)) {
          // Inline Mode Delimiters
          const content = part.replace(/^(\$|\\\()|(\$|\\\))$/g, '');
          try {
            const html = window.katex.renderToString(content, { displayMode: false, throwOnError: false, strict: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch { return <span key={index}>{part}</span>; }
        } 
        else {
          // Text content
          return <span key={index}>{part}</span>;
        }
      })}
    </span>
  );
};

export default LatexRenderer;
