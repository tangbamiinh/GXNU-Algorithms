export const renderHighlightText = (str, activeIndices = [], color = 'bg-orange-200', matches = []) => {
  // Color palette for different patterns
  const matchColors = [
    'bg-green-200 border-green-400',
    'bg-purple-200 border-purple-400',
    'bg-pink-200 border-pink-400',
    'bg-yellow-200 border-yellow-400',
    'bg-cyan-200 border-cyan-400',
  ];
  
  // Create a map of index to match info
  const matchMap = new Map();
  matches.forEach((match, idx) => {
    for (let i = match.start; i <= match.end; i++) {
      if (!matchMap.has(i) || matchMap.get(i).priority < idx) {
        matchMap.set(i, { 
          pattern: match.pattern, 
          color: matchColors[idx % matchColors.length],
          priority: idx 
        });
      }
    }
  });
  
  return (
    <div className="flex font-mono text-lg overflow-x-auto pb-2 pt-3">
      {str.split('').map((char, idx) => {
         let bg = 'bg-white scale-100';
         let border = 'border-gray-200';
         let matchLabel = null;
         
         // Check if this index is part of a matched pattern
         if (matchMap.has(idx)) {
           const matchInfo = matchMap.get(idx);
           bg = `${matchInfo.color.split(' ')[0]} scale-110 shadow-sm`;
           border = matchInfo.color.split(' ')[1];
           // Show pattern label on first character of match
           if (idx === matches.find(m => m.start === idx)?.start) {
             matchLabel = matchInfo.pattern;
           }
         } else if (activeIndices.includes(idx)) {
             bg = `${color} scale-110 shadow-sm`;
             border = color.replace('bg-', 'border-').replace('200', '400');
         }
         
         return (
           <div key={idx} className={`flex flex-col items-center justify-center w-8 h-12 border mx-0.5 rounded transition-all duration-300 ease-in-out overflow-visible relative ${bg} ${border}`}>
             <span className="leading-none mt-2">{char || '\u00A0'}</span>
             <span className="text-[10px] text-gray-400 mt-0.5">{idx}</span>
             {matchLabel && (
               <span className="absolute -top-5 text-[9px] font-bold text-gray-700 whitespace-nowrap bg-white px-1 rounded border border-gray-300 shadow-sm">
                 {matchLabel}
               </span>
             )}
           </div>
         )
      })}
    </div>
  );
};

