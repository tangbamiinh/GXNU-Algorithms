export const MaxFlowCapacityMatrix = ({ step, showTitle = true }) => {
  const { capacity = [], graph = [], flow = [] } = step || {};
  const numNodes = capacity.length;

  if (numNodes === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No capacity data available</p>
      </div>
    );
  }

  // Get node labels
  const getNodeLabel = (node) => {
    if (node === 0) return 'Source';
    if (node === numNodes - 1) return 'Sink';
    // Estimate m (number of experiments)
    const m = Math.floor((numNodes - 2) / 2);
    if (node <= m) {
      return `E${node}`;
    } else {
      return `I${node - m}`;
    }
  };

  // Get node names for headers
  const nodeLabels = Array.from({ length: numNodes }, (_, i) => getNodeLabel(i));

  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Capacity Matrix / 容量矩阵
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto p-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 px-2 py-1 font-semibold sticky left-0 bg-gray-100 z-10"></th>
                {nodeLabels.map((label, idx) => (
                  <th key={idx} className="border border-gray-300 bg-gray-100 px-2 py-1 font-semibold min-w-[60px]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capacity.map((row, i) => {
                const rowLabel = getNodeLabel(i);
                return (
                  <tr key={i}>
                    <td className="border border-gray-300 bg-gray-100 px-2 py-1 font-semibold sticky left-0 bg-gray-100 z-10">
                      {rowLabel}
                    </td>
                    {row.map((cap, j) => {
                      const f = flow[i]?.[j] || 0;
                      const isInfinity = cap === Infinity || cap === Number.POSITIVE_INFINITY || cap > 1e10;
                      const hasCapacity = cap > 0 || f > 0;
                      const isResidual = cap === 0 && f > 0; // Residual edge (backward flow)
                      
                      return (
                        <td
                          key={j}
                          className={`border border-gray-300 px-2 py-1 text-center ${
                            hasCapacity
                              ? isResidual
                                ? 'bg-yellow-50'
                                : isInfinity
                                ? 'bg-red-50 font-semibold'
                                : 'bg-blue-50'
                              : 'bg-gray-50'
                          }`}
                          title={`From ${rowLabel} to ${getNodeLabel(j)}: Flow=${f}, Capacity=${isInfinity ? '∞' : cap}`}
                        >
                          {hasCapacity ? (
                            <div className="flex flex-col">
                              <span className={isInfinity ? 'text-red-600' : 'text-gray-700'}>
                                {f}/{isInfinity ? '∞' : cap}
                              </span>
                              {isResidual && (
                                <span className="text-xs text-yellow-600">(residual)</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-gray-300"></div>
            <span>Forward edge with capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-gray-300"></div>
            <span>Infinity capacity (∞)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-gray-300"></div>
            <span>Residual edge (backward flow)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-300"></div>
            <span>No edge</span>
          </div>
        </div>
      </div>
    </div>
  );
};
