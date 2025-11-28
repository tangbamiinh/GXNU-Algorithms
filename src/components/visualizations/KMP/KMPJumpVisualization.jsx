export const KMPJumpVisualization = ({ jumpHistory, nextTable, showTitle = true }) => {
  if (!jumpHistory || jumpHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No jumps yet</p>
      </div>
    );
  }
  
  const recentJumps = jumpHistory.slice(-10);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Jump History / 跳转历史
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {recentJumps.map((jump, idx) => (
            <div key={idx} className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded-r">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-800">j: {jump.from}</span>
                <span className="text-gray-400">→</span>
                <span className="font-bold text-purple-800">j: {jump.to}</span>
                {jump.reason === 'mismatch' && (
                  <span className="ml-auto text-xs text-gray-500">at position {jump.position}</span>
                )}
              </div>
              {nextTable && jump.from > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Using Next[{jump.from - 1}] = {nextTable[jump.from - 1]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

