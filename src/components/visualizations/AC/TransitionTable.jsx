export const TransitionTable = ({ trie, currentNode, transitionChar, stepType, showTitle = true }) => {
  if (!trie || trie.length === 0) return null;
  
  // Get all unique characters used in transitions
  const allChars = new Set();
  trie.forEach(node => {
    Object.keys(node.next).forEach(char => allChars.add(char));
  });
  const sortedChars = Array.from(allChars).sort();
  
  // Limit display to reasonable number of states
  const maxStates = Math.min(15, trie.length);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Transition Table / 转移表
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 sticky top-0">
              <th className="px-2 py-2 text-left border-r border-gray-300 font-semibold">State / 状态</th>
              {sortedChars.map(char => (
                <th key={char} className={`px-2 py-2 text-center border-r border-gray-300 font-semibold ${
                  stepType === 'goto' && transitionChar === char ? 'bg-blue-100' : ''
                }`}>
                  '{char}'
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trie.slice(0, maxStates).map((node, stateId) => (
              <tr 
                key={stateId} 
                className={`border-b border-gray-200 hover:bg-gray-50 ${
                  currentNode === stateId ? 'bg-blue-50 font-semibold' : ''
                }`}
              >
                <td className={`px-2 py-2 border-r border-gray-300 ${
                  currentNode === stateId ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {stateId}
                  {node.output.length > 0 && (
                    <span className="ml-1 text-green-600">★</span>
                  )}
                </td>
                {sortedChars.map(char => {
                  const nextState = node.next[char];
                  const isActive = currentNode === stateId && stepType === 'goto' && transitionChar === char;
                  return (
                    <td 
                      key={char}
                      className={`px-2 py-2 text-center border-r border-gray-300 ${
                        isActive 
                          ? 'bg-blue-200 font-bold text-blue-800 animate-pulse' 
                          : nextState !== undefined 
                            ? 'text-gray-700' 
                            : 'text-gray-300'
                      }`}
                    >
                      {nextState !== undefined ? nextState : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {trie.length > maxStates && (
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
            Showing first {maxStates} of {trie.length} states
          </div>
        )}
      </div>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex-shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-50 border border-blue-300"></span>
            Current State
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-200"></span>
            Active Transition
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-600">★</span>
            Output State
          </span>
        </div>
      </div>
    </div>
  );
};

