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
                      if (i === j) {
                        // Skip diagonal (self-loops)
                        return (
                          <td key={j} className="border border-gray-300 px-2 py-1 text-center bg-gray-100">
                            <span className="text-gray-400">-</span>
                          </td>
                        );
                      }
                      
                      const f = flow[i]?.[j] || 0;
                      const reverseCap = capacity[j]?.[i] || 0; // Capacity in reverse direction (j->i)
                      const reverseF = flow[j]?.[i] || 0;
                      const isInfinity = cap === Infinity || cap === Number.POSITIVE_INFINITY || cap > 1e10;
                      
                      // Residual edge: When we push flow on i->j, we create backward capacity on j->i
                      // The residual edge is visible at position [j][i] in the matrix
                      // We detect residual edges by checking if backward capacity exists and was created
                      // A residual edge exists when:
                      // - reverseCap > 0 (backward capacity exists)
                      // - AND the original forward edge (j->i) had zero capacity
                      // Since we don't store original capacities, we detect by:
                      // - reverseCap > 0 AND cap > 0 AND f > 0 (we pushed flow on i->j, creating j->i residual)
                      // OR
                      // - reverseCap > 0 AND cap === 0 (this cell has no forward edge, so reverseCap is residual)
                      
                      // Show this cell as residual if it represents a residual edge
                      // Cell [i][j] shows edge i->j
                      // If reverseCap > 0 and was created by pushing flow on i->j, then j->i is residual
                      // But we're displaying [i][j], so we check: if cap === 0 and reverseCap > 0, this might be showing residual
                      // Actually, residual edges should be shown where they exist: at [j][i] when reverseCap > 0
                      // So when we're at cell [i][j], we check if [j][i] has residual capacity
                      
                      // Better approach: Show residual edge indicator in cell [i][j] when:
                      // - There's backward capacity at [j][i] (reverseCap > 0)
                      // - AND we pushed flow forward on [i][j] (f > 0), which created that backward capacity
                      const hasResidualBackward = reverseCap > 0 && f > 0;
                      
                      // Also check if this cell itself is a residual edge (backward capacity with no original forward edge)
                      const isThisResidual = cap === 0 && reverseCap > 0 && reverseF === 0;
                      
                      const hasCapacity = cap > 0 || f > 0;
                      const showResidual = hasResidualBackward || isThisResidual;
                      
                      return (
                        <td
                          key={j}
                          className={`border border-gray-300 px-2 py-1 text-center ${
                            hasCapacity || reverseCap > 0
                              ? showResidual && reverseCap > 0
                                ? 'bg-yellow-50'
                                : isInfinity
                                ? 'bg-red-50 font-semibold'
                                : cap > 0 || f > 0
                                ? 'bg-blue-50'
                                : 'bg-gray-50'
                              : 'bg-gray-50'
                          }`}
                          title={`From ${rowLabel} to ${getNodeLabel(j)}: Flow=${f}, Capacity=${isInfinity ? '∞' : cap}${reverseCap > 0 ? ` | Residual edge ${getNodeLabel(j)}->${rowLabel}: capacity=${reverseCap}` : ''}`}
                        >
                          {(hasCapacity || reverseCap > 0) ? (
                            <div className="flex flex-col">
                              {cap > 0 || f > 0 ? (
                                <span className={isInfinity ? 'text-red-600' : 'text-gray-700'}>
                                  {f}/{isInfinity ? '∞' : cap}
                                </span>
                              ) : null}
                              {reverseCap > 0 && (
                                <span className={`text-xs font-semibold ${showResidual ? 'text-yellow-600' : 'text-gray-500'}`}>
                                  ←{reverseCap}{showResidual ? ' (residual)' : ''}
                                </span>
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
