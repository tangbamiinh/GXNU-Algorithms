export const MatchCounterStats = ({ matches, matchHistory, patterns, showTitle = true }) => {
  const totalMatches = matches?.length || 0;
  const patternCounts = {};
  
  if (matches) {
    matches.forEach(m => {
      patternCounts[m.pattern] = (patternCounts[m.pattern] || 0) + 1;
    });
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Statistics / 统计信息
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-4">
          {/* Total Matches */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">Total Matches</div>
            <div className="text-2xl font-bold text-blue-800">{totalMatches}</div>
          </div>
          
          {/* Per Pattern Counts */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Matches per Pattern</div>
            <div className="space-y-1">
              {Object.entries(patternCounts).map(([pattern, count]) => (
                <div key={pattern} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="font-mono text-sm text-gray-700">{pattern}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Stats */}
          {matchHistory && matchHistory.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                <div>First match: Step {matchHistory[0]?.stepIndex + 1}</div>
                <div>Last match: Step {matchHistory[matchHistory.length - 1]?.stepIndex + 1}</div>
                <div>Unique patterns: {Object.keys(patternCounts).length}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

