export const ACAutomaton = ({ step }) => {
  if (!step.layout) return null;
  const { nodes, links, width, height } = step.layout;
  
  // Find active node coordinates
  const activeNodeObj = nodes.find(n => n.id === step.node);
  
  // Calculate tooltip position - show above if node is low enough, below if near top
  const tooltipWidth = 240;
  const tooltipHeight = 60;
  const tooltipPadding = 80; // Extra space for tooltip
  const svgHeight = height + tooltipPadding; // Add padding for tooltip space
  
  // Determine tooltip position: if node is in top 80px, show tooltip below
  const showTooltipBelow = activeNodeObj && activeNodeObj.y < 80;
  const tooltipYOffset = showTooltipBelow ? 50 : -50;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="font-bold text-gray-700">AC Automaton (Trie) <span className="text-sm font-normal text-gray-500 ml-1">/ AC自动机</span></h3>
          <p className="text-xs text-gray-500">State Tree Structure with Transitions (Solid) & Fail Links (Dashed)</p>
        </div>
        {step.found && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-3 py-1 rounded text-sm animate-pulse">
            🎉 Match: <strong>{step.found.join(', ')}</strong>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto border rounded bg-white shadow-inner p-4 flex justify-center">
        <svg width={width} height={svgHeight} className="mx-auto">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
            <marker id="arrowhead-fail" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
            </marker>
            {/* Filter for tooltip shadow */}
            <filter id="tooltip-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Shift all content down to make room for tooltips at top */}
          <g transform={`translate(0, ${tooltipPadding/2})`}>
            {/* Links */}
            {links.map((link, idx) => {
              const source = nodes[link.source];
              const target = nodes[link.target];
              const isFail = link.type === 'fail';
              // Check if this is part of the active failure path
              const isActiveFailPath = step.type === 'fail' && 
                step.failPath && 
                step.failPath.includes(link.source) && 
                step.failPath.includes(link.target) &&
                step.failPath.indexOf(link.source) + 1 === step.failPath.indexOf(link.target);
              
              return (
                <g key={`link-${idx}`}>
                  <line 
                    x1={source.x} y1={source.y} 
                    x2={target.x} y2={target.y} 
                    stroke={isActiveFailPath ? "#ef4444" : isFail ? "#f87171" : "#cbd5e1"} 
                    strokeWidth={isActiveFailPath ? 3 : isFail ? 1.5 : 2}
                    strokeDasharray={isFail ? "5,5" : "0"}
                    markerEnd={isFail ? "url(#arrowhead-fail)" : "url(#arrowhead)"}
                    opacity={isActiveFailPath ? 1 : isFail ? 0.4 : 1}
                    className={isActiveFailPath ? "animate-pulse" : ""}
                  />
                  {!isFail && (
                    <text 
                      x={(source.x + target.x) / 2} 
                      y={(source.y + target.y) / 2 - 5} 
                      textAnchor="middle" 
                      className="text-xs font-bold fill-gray-400"
                      style={{ fontSize: '10px' }}
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              )
            })}
            
            {/* Animated Failure Path Trail */}
            {step.type === 'fail' && step.failPath && step.failPath.length > 1 && (
              <g>
                {step.failPath.slice(0, -1).map((nodeId, idx) => {
                  const sourceNode = nodes[nodeId];
                  const targetNode = nodes[step.failPath[idx + 1]];
                  if (!sourceNode || !targetNode) return null;
                  
                  return (
                    <g key={`fail-trail-${idx}`}>
                      {/* Animated path line with pulsing effect */}
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke="#ef4444"
                        strokeWidth="4"
                        strokeDasharray="8,4"
                        opacity="0.9"
                        markerEnd="url(#arrowhead-fail)"
                        className="animate-pulse"
                      />
                      {/* Highlight circles at path nodes */}
                      <circle
                        cx={sourceNode.x}
                        cy={sourceNode.y}
                        r="25"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        opacity="0.5"
                        className="animate-ping"
                      />
                    </g>
                  );
                })}
                {/* Final destination highlight */}
                {step.failPath.length > 0 && (() => {
                  const finalNode = nodes[step.failPath[step.failPath.length - 1]];
                  if (!finalNode) return null;
                  return (
                    <circle
                      cx={finalNode.x}
                      cy={finalNode.y}
                      r="25"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      opacity="0.7"
                      className="animate-pulse"
                    />
                  );
                })()}
              </g>
            )}

            {/* Nodes */}
            {nodes.map((node) => {
              const isFailTarget = step.prevNode !== undefined && step.trie[step.prevNode]?.fail === node.id && step.type === 'fail';
              return (
                <g key={`node-${node.id}`}>
                  <circle 
                    cx={node.x} cy={node.y} r="18" 
                    fill={isFailTarget ? "#fee2e2" : "#fff"}
                    stroke={isFailTarget ? "#ef4444" : "#cbd5e1"}
                    strokeWidth="2"
                  />
                  <text 
                    x={node.x} y={node.y} 
                    dy="5" textAnchor="middle" 
                    fill="#1f2937"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {node.id}
                  </text>
                  {node.output.length > 0 && (
                    <text x={node.x} y={node.y + 35} textAnchor="middle" fontSize="10" fill="#059669" fontWeight="bold">
                      [{node.output.join(',')}]
                    </text>
                  )}
                </g>
              );
            })}

            {/* Active Traveler Token (Animated) */}
            {activeNodeObj && (
              <>
                <circle
                  cx={activeNodeObj.x} 
                  cy={activeNodeObj.y} 
                  r="22" 
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  className="drop-shadow-md"
                />
                
                {/* Tooltip for active node */}
                {step.desc && activeNodeObj && (
                  <g transform={`translate(${activeNodeObj.x}, ${activeNodeObj.y + tooltipYOffset})`}>
                    {/* Tooltip background with rounded corners */}
                    <rect 
                      x="-120" 
                      y={showTooltipBelow ? "-5" : "-65"} 
                      width="240" 
                      height="60" 
                      rx="8" 
                      ry="8"
                      fill="#dbeafe" 
                      stroke="#3b82f6" 
                      strokeWidth="2"
                      opacity="0.98"
                      filter="url(#tooltip-shadow)"
                    />
                    {/* Pointer arrow - points up if tooltip is below, down if above */}
                    {showTooltipBelow ? (
                      <polygon 
                        points="0,-5 -8,5 8,5"
                        fill="#dbeafe"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                    ) : (
                      <polygon 
                        points="0,15 -8,5 8,5"
                        fill="#dbeafe"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                    )}
                    {/* English description */}
                    <text 
                      x="0" 
                      y={showTooltipBelow ? "25" : "-35"} 
                      textAnchor="middle" 
                      fill="#1e3a8a" 
                      fontSize="13" 
                      fontWeight="600"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {step.desc.en || "Ready to start..."}
                    </text>
                    {/* Chinese description */}
                    <text 
                      x="0" 
                      y={showTooltipBelow ? "45" : "-15"} 
                      textAnchor="middle" 
                      fill="#3b82f6" 
                      fontSize="11" 
                      fontWeight="500"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {step.desc.zh || "准备开始..."}
                    </text>
                  </g>
                )}
              </>
            )}
          </g>
        </svg>
      </div>
      
      <div className="bg-gray-50 p-2 mt-2 rounded border text-xs font-mono text-gray-500 flex justify-between">
        <span>Current State: {step.node}</span>
        <span>Processing Char: {step.char || '-'}</span>
      </div>
    </div>
  );
};

