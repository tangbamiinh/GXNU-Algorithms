// Helper function to build a map of node ID -> character label
const buildNodeCharMap = (trie, links = []) => {
  const nodeCharMap = { 0: 'ROOT' }; // Root node has no character
  
  if (trie) {
    // Use trie structure to find which character leads to each node
    trie.forEach((parentNode, parentId) => {
      Object.entries(parentNode.next || {}).forEach(([char, childId]) => {
        if (childId !== 0 && !nodeCharMap[childId]) {
          nodeCharMap[childId] = char;
        }
      });
    });
  } else if (links && links.length > 0) {
    // Fallback: use links to determine character labels
    links.forEach(link => {
      if (link.type === 'next' && link.label && link.target !== 0) {
        nodeCharMap[link.target] = link.label;
      }
    });
  }
  
  return nodeCharMap;
};

export const ACAutomaton = ({ step }) => {
  if (!step.layout) return null;
  const { nodes, links, width, height } = step.layout;
  
  // Determine which nodes and links to show based on phase
  const phase = step.phase || 'search';
  const isBuilding = phase === 'build_trie' || phase === 'build_failure';
  
  // Get stage label
  const getStageLabel = () => {
    if (phase === 'build_trie') return { en: 'Stage 1: Build Trie', zh: '阶段 1：构建 Trie' };
    if (phase === 'build_failure') return { en: 'Stage 2: Build Failure Links', zh: '阶段 2：构建失败链接' };
    return { en: 'Stage 3: Search', zh: '阶段 3：搜索' };
  };
  const stageLabel = getStageLabel();
  
  // Build character label map for nodes
  const trieForMapping = step.trie;
  const nodeCharMap = buildNodeCharMap(trieForMapping, links);
  
  // During building, only show nodes/links that exist in current trie state
  const visibleNodes = isBuilding && step.trie 
    ? nodes.filter(n => step.trie[n.id] !== undefined)
    : nodes;
  
  // Build visible links based on current trie state
  const visibleLinks = [];
  if (isBuilding && step.trie) {
    // Add transition links (next)
    step.trie.forEach((node, id) => {
      Object.entries(node.next).forEach(([char, targetId]) => {
        if (step.trie[targetId] !== undefined) {
          visibleLinks.push({ source: id, target: targetId, label: char, type: 'next' });
        }
      });
    });
    // Add failure links
    step.trie.forEach((node, id) => {
      if (node.fail !== undefined && node.fail !== 0 && id !== 0) {
        visibleLinks.push({ source: id, target: node.fail, type: 'fail', label: '' });
      }
    });
  } else {
    // Search phase: show all links
    visibleLinks.push(...links);
  }
  
  // Find active node coordinates
  const activeNodeObj = visibleNodes.find(n => n.id === step.node);
  
  // Calculate tooltip position - show above if node is low enough, below if near top
  const tooltipWidth = 240;
  const tooltipHeight = 80;
  const tooltipPadding = 120; // Extra space for tooltip (increased)
  const svgHeight = Math.max(height + tooltipPadding, 400); // Ensure minimum height of 400px
  
  // Determine tooltip position: if node is in top 80px, show tooltip below
  const showTooltipBelow = activeNodeObj && activeNodeObj.y < 80;
  const tooltipYOffset = showTooltipBelow ? 50 : -50;
  
  // Determine if we're creating a new node or link
  const isCreatingNode = isBuilding && (step.type === 'insert_create' || step.type === 'build_fail_set');
  const newNodeId = step.newNode !== undefined ? step.newNode : null;
  const isCreatingLink = isBuilding && (
    step.type === 'insert_move' || 
    step.type === 'build_fail_set' || 
    step.type === 'build_fail_optimize'
  );

  return (
    <div className="mt-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="font-bold text-gray-700">
            AC Automaton (Trie) <span className="text-sm font-normal text-gray-500 ml-1">/ AC自动机</span>
            <span className={`ml-2 text-sm font-normal px-2 py-1 rounded ${
              phase === 'build_trie' ? 'text-blue-600 bg-blue-100' :
              phase === 'build_failure' ? 'text-purple-600 bg-purple-100' :
              'text-green-600 bg-green-100'
            }`}>
              {stageLabel.en} / {stageLabel.zh}
            </span>
          </h3>
          <p className="text-xs text-gray-500">
            {phase === 'build_trie' 
              ? "Stage 1: Building Trie by inserting patterns step-by-step / 阶段 1：逐步插入模式串构建 Trie"
              : phase === 'build_failure'
              ? "Stage 2: Building failure links using BFS traversal / 阶段 2：使用 BFS 遍历构建失败链接"
              : "Stage 3: Searching text using the AC automaton / 阶段 3：使用 AC 自动机搜索文本"
            }
          </p>
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
            {visibleLinks.map((link, idx) => {
              const sourceNode = visibleNodes.find(n => n.id === link.source);
              const targetNode = visibleNodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;
              
              const isFail = link.type === 'fail';
              // Check if this is part of the active failure path
              const isActiveFailPath = step.type === 'fail' && 
                step.failPath && 
                step.failPath.includes(link.source) && 
                step.failPath.includes(link.target) &&
                step.failPath.indexOf(link.source) + 1 === step.failPath.indexOf(link.target);
              
              // Check if this link is being created in current step
              const isNewLink = isCreatingLink && (
                (step.type === 'insert_move' && step.currentNode === link.target && link.type === 'next' && link.label === step.char) ||
                (step.type === 'build_fail_set' && step.childNode === link.target && step.currentNode === link.source && link.type === 'fail') ||
                (step.type === 'build_fail_optimize' && step.currentNode === link.source && link.label === step.char && link.type === 'next')
              );
              
              return (
                <g key={`link-${idx}`}>
                  <line 
                    x1={sourceNode.x} y1={sourceNode.y} 
                    x2={targetNode.x} y2={targetNode.y} 
                    stroke={isNewLink ? "#10b981" : isActiveFailPath ? "#ef4444" : isFail ? "#f87171" : "#cbd5e1"} 
                    strokeWidth={isNewLink ? 3 : isActiveFailPath ? 3 : isFail ? 1.5 : 2}
                    strokeDasharray={isFail ? "5,5" : "0"}
                    markerEnd={isFail ? "url(#arrowhead-fail)" : "url(#arrowhead)"}
                    opacity={isNewLink ? 1 : isActiveFailPath ? 1 : isFail ? 0.4 : 1}
                    className={isNewLink ? "animate-pulse" : isActiveFailPath ? "animate-pulse" : ""}
                  />
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
            {visibleNodes.map((node) => {
              const isFailTarget = step.prevNode !== undefined && step.trie && step.trie[step.prevNode]?.fail === node.id && step.type === 'fail';
              const isNewNode = isCreatingNode && node.id === newNodeId;
              const nodeData = step.trie && step.trie[node.id] ? step.trie[node.id] : node;
              const output = nodeData.output || [];
              
              // Get character label for this node
              const nodeLabel = nodeCharMap[node.id] || node.id.toString();
              const isRoot = node.id === 0;
              
              return (
                <g key={`node-${node.id}`}>
                  <circle 
                    cx={node.x} cy={node.y} r="18" 
                    fill={isNewNode ? "#d1fae5" : isFailTarget ? "#fee2e2" : isRoot ? "#e0e7ff" : "#fff"}
                    stroke={isNewNode ? "#10b981" : isFailTarget ? "#ef4444" : isRoot ? "#6366f1" : "#cbd5e1"}
                    strokeWidth={isNewNode ? 3 : isRoot ? 2.5 : 2}
                    className={isNewNode ? "animate-pulse" : ""}
                  />
                  <text 
                    x={node.x} y={node.y} 
                    dy="5" textAnchor="middle" 
                    fill={isNewNode ? "#059669" : isRoot ? "#4338ca" : "#1f2937"}
                    fontSize={isRoot ? "10" : "13"}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {nodeLabel}
                  </text>
                  {output.length > 0 && (
                    <text x={node.x} y={node.y + 35} textAnchor="middle" fontSize="10" fill="#059669" fontWeight="bold">
                      [{output.join(',')}]
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
                      x="-140" 
                      y={showTooltipBelow ? "-5" : "-75"} 
                      width="280" 
                      height={showTooltipBelow ? "80" : "80"}
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
                    {/* Use foreignObject for text wrapping */}
                    <foreignObject 
                      x="-135" 
                      y={showTooltipBelow ? "0" : "-70"} 
                      width="270" 
                      height="75"
                    >
                      <div 
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          padding: '8px',
                          textAlign: 'center',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        <div 
                          style={{
                            color: '#1e3a8a',
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            marginBottom: '4px',
                            lineHeight: '1.4'
                          }}
                        >
                          {step.desc.en || "Ready to start..."}
                        </div>
                        <div 
                          style={{
                            color: '#3b82f6',
                            fontSize: '11px',
                            fontWeight: '500',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            lineHeight: '1.4'
                          }}
                        >
                          {step.desc.zh || "准备开始..."}
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                )}
              </>
            )}
          </g>
        </svg>
      </div>
      
      <div className="bg-gray-50 p-2 mt-2 rounded border text-xs font-mono text-gray-500 flex justify-between">
        <span>Current State: {nodeCharMap[step.node] || step.node} {step.node !== undefined && step.node !== 0 && `(id: ${step.node})`}</span>
        <span>Processing Char: {step.char || '-'}</span>
      </div>
    </div>
  );
};

