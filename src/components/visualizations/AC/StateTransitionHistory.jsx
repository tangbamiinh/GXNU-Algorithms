export const StateTransitionHistory = ({ stateHistory, currentNode, stepType, showTitle = true }) => {
  if (!stateHistory || stateHistory.length === 0) return null;
  
  // Get last 20 states for display
  const recentStates = stateHistory.slice(-20);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          State History / 状态历史
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {recentStates.map((state, idx) => {
            const isCurrent = idx === recentStates.length - 1 && stepType !== 'init';
            const isPrevious = idx === recentStates.length - 2;
            return (
              <div key={idx} className="flex items-center">
                <div className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                  isCurrent 
                    ? 'bg-blue-100 border-blue-500 text-blue-800 font-bold scale-110 shadow-md' 
                    : isPrevious
                    ? 'bg-gray-100 border-gray-400 text-gray-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600'
                }`}>
                  {state}
                </div>
                {idx < recentStates.length - 1 && (
                  <span className="mx-1 text-gray-400">→</span>
                )}
              </div>
            );
          })}
          {stateHistory.length > 20 && (
            <span className="text-xs text-gray-400 ml-2">
              ... ({stateHistory.length - 20} earlier)
            </span>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Total transitions: {stateHistory.length - 1}
        </div>
      </div>
    </div>
  );
};

