export const NaiveStatistics = ({ comparisons, matches, textLength, patternLength, showTitle = true }) => {
  const efficiency = comparisons > 0 ? ((textLength - patternLength + 1) * patternLength / comparisons * 100).toFixed(1) : 0;
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Statistics / 统计信息
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3 space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-600 mb-1">Total Comparisons</div>
          <div className="text-2xl font-bold text-blue-800">{comparisons || 0}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-green-600 mb-1">Matches Found</div>
          <div className="text-2xl font-bold text-green-800">{matches?.length || 0}</div>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Time Complexity: O(n × m)</div>
          <div>Space Complexity: O(1)</div>
          <div>Worst Case: {(textLength - patternLength + 1) * patternLength} comparisons</div>
        </div>
      </div>
    </div>
  );
};

