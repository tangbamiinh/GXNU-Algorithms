export const OptimizationVisualization = ({ trie, currentNode, transitionChar, showTitle = true }) => {
  if (!trie || currentNode === undefined) return null;
  
  const currentNodeData = trie[currentNode];
  if (!currentNodeData) return null;
  
  // Show optimized transitions (direct go vs following fail)
  const optimizedTransitions = [];
  Object.keys(currentNodeData.next).forEach(char => {
    const directState = currentNodeData.next[char];
    optimizedTransitions.push({
      char,
      directState,
      isOptimized: true,
      isActive: transitionChar === char
    });
  });
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Optimized Transitions / 优化转移
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="mb-3 text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
          <strong>Optimization:</strong> Direct transitions (O(1)) instead of following fail links
        </div>
        <div className="space-y-2">
          {optimizedTransitions.length > 0 ? (
            optimizedTransitions.map((trans, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded border ${
                  trans.isActive 
                    ? 'bg-blue-100 border-blue-400 shadow-sm' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">'{trans.char}'</span>
                  <span className="text-gray-400">→</span>
                  <span className={`font-bold ${
                    trans.isActive ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    State {trans.directState}
                  </span>
                  {trans.isActive && (
                    <span className="ml-auto text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Direct transition (optimized)
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              No transitions from state {currentNode}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

