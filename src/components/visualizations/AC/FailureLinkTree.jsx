export const FailureLinkTree = ({ trie, layout, currentNode, stepType, showTitle = true }) => {
  if (!trie || !layout) return null;
  
  const { nodes, links } = layout;
  const failLinks = links.filter(link => link.type === 'fail');
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Failure Links / 失败链接
        </div>
      )}
      <div className="overflow-auto flex-1 min-h-0 p-4">
        <div className="text-xs text-gray-500 mb-3">
          Simplified view showing only failure link relationships
        </div>
        <svg width={Math.min(600, nodes.length * 80)} height={Math.min(400, failLinks.length * 60)} className="border rounded bg-gray-50">
          <defs>
            <marker id="arrowhead-fail-tree" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>
          {failLinks.map((link, idx) => {
            const source = nodes[link.source];
            const target = nodes[link.target];
            if (!source || !target) return null;
            
            const isActive = stepType === 'fail' && currentNode === link.target;
            
            return (
              <g key={idx}>
                <line
                  x1={source.x * 0.5 + 50}
                  y1={source.y * 0.5 + 50}
                  x2={target.x * 0.5 + 50}
                  y2={target.y * 0.5 + 50}
                  stroke={isActive ? "#ef4444" : "#f87171"}
                  strokeWidth={isActive ? 3 : 1.5}
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead-fail-tree)"
                  opacity={isActive ? 1 : 0.6}
                  className={isActive ? "animate-pulse" : ""}
                />
                <circle
                  cx={source.x * 0.5 + 50}
                  cy={source.y * 0.5 + 50}
                  r="12"
                  fill="#fff"
                  stroke={source.id === currentNode ? "#3b82f6" : "#cbd5e1"}
                  strokeWidth="2"
                />
                <text
                  x={source.x * 0.5 + 50}
                  y={source.y * 0.5 + 50}
                  dy="4"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#1f2937"
                >
                  {source.id}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-3 text-xs text-gray-500">
          Total failure links: {failLinks.length}
        </div>
      </div>
    </div>
  );
};

