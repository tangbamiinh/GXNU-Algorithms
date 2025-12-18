export const MaxFlowGraph = ({ step, showTitle = true }) => {
  const { graph = [], capacity = [], flow = [], currentNode, augmentingPath = [], phase } = step || {};
  const numNodes = graph.length;

  if (numNodes === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No graph data available</p>
      </div>
    );
  }

  // Simple layout: Source on left, Experiments in middle-left, Instruments in middle-right, Sink on right
  const getNodePosition = (node) => {
    const width = 800;
    const height = 600;
    const source = 0;
    const sink = numNodes - 1;
    
    if (node === source) {
      return { x: 50, y: height / 2, label: 'S' };
    }
    if (node === sink) {
      return { x: width - 50, y: height / 2, label: 'T' };
    }
    
    // Determine if it's an experiment or instrument
    // Assuming: nodes 1 to m are experiments, nodes m+1 to sink-1 are instruments
    const m = Math.floor((numNodes - 2) / 2); // Rough estimate
    const isExperiment = node <= m;
    
    if (isExperiment) {
      const expIndex = node - 1;
      const expCount = m;
      const spacing = (height - 100) / Math.max(expCount, 1);
      return {
        x: width / 3,
        y: 50 + expIndex * spacing,
        label: `E${node}`
      };
    } else {
      const instrIndex = node - m - 1;
      const instrCount = numNodes - m - 2;
      const spacing = (height - 100) / Math.max(instrCount, 1);
      return {
        x: (2 * width) / 3,
        y: 50 + instrIndex * spacing,
        label: `I${node - m}`
      };
    }
  };

  const getEdgeColor = (u, v) => {
    if (augmentingPath && augmentingPath.includes(u) && augmentingPath.includes(v)) {
      const uIdx = augmentingPath.indexOf(u);
      const vIdx = augmentingPath.indexOf(v);
      if (Math.abs(uIdx - vIdx) === 1) {
        return '#10b981'; // Green for augmenting path
      }
    }
    const f = flow[u]?.[v] || 0;
    const c = capacity[u]?.[v] || 0;
    if (f > 0) {
      return '#3b82f6'; // Blue for edges with flow
    }
    return '#9ca3af'; // Gray for unused edges
  };

  const getEdgeWidth = (u, v) => {
    const f = flow[u]?.[v] || 0;
    const c = capacity[u]?.[v] || 0;
    if (c === 0 && f === 0) return 0;
    // Check for infinity (handle both Infinity and very large numbers)
    const isInfinity = c === Infinity || c === Number.POSITIVE_INFINITY || c > 1e10;
    // For infinity edges, use a base width of 2
    if (isInfinity) {
      return Math.max(2, f > 0 ? 3 : 2);
    }
    return Math.max(1, (f / Math.max(c, 1)) * 3);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Graph Visualization / 图可视化
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <svg width="800" height="600" className="border border-gray-200 rounded">
          {/* Draw edges - only draw forward edges (u < v) to avoid overlaps */}
          {graph.map((neighbors, u) =>
            neighbors.map((v) => {
              // Only draw edges in forward direction (u < v) to avoid duplicates
              if (u >= v) return null;
              
              const posU = getNodePosition(u);
              const posV = getNodePosition(v);
              const f = flow[u]?.[v] || 0;
              const c = capacity[u]?.[v] || 0;
              
              // Skip edges with zero capacity (unless they have flow, which means they're residual edges)
              if (c === 0 && f === 0) return null;
              
              // Check for infinity (handle both Infinity and very large numbers)
              const isInfinity = c === Infinity || c === Number.POSITIVE_INFINITY || c > 1e10;
              
              const color = getEdgeColor(u, v);
              const width = getEdgeWidth(u, v);
              
              // Create a curved path using quadratic Bezier curve
              // Use a deterministic but varied curve based on edge endpoints to avoid overlaps
              const dx = posV.x - posU.x;
              const dy = posV.y - posU.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Create a control point offset perpendicular to the line
              // Use edge ID to create consistent but varied curves
              const edgeId = u * 1000 + v; // Create unique ID for consistent randomness
              const seed = (edgeId * 17 + 23) % 200; // Pseudo-random but deterministic
              
              // Stronger curvature with alternating directions to separate crossing edges
              // Use both edge endpoints to determine curve direction for better separation
              const nodeSum = u + v;
              const curvatureSign = (nodeSum % 2 === 0) ? 1 : -1;
              
              // Stronger curvature: -0.5 to 0.5 curvature factor
              // Bias away from zero to ensure visible curves
              const baseCurvature = (seed / 200 - 0.5) * 1.0; // -0.5 to 0.5
              const curvature = curvatureSign * (Math.abs(baseCurvature) < 0.15 ? 
                (baseCurvature >= 0 ? 0.3 : -0.3) : baseCurvature);
              
              // Perpendicular vector for curve control point
              const perpX = -dy / distance;
              const perpY = dx / distance;
              
              // Control point offset from midpoint - use stronger offset for better separation
              const controlOffset = distance * curvature * 0.7; // Increased to 0.7 for more pronounced curves
              const midX = (posU.x + posV.x) / 2;
              const midY = (posU.y + posV.y) / 2;
              const controlX = midX + perpX * controlOffset;
              const controlY = midY + perpY * controlOffset;
              
              // Calculate label position on curve (at 50% of curve)
              const t = 0.5;
              const labelX = (1 - t) * (1 - t) * posU.x + 2 * (1 - t) * t * controlX + t * t * posV.x;
              const labelY = (1 - t) * (1 - t) * posU.y + 2 * (1 - t) * t * controlY + t * t * posV.y;
              
              // Calculate normal vector at label position for better offset
              const tangentX = 2 * (1 - t) * (controlX - posU.x) + 2 * t * (posV.x - controlX);
              const tangentY = 2 * (1 - t) * (controlY - posU.y) + 2 * t * (posV.y - controlY);
              const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
              const normalX = -tangentY / tangentLength; // Perpendicular to tangent
              const normalY = tangentX / tangentLength;
              
              // Offset label perpendicular to curve, further away
              const labelOffset = 15; // Increased from 8
              const finalLabelX = labelX + normalX * labelOffset;
              const finalLabelY = labelY + normalY * labelOffset;
              
              return (
                <g key={`${u}-${v}`}>
                  <path
                    d={`M ${posU.x} ${posU.y} Q ${controlX} ${controlY} ${posV.x} ${posV.y}`}
                    stroke={color}
                    strokeWidth={Math.max(1, width)}
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    strokeDasharray={isInfinity ? "5,5" : "none"}
                  />
                  {/* Background rectangle for text readability */}
                  <rect
                    x={finalLabelX - 25}
                    y={finalLabelY - 7}
                    width="50"
                    height="14"
                    fill="white"
                    fillOpacity="0.9"
                    stroke="none"
                    rx="2"
                  />
                  <text
                    x={finalLabelX}
                    y={finalLabelY}
                    fontSize="12"
                    fill={isInfinity ? "#ef4444" : "#666"}
                    fontWeight={isInfinity ? "bold" : "normal"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {f}/{isInfinity ? '∞' : c}
                  </text>
                </g>
              );
            })
          )}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#666" />
            </marker>
          </defs>
          
          {/* Draw nodes */}
          {graph.map((_, node) => {
            const pos = getNodePosition(node);
            const isCurrent = currentNode === node;
            const isInPath = augmentingPath && augmentingPath.includes(node);
            
            return (
              <g key={node}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isCurrent ? 25 : 20}
                  fill={isCurrent ? '#3b82f6' : isInPath ? '#10b981' : '#fff'}
                  stroke={isCurrent ? '#1e40af' : isInPath ? '#059669' : '#374151'}
                  strokeWidth={isCurrent ? 3 : 2}
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill={isCurrent || isInPath ? '#fff' : '#000'}
                >
                  {pos.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

