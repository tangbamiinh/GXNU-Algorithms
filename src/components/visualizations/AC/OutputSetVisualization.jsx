export const OutputSetVisualization = ({ trie, currentNode, showTitle = true }) => {
  if (!trie || trie.length === 0) return null;
  
  const outputStates = trie
    .map((node, idx) => ({ state: idx, outputs: node.output }))
    .filter(item => item.outputs.length > 0);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Output Sets / 输出集合
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {outputStates.map(({ state, outputs }) => (
            <div 
              key={state}
              className={`p-2 rounded border ${
                state === currentNode 
                  ? 'bg-blue-50 border-blue-400 shadow-sm' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${
                  state === currentNode ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  State {state}
                </span>
                {state === currentNode && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">Current</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {outputs.map((pattern, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-300"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

