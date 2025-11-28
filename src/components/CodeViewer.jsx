import React, { useRef } from 'react';

export const CodeViewer = ({ code, highlightedLine, stepType, showTitle = true, fileName, algorithmName }) => {
  const codeRef = useRef(null);
  const highlightedRef = useRef(null);

  const renderCodeLine = (item, idx) => {
    const isHighlighted = highlightedLine === item.line;
    const isEmpty = !item.code || item.code.trim() === '';
    
    // Syntax highlighting for keywords
    const renderSyntax = (line) => {
      const keywords = ['int', 'const', 'string', 'for', 'if', 'return', 'while'];
      const types = ['tnode', 'root'];
      const operators = ['->', '!=', '++', '+=', '='];
      
      let parts = [{ text: line, type: 'normal' }];
      
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        parts = parts.flatMap(p => {
          if (p.type !== 'normal') return [p];
          const matches = [...p.text.matchAll(regex)];
          if (matches.length === 0) return [p];
          
          const result = [];
          let lastIndex = 0;
          matches.forEach(match => {
            if (match.index > lastIndex) {
              result.push({ text: p.text.substring(lastIndex, match.index), type: 'normal' });
            }
            result.push({ text: match[0], type: 'keyword' });
            lastIndex = match.index + match[0].length;
          });
          if (lastIndex < p.text.length) {
            result.push({ text: p.text.substring(lastIndex), type: 'normal' });
          }
          return result;
        });
      });
      
      return parts.map((part, i) => {
        if (part.type === 'keyword') {
          return <span key={i} className="text-purple-400">{part.text}</span>;
        }
        if (part.text.includes('//')) {
          const [code, comment] = part.text.split('//');
          return (
            <span key={i}>
              {code}
              <span className="text-green-400">//{comment}</span>
            </span>
          );
        }
        return <span key={i}>{part.text}</span>;
      });
    };

    return (
      <div
        key={idx}
        ref={isHighlighted ? highlightedRef : null}
        className={`flex ${
          isHighlighted 
            ? 'bg-blue-900/60 border-l-4 border-blue-400 text-blue-50 shadow-lg' 
            : isEmpty
            ? 'text-gray-600'
            : 'text-gray-300 hover:bg-gray-800/50'
        } px-3 py-0 transition-all duration-200`}
      >
        <span className={`mr-4 w-8 text-right select-none ${
          isHighlighted ? 'text-blue-300 font-bold' : 'text-gray-500'
        }`}>
          {item.line}
        </span>
        <span className="flex-1 font-mono text-sm whitespace-pre leading-tight">
          {isEmpty ? '\u00A0' : renderSyntax(item.code)}
        </span>
        {isHighlighted && (
          <span className="ml-3 text-blue-400 animate-pulse flex items-center">
            <span className="mr-1">●</span>
            <span className="text-xs">executing</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-xl flex flex-col h-full"
      onWheel={(e) => {
        const codeElement = codeRef.current;
        if (!codeElement) return;
        
        const { scrollTop, scrollHeight, clientHeight } = codeElement;
        const maxScroll = scrollHeight - clientHeight;
        const canScrollUp = scrollTop > 0;
        const canScrollDown = scrollTop < maxScroll;
        
        // If we can scroll within the code block, prevent browser scroll
        if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
          e.preventDefault();
          e.stopPropagation();
          codeElement.scrollTop += e.deltaY;
        }
      }}
      style={{ overscrollBehavior: 'contain' }}
    >
      {showTitle && (
        <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-300 text-xs font-mono ml-3 font-semibold">{fileName || 'mult_search.cpp'}</span>
          </div>
          <span className="text-gray-500 text-xs">{algorithmName || 'Aho-Corasick Algorithm'}</span>
        </div>
      )}
      <div ref={codeRef} className="overflow-y-auto overflow-x-hidden bg-gray-950 flex-1 min-h-0" style={{ overscrollBehavior: 'contain' }}>
        <div className="py-0.5">
          {code.map((item, idx) => renderCodeLine(item, idx))}
        </div>
      </div>
    </div>
  );
};

