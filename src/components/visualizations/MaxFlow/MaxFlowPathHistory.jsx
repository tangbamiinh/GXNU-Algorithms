export const MaxFlowPathHistory = ({ step, showTitle = true }) => {
  const { augmentingPaths = [], augmentingPath = null, pathFlow = null } = step || {};
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Augmenting Paths / 增广路径
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        {augmentingPath && pathFlow !== null && (
          <div className="mb-3 bg-green-50 border-l-4 border-green-500 p-2 rounded-r shadow-sm">
            <div className="font-bold text-green-800">Current Path / 当前路径</div>
            <div className="text-sm text-gray-700 mt-1">
              {augmentingPath.join(' → ')}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Flow: {pathFlow}
            </div>
          </div>
        )}
        <div className="space-y-2">
          {augmentingPaths && augmentingPaths.length > 0 ? (
            augmentingPaths.map((pathData, idx) => (
              <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded-r shadow-sm">
                <div className="font-bold text-blue-800">Path #{idx + 1}</div>
                <div className="text-sm text-gray-700 mt-1">
                  {pathData.path.join(' → ')}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Flow: {pathData.flow}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No augmenting paths found yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

