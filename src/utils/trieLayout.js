// Helper: Trie Layout Calculation
export const calculateTrieLayout = (trie) => {
  if (!trie || trie.length === 0) return { nodes: [], links: [], width: 0, height: 0 };

  const levels = [];
  const nodes = trie.map((n, i) => ({ ...n, id: i, x: 0, y: 0, depth: 0 }));
  const links = [];

  // BFS for Hierarchy
  const visited = new Set();
  const bfsQ = [{ id: 0, depth: 0 }];
  visited.add(0);

  while(bfsQ.length > 0) {
      const { id, depth } = bfsQ.shift();
      nodes[id].depth = depth;
      
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(id);

      // Add children to queue
      Object.entries(trie[id].next).forEach(([char, childId]) => {
          if(!visited.has(childId)) {
              visited.add(childId);
              bfsQ.push({ id: childId, depth: depth + 1 });
              links.push({ source: id, target: childId, label: char, type: 'next' });
          }
      });
  }

  // Layout
  const levelHeight = 60; // Reduced from 80 to make graph more compact vertically
  const nodeSpacing = 70;
  const maxNodesInLevel = Math.max(...levels.map(l => l.length));
  const width = Math.max(600, maxNodesInLevel * nodeSpacing + 100);
  const height = levels.length * levelHeight + 40; // Reduced padding from 60 to 40

  levels.forEach((levelNodes, depth) => {
      const totalW = width;
      const step = totalW / (levelNodes.length + 1);
      levelNodes.forEach((nodeId, idx) => {
          nodes[nodeId].x = step * (idx + 1);
          nodes[nodeId].y = depth * levelHeight + 20; // Reduced from 40 to 20 for more compact layout
      });
  });

  // Add Fail Links (filtered for clarity)
  trie.forEach((node, id) => {
      if (node.fail !== undefined && node.fail !== 0 && id !== 0) {
          links.push({ source: id, target: node.fail, type: 'fail', label: '' });
      }
  });

  return { nodes, links, width, height };
};

