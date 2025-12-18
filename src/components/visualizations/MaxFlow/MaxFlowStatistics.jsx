export const MaxFlowStatistics = ({ step, showTitle = true }) => {
  const { maxFlow = 0, totalRevenue = 0, maxProfit = 0, augmentingPaths = [] } = step || {};
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Statistics / 统计信息
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3 space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-600 mb-1">Maximum Flow / 最大流</div>
          <div className="text-2xl font-bold text-blue-800">{maxFlow}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-green-600 mb-1">Total Revenue / 总收益</div>
          <div className="text-2xl font-bold text-green-800">{totalRevenue}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-xs text-purple-600 mb-1">Maximum Profit / 最大利润</div>
          <div className="text-2xl font-bold text-purple-800">{maxProfit}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-xs text-orange-600 mb-1">Augmenting Paths / 增广路径数</div>
          <div className="text-2xl font-bold text-orange-800">{augmentingPaths?.length || 0}</div>
        </div>
        <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-200">
          <div>Time Complexity: O(V × E²)</div>
          <div>Space Complexity: O(V²)</div>
          <div>Algorithm: Edmonds-Karp</div>
        </div>
      </div>
    </div>
  );
};

