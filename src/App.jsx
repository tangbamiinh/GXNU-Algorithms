import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Info, Hash, CornerDownRight, HelpCircle } from 'lucide-react';

// --- Constants & Styles ---
const COLORS = {
  primary: '#1e3a8a', // Deep Blue
  secondary: '#3b82f6', // Light Blue
  accent: '#f97316', // Orange
  success: '#22c55e', // Green
  error: '#ef4444', // Red
  neutral: '#f3f4f6', // Grey
  text: '#1f2937',
  subtext: '#6b7280',
};

const Card = ({ children, title, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col ${className}`}>
    {title && (
      <div className="bg-blue-900 text-white px-3 py-2 font-semibold border-b border-blue-800 flex-shrink-0 text-sm">
        {title}
      </div>
    )}
    <div className="p-3 flex-1 flex flex-col min-h-0">{children}</div>
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const styles = {
    blue: "bg-blue-100 text-blue-800",
    orange: "bg-orange-100 text-orange-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${styles[color] || styles.gray}`}>
      {children}
    </span>
  );
};

// Tooltip Component
const Tooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const positions = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  // Calculate position for fixed tooltip
  const [tooltipStyle, setTooltipStyle] = useState({});

  const updateTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    if (position === 'top') {
      top = triggerRect.top - tooltipRect.height - 8;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    } else if (position === 'bottom') {
      top = triggerRect.bottom + 8;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    } else if (position === 'left') {
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.left - tooltipRect.width - 8;
    } else {
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.right + 8;
    }
    
    // Ensure tooltip stays within viewport
    const padding = 10;
    if (top < padding) top = padding;
    if (left < padding) left = padding;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding;
    }
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    
    setTooltipStyle({ top: `${top}px`, left: `${left}px` });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
    setTimeout(updateTooltipPosition, 0);
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-normal w-64 pointer-events-none"
          style={tooltipStyle}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="font-semibold mb-1">{content.title}</div>
          <div className="text-gray-300">{content.description}</div>
          {content.zh && (
            <div className="text-gray-400 mt-1 text-xs border-t border-gray-700 pt-1">{content.zh}</div>
          )}
          <div className={`absolute ${position === 'top' ? 'top-full' : 'bottom-full'} left-1/2 transform -translate-x-1/2 -mt-1`}>
            <div className={`w-2 h-2 bg-gray-900 transform rotate-45 ${position === 'top' ? '' : 'rotate-180'}`}></div>
          </div>
        </div>
      )}
    </>
  );
};

// Visualization Title with Tooltip Component
const VizTitle = ({ title, tooltip }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</span>
    {tooltip && (
      <Tooltip content={tooltip}>
        <HelpCircle size={14} className="text-gray-600 hover:text-gray-800 cursor-help" />
      </Tooltip>
    )}
  </div>
);

// --- Helper: Trie Layout Calculation ---
const calculateTrieLayout = (trie) => {
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


// --- Algorithm Logic Generators ---

const generateNaiveSteps = (text, pattern) => {
  const steps = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return steps;

  let totalComparisons = 0;
  const matches = [];
  const comparisonHistory = [];

  for (let i = 0; i <= n - m; i++) {
    steps.push({
      type: 'shift',
      i, j: 0,
      highlight: [],
      comparisons: totalComparisons,
      matches: [...matches],
      desc: { en: `Shift pattern to index ${i}.`, zh: `将模式串移动到索引 ${i}。` }
    });

    let match = true;
    for (let j = 0; j < m; j++) {
      totalComparisons++;
      comparisonHistory.push({ i, j, textChar: text[i + j], patternChar: pattern[j], match: text[i + j] === pattern[j] });
      
      steps.push({
        type: 'compare',
        i, j,
        highlight: [i + j],
        match: text[i + j] === pattern[j],
        comparisons: totalComparisons,
        matches: [...matches],
        comparisonHistory: [...comparisonHistory],
        desc: {
          en: `Compare T[${i + j}] ('${text[i + j]}') with P[${j}] ('${pattern[j]}').`,
          zh: `比较主串 T[${i + j}] ('${text[i + j]}') 和模式串 P[${j}] ('${pattern[j]}')。`
        }
      });

      if (text[i + j] !== pattern[j]) {
        match = false;
        steps.push({
          type: 'mismatch',
          i, j,
          highlight: [i + j],
          comparisons: totalComparisons,
          matches: [...matches],
          comparisonHistory: [...comparisonHistory],
          desc: { en: "Mismatch found. Break loop.", zh: "发现不匹配。跳出循环。" }
        });
        break;
      }
    }

    if (match) {
      matches.push({ start: i, end: i + m - 1 });
      steps.push({
        type: 'match',
        i, j: m - 1,
        highlight: Array.from({ length: m }, (_, k) => i + k),
        comparisons: totalComparisons,
        matches: [...matches],
        comparisonHistory: [...comparisonHistory],
        desc: { en: `Pattern found at index ${i}!`, zh: `在索引 ${i} 处找到模式串！` }
      });
    }
  }
  return steps;
};

const generateKMPSteps = (text, pattern) => {
  const steps = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return steps;

  // Build Next Table (LPS)
  const lps = Array(m).fill(0);
  let len = 0;
  let i_lps = 1;
  while (i_lps < m) {
    if (pattern[i_lps] === pattern[len]) {
      len++;
      lps[i_lps] = len;
      i_lps++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i_lps] = 0;
        i_lps++;
      }
    }
  }

  // Search
  let i = 0;
  let j = 0;
  let totalComparisons = 0;
  const matches = [];
  const jumpHistory = [];

  steps.push({
    type: 'init',
    i, j,
    nextTable: lps,
    comparisons: 0,
    matches: [],
    jumpHistory: [],
    desc: { en: "Initialize KMP. Calculate Next (LPS) table.", zh: "初始化 KMP。计算 Next (最长公共前缀后缀) 表。" }
  });

  while (i < n) {
    totalComparisons++;
    steps.push({
      type: 'compare',
      i, j,
      nextTable: lps,
      match: text[i] === pattern[j],
      comparisons: totalComparisons,
      matches: [...matches],
      jumpHistory: [...jumpHistory],
      desc: { 
        en: `Compare T[${i}] ('${text[i]}') with P[${j}] ('${pattern[j]}').`, 
        zh: `比较 T[${i}] ('${text[i]}') 和 P[${j}] ('${pattern[j]}')。` 
      }
    });

    if (pattern[j] === text[i]) {
      i++;
      j++;
      if (j === m) {
        matches.push({ start: i - j, end: i - 1 });
        steps.push({
          type: 'match',
          i: i - j, j: m - 1,
          nextTable: lps,
          comparisons: totalComparisons,
          matches: [...matches],
          jumpHistory: [...jumpHistory],
          desc: { en: `Pattern found at index ${i - j}!`, zh: `在索引 ${i - j} 处找到模式串！` }
        });
        let oldJ = j;
        j = lps[j - 1];
        jumpHistory.push({ from: oldJ, to: j, reason: 'match' });
        steps.push({
          type: 'jump',
          i, j,
          nextTable: lps,
          comparisons: totalComparisons,
          matches: [...matches],
          jumpHistory: [...jumpHistory],
          desc: { en: `Jump pattern index j to ${j} (from Next table).`, zh: `根据 Next 表将模式串索引 j 跳转到 ${j}。` }
        });
      }
    } else {
      if (j !== 0) {
        let oldJ = j;
        j = lps[j - 1];
        jumpHistory.push({ from: oldJ, to: j, reason: 'mismatch', position: i });
        steps.push({
          type: 'jump',
          i, j,
          nextTable: lps,
          comparisons: totalComparisons,
          matches: [...matches],
          jumpHistory: [...jumpHistory],
          desc: { 
            en: `Mismatch at P[${oldJ}]. Jump j to ${j} (Next[${oldJ-1}]). i stays at ${i}.`, 
            zh: `P[${oldJ}] 处不匹配。j 跳转到 ${j} (Next[${oldJ-1}])。i 保持在 ${i}。` 
          }
        });
      } else {
        i++;
        steps.push({
          type: 'shift',
          i, j,
          nextTable: lps,
          comparisons: totalComparisons,
          matches: [...matches],
          jumpHistory: [...jumpHistory],
          desc: { en: `Mismatch at start. Increment i to ${i}.`, zh: `起始位置不匹配。将 i 增加到 ${i}。` }
        });
      }
    }
  }
  return steps;
};

const generateRKSteps = (text, pattern) => {
  const steps = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return steps;

  const d = 256;
  const q = 101;
  let p = 0;
  let t = 0;
  let h = 1;

  for (let i = 0; i < m - 1; i++) {
    h = (h * d) % q;
  }

  for (let i = 0; i < m; i++) {
    p = (d * p + pattern.charCodeAt(i)) % q;
    t = (d * t + text.charCodeAt(i)) % q;
  }

  const matches = [];
  const hashHistory = [];
  let hashCollisions = 0;

  steps.push({
    type: 'init',
    i: 0,
    hp: p, ht: t,
    h: h,
    d: d,
    q: q,
    matches: [],
    hashHistory: [],
    hashCollisions: 0,
    desc: { 
      en: `Calculate initial hashes. Hp(Pattern) = ${p}, Ht(Text window 0) = ${t}.`, 
      zh: `计算初始哈希值。Hp(模式串) = ${p}，Ht(文本窗口0) = ${t}。` 
    }
  });

  for (let i = 0; i <= n - m; i++) {
    hashHistory.push({ i, hash: t });
    steps.push({
      type: 'compare_hash',
      i, hp: p, ht: t,
      h: h,
      d: d,
      q: q,
      match: p === t,
      matches: [...matches],
      hashHistory: [...hashHistory],
      hashCollisions: hashCollisions,
      desc: { 
        en: `Window at ${i}. Compare Hash: ${p} vs ${t}.`, 
        zh: `窗口在 ${i}。比较哈希值：${p} vs ${t}。` 
      }
    });

    if (p === t) {
      steps.push({
        type: 'check_chars',
        i, hp: p, ht: t,
        h: h,
        d: d,
        q: q,
        matches: [...matches],
        hashHistory: [...hashHistory],
        hashCollisions: hashCollisions,
        desc: { en: "Hashes match! Check characters one by one.", zh: "哈希值匹配！逐个检查字符。" }
      });
      
      let match = true;
      for (let j = 0; j < m; j++) {
        steps.push({
            type: 'verify',
            i, j, hp: p, ht: t,
            h: h,
            d: d,
            q: q,
            matches: [...matches],
            hashHistory: [...hashHistory],
            hashCollisions: hashCollisions,
            match: text[i+j] === pattern[j],
            desc: { en: `Checking T[${i+j}] === P[${j}]...`, zh: `检查 T[${i+j}] === P[${j}]...` }
        });
        if (text[i + j] !== pattern[j]) {
          match = false;
          hashCollisions++;
          break;
        }
      }

      if (match) {
        matches.push({ start: i, end: i + m - 1 });
        steps.push({
          type: 'match',
          i, hp: p, ht: t,
          h: h,
          d: d,
          q: q,
          matches: [...matches],
          hashHistory: [...hashHistory],
          hashCollisions: hashCollisions,
          desc: { en: `Pattern found at index ${i}.`, zh: `在索引 ${i} 处找到模式串。` }
        });
      } else {
        hashCollisions++;
      }
    }

    if (i < n - m) {
      let oldT = t;
      t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
      if (t < 0) t = (t + q);
      steps.push({
        type: 'roll',
        i: i + 1,
        hp: p, ht: t,
        prevHt: oldT,
        removed: text[i],
        added: text[i + m],
        h: h,
        d: d,
        q: q,
        matches: [...matches],
        hashHistory: [...hashHistory],
        hashCollisions: hashCollisions,
        desc: { 
          en: `Rolling Hash: Remove '${text[i]}', add '${text[i+m]}'.`, 
          zh: `滚动哈希：移除 '${text[i]}'，添加 '${text[i+m]}'。` 
        }
      });
    }
  }
  return steps;
};

const generateACSteps = (text, patternsInput) => {
  const steps = [];
  const patterns = patternsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (patterns.length === 0) return steps;

  // Build Trie
  const trie = [{ next: {}, fail: 0, output: [] }];
  
  patterns.forEach((pat, patIdx) => {
    let u = 0;
    for (let char of pat) {
      if (!trie[u].next[char]) {
        trie[u].next[char] = trie.length;
        trie.push({ next: {}, fail: 0, output: [] });
      }
      u = trie[u].next[char];
    }
    trie[u].output.push(pat);
  });

  // Build Failure Links
  const queue = [];
  for (let char in trie[0].next) {
    const v = trie[0].next[char];
    trie[v].fail = 0;
    queue.push(v);
  }

  while (queue.length > 0) {
    const u = queue.shift();
    for (let char in trie[u].next) {
      const v = trie[u].next[char];
      let f = trie[u].fail;
      while (f > 0 && !trie[f].next[char]) {
        f = trie[f].fail;
      }
      trie[v].fail = trie[f].next[char] || 0;
      trie[v].output = [...trie[v].output, ...trie[trie[v].fail].output];
      queue.push(v);
    }
  }

  const layout = calculateTrieLayout(trie);

  let u = 0;
  const allMatches = []; // Track all matches found so far
  const stateHistory = [0]; // Track state transition history
  const matchHistory = []; // Track chronological match history
  
  steps.push({
    type: 'init',
    trie, layout,
    node: 0,
    i: -1,
    matches: [],
    stateHistory: [0],
    matchHistory: [],
    desc: { en: "AC Automaton Built. Ready to search.", zh: "AC 自动机已构建。准备搜索。" }
  });
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    steps.push({
        type: 'input',
        trie, layout, node: u, i,
        char,
        matches: [...allMatches],
        stateHistory: [...stateHistory],
        matchHistory: [...matchHistory],
        desc: { en: `Read character '${char}'. Current State: ${u}.`, zh: `读取字符 '${char}'。当前状态：${u}。` }
    });

    // Track failure link path
    const failPath = [];
    let tempU = u;
    while (tempU > 0 && !trie[tempU].next[char]) {
      failPath.push(tempU);
      tempU = trie[tempU].fail;
    }
    failPath.push(tempU); // Include final state

    while (u > 0 && !trie[u].next[char]) {
      let prev = u;
      u = trie[u].fail;
      stateHistory.push(u);
      steps.push({
        type: 'fail',
        trie, layout, node: u, i,
        prevNode: prev,
        failPath: failPath,
        matches: [...allMatches],
        stateHistory: [...stateHistory],
        matchHistory: [...matchHistory],
        desc: { en: `No transition for '${char}'. Follow Fail link ${prev} -> ${u}.`, zh: `没有 '${char}' 的转移。跟随失败链接 ${prev} -> ${u}。` }
      });
    }

    if (trie[u].next[char]) {
      let prev = u;
      u = trie[u].next[char];
      stateHistory.push(u);
      steps.push({
        type: 'goto',
        trie, layout, node: u, i,
        prevNode: prev,
        transitionChar: char,
        matches: [...allMatches],
        stateHistory: [...stateHistory],
        matchHistory: [...matchHistory],
        desc: { en: `Transition ${prev} --${char}--> ${u}.`, zh: `状态转移 ${prev} --${char}--> ${u}。` }
      });
    }

    if (trie[u].output.length > 0) {
      // Calculate match positions for each found pattern
      const newMatches = [];
      trie[u].output.forEach(pattern => {
        const endPos = i;
        const startPos = endPos - pattern.length + 1;
        const matchEntry = { pattern, start: startPos, end: endPos, stepIndex: steps.length, charIndex: i, state: u };
        newMatches.push(matchEntry);
        allMatches.push(matchEntry);
        matchHistory.push(matchEntry);
      });
      
      steps.push({
        type: 'match',
        trie, layout, node: u, i,
        found: trie[u].output,
        newMatches: newMatches,
        matches: [...allMatches],
        stateHistory: [...stateHistory],
        matchHistory: [...matchHistory],
        desc: { en: `Output at state ${u}: ${trie[u].output.join(', ')}.`, zh: `状态 ${u} 输出：${trie[u].output.join(', ')}。` }
      });
    }
  }

  return steps;
};

// --- Algorithm Code Snippets ---

// Naive Algorithm Code
const NAIVE_CODE = [
  { line: 1, code: "int naive_search(string text, string pattern) {", phase: "search" },
  { line: 2, code: "    int n = text.length();", phase: "search" },
  { line: 3, code: "    int m = pattern.length();", phase: "search" },
  { line: 4, code: "", phase: "search" },
  { line: 5, code: "    for (int i = 0; i <= n - m; i++) {", phase: "search" },
  { line: 6, code: "        int j;", phase: "search" },
  { line: 7, code: "        for (j = 0; j < m; j++) {", phase: "search" },
  { line: 8, code: "            if (text[i + j] != pattern[j])", phase: "search" },
  { line: 9, code: "                break;", phase: "search" },
  { line: 10, code: "        }", phase: "search" },
  { line: 11, code: "        if (j == m)", phase: "search" },
  { line: 12, code: "            return i; // Pattern found", phase: "search" },
  { line: 13, code: "    }", phase: "search" },
  { line: 14, code: "    return -1; // Not found", phase: "search" },
  { line: 15, code: "}", phase: "search" },
];

// KMP Algorithm Code
const KMP_CODE = [
  { line: 1, code: "int kmp_search(string text, string pattern) {", phase: "search" },
  { line: 2, code: "    int n = text.length();", phase: "search" },
  { line: 3, code: "    int m = pattern.length();", phase: "search" },
  { line: 4, code: "    int lps[m];", phase: "search" },
  { line: 5, code: "    compute_lps(pattern, lps);", phase: "search" },
  { line: 6, code: "", phase: "search" },
  { line: 7, code: "    int i = 0, j = 0;", phase: "search" },
  { line: 8, code: "    while (i < n) {", phase: "search" },
  { line: 9, code: "        if (pattern[j] == text[i]) {", phase: "search" },
  { line: 10, code: "            i++; j++;", phase: "search" },
  { line: 11, code: "        }", phase: "search" },
  { line: 12, code: "        if (j == m) {", phase: "search" },
  { line: 13, code: "            return i - j; // Found", phase: "search" },
  { line: 14, code: "        } else if (i < n && pattern[j] != text[i]) {", phase: "search" },
  { line: 15, code: "            if (j != 0)", phase: "search" },
  { line: 16, code: "                j = lps[j - 1]; // Jump", phase: "search" },
  { line: 17, code: "            else", phase: "search" },
  { line: 18, code: "                i++;", phase: "search" },
  { line: 19, code: "        }", phase: "search" },
  { line: 20, code: "    }", phase: "search" },
  { line: 21, code: "    return -1;", phase: "search" },
  { line: 22, code: "}", phase: "search" },
];

// Rabin-Karp Algorithm Code
const RK_CODE = [
  { line: 1, code: "int rabin_karp(string text, string pattern) {", phase: "search" },
  { line: 2, code: "    int d = 256, q = 101;", phase: "search" },
  { line: 3, code: "    int m = pattern.length();", phase: "search" },
  { line: 4, code: "    int n = text.length();", phase: "search" },
  { line: 5, code: "    int h = 1, p = 0, t = 0;", phase: "search" },
  { line: 6, code: "", phase: "search" },
  { line: 7, code: "    // Calculate h = d^(m-1) % q", phase: "search" },
  { line: 8, code: "    for (int i = 0; i < m - 1; i++)", phase: "search" },
  { line: 9, code: "        h = (h * d) % q;", phase: "search" },
  { line: 10, code: "", phase: "search" },
  { line: 11, code: "    // Calculate initial hash values", phase: "search" },
  { line: 12, code: "    for (int i = 0; i < m; i++) {", phase: "search" },
  { line: 13, code: "        p = (d * p + pattern[i]) % q;", phase: "search" },
  { line: 14, code: "        t = (d * t + text[i]) % q;", phase: "search" },
  { line: 15, code: "    }", phase: "search" },
  { line: 16, code: "", phase: "search" },
  { line: 17, code: "    for (int i = 0; i <= n - m; i++) {", phase: "search" },
  { line: 18, code: "        if (p == t) {", phase: "search" },
  { line: 19, code: "            // Verify by comparing characters", phase: "search" },
  { line: 20, code: "            if (text.substr(i, m) == pattern)", phase: "search" },
  { line: 21, code: "                return i;", phase: "search" },
  { line: 22, code: "        }", phase: "search" },
  { line: 23, code: "        if (i < n - m) {", phase: "search" },
  { line: 24, code: "            // Rolling hash", phase: "search" },
  { line: 25, code: "            t = (d * (t - text[i] * h) + text[i+m]) % q;", phase: "search" },
  { line: 26, code: "            if (t < 0) t += q;", phase: "search" },
  { line: 27, code: "        }", phase: "search" },
  { line: 28, code: "    }", phase: "search" },
  { line: 29, code: "    return -1;", phase: "search" },
  { line: 30, code: "}", phase: "search" },
];

// AC Algorithm Code (from textbook)
const AC_CODE = [
  { line: 1, code: "int mult_search(const string& text) {", phase: "search" },
  { line: 2, code: "    int cnt = 0;", phase: "search" },
  { line: 3, code: "    tnode *cur = root;", phase: "search" },
  { line: 4, code: "", phase: "search" },
  { line: 5, code: "    for(int i=0; i < text.length(); ++i) {", phase: "search" },
  { line: 6, code: "        // Read character and check transition", phase: "search" },
  { line: 7, code: "        if (cur->go[idx[text[i]]] != root) {", phase: "search" },
  { line: 8, code: "            cur = cur->go[idx[text[i]]];", phase: "search" },
  { line: 9, code: "", phase: "search" },
  { line: 10, code: "            if(cur->cnt) {", phase: "search" },
  { line: 11, code: "                cnt += cur->cnt;", phase: "search" },
  { line: 12, code: "                outout(cur); // Print matches", phase: "search" },
  { line: 13, code: "            }", phase: "search" },
  { line: 14, code: "        }", phase: "search" },
  { line: 15, code: "    }", phase: "search" },
  { line: 16, code: "    return cnt;", phase: "search" },
  { line: 17, code: "}", phase: "search" },
];

// Map step types to code lines with context
const getCodeLineForStep = (algo, stepType, step) => {
  if (algo === 'naive') {
    if (stepType === 'shift') return 5;
    if (stepType === 'compare') return 8;
    if (stepType === 'mismatch') return 9;
    if (stepType === 'match') return 12;
    return null;
  }
  
  if (algo === 'kmp') {
    if (stepType === 'init') return 5;
    if (stepType === 'compare') return 9;
    if (stepType === 'match') return 13;
    if (stepType === 'jump') return 16;
    if (stepType === 'shift') return 18;
    return null;
  }
  
  if (algo === 'rk') {
    if (stepType === 'init') return 12;
    if (stepType === 'compare_hash') return 18;
    if (stepType === 'check_chars') return 19;
    if (stepType === 'verify') return 20;
    if (stepType === 'match') return 21;
    if (stepType === 'roll') return 25;
    return null;
  }
  
  if (algo === 'ac') {
    if (stepType === 'input') return 5;
    if (stepType === 'goto') return 8;
    if (stepType === 'match') return 10;
    if (stepType === 'fail') return 7;
    return null;
  }
  
  return null;
};

// Code Viewer Component
const CodeViewer = ({ code, highlightedLine, stepType, showTitle = true, fileName, algorithmName }) => {
  const codeRef = useRef(null);
  const highlightedRef = useRef(null);


  const renderCodeLine = (item, idx) => {
    const isHighlighted = highlightedLine === item.line;
    const isEmpty = !item.code || item.code.trim() === '';
    
    // Syntax highlighting for keywords
    const renderSyntax = (line) => {
      const keywords = ['int', 'const', 'string', 'for', 'if', 'return', 'while'];
      const types = ['tnode', 'root'];
      const operators = ['->', '!=', '++', '+=', '='];
      
      let parts = [{ text: line, type: 'normal' }];
      
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        parts = parts.flatMap(p => {
          if (p.type !== 'normal') return [p];
          const matches = [...p.text.matchAll(regex)];
          if (matches.length === 0) return [p];
          
          const result = [];
          let lastIndex = 0;
          matches.forEach(match => {
            if (match.index > lastIndex) {
              result.push({ text: p.text.substring(lastIndex, match.index), type: 'normal' });
            }
            result.push({ text: match[0], type: 'keyword' });
            lastIndex = match.index + match[0].length;
          });
          if (lastIndex < p.text.length) {
            result.push({ text: p.text.substring(lastIndex), type: 'normal' });
          }
          return result;
        });
      });
      
      return parts.map((part, i) => {
        if (part.type === 'keyword') {
          return <span key={i} className="text-purple-400">{part.text}</span>;
        }
        if (part.text.includes('//')) {
          const [code, comment] = part.text.split('//');
          return (
            <span key={i}>
              {code}
              <span className="text-green-400">//{comment}</span>
            </span>
          );
        }
        return <span key={i}>{part.text}</span>;
      });
    };

    return (
      <div
        key={idx}
        ref={isHighlighted ? highlightedRef : null}
        className={`flex ${
          isHighlighted 
            ? 'bg-blue-900/60 border-l-4 border-blue-400 text-blue-50 shadow-lg' 
            : isEmpty
            ? 'text-gray-600'
            : 'text-gray-300 hover:bg-gray-800/50'
        } px-3 py-0 transition-all duration-200`}
      >
        <span className={`mr-4 w-8 text-right select-none ${
          isHighlighted ? 'text-blue-300 font-bold' : 'text-gray-500'
        }`}>
          {item.line}
        </span>
        <span className="flex-1 font-mono text-sm whitespace-pre leading-tight">
          {isEmpty ? '\u00A0' : renderSyntax(item.code)}
        </span>
        {isHighlighted && (
          <span className="ml-3 text-blue-400 animate-pulse flex items-center">
            <span className="mr-1">●</span>
            <span className="text-xs">executing</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-xl flex flex-col h-full"
      onWheel={(e) => {
        const codeElement = codeRef.current;
        if (!codeElement) return;
        
        const { scrollTop, scrollHeight, clientHeight } = codeElement;
        const maxScroll = scrollHeight - clientHeight;
        const canScrollUp = scrollTop > 0;
        const canScrollDown = scrollTop < maxScroll;
        
        // If we can scroll within the code block, prevent browser scroll
        if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
          e.preventDefault();
          e.stopPropagation();
          codeElement.scrollTop += e.deltaY;
        }
      }}
      style={{ overscrollBehavior: 'contain' }}
    >
      {showTitle && (
        <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-300 text-xs font-mono ml-3 font-semibold">{fileName || 'mult_search.cpp'}</span>
          </div>
          <span className="text-gray-500 text-xs">{algorithmName || 'Aho-Corasick Algorithm'}</span>
        </div>
      )}
      <div ref={codeRef} className="overflow-y-auto overflow-x-hidden bg-gray-950 flex-1 min-h-0" style={{ overscrollBehavior: 'contain' }}>
        <div className="py-0.5">
          {code.map((item, idx) => renderCodeLine(item, idx))}
        </div>
      </div>
    </div>
  );
};

// Transition Table Component
const TransitionTable = ({ trie, currentNode, transitionChar, stepType, showTitle = true }) => {
  if (!trie || trie.length === 0) return null;
  
  // Get all unique characters used in transitions
  const allChars = new Set();
  trie.forEach(node => {
    Object.keys(node.next).forEach(char => allChars.add(char));
  });
  const sortedChars = Array.from(allChars).sort();
  
  // Limit display to reasonable number of states
  const maxStates = Math.min(15, trie.length);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Transition Table / 转移表
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 sticky top-0">
              <th className="px-2 py-2 text-left border-r border-gray-300 font-semibold">State / 状态</th>
              {sortedChars.map(char => (
                <th key={char} className={`px-2 py-2 text-center border-r border-gray-300 font-semibold ${
                  stepType === 'goto' && transitionChar === char ? 'bg-blue-100' : ''
                }`}>
                  '{char}'
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trie.slice(0, maxStates).map((node, stateId) => (
              <tr 
                key={stateId} 
                className={`border-b border-gray-200 hover:bg-gray-50 ${
                  currentNode === stateId ? 'bg-blue-50 font-semibold' : ''
                }`}
              >
                <td className={`px-2 py-2 border-r border-gray-300 ${
                  currentNode === stateId ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {stateId}
                  {node.output.length > 0 && (
                    <span className="ml-1 text-green-600">★</span>
                  )}
                </td>
                {sortedChars.map(char => {
                  const nextState = node.next[char];
                  const isActive = currentNode === stateId && stepType === 'goto' && transitionChar === char;
                  return (
                    <td 
                      key={char}
                      className={`px-2 py-2 text-center border-r border-gray-300 ${
                        isActive 
                          ? 'bg-blue-200 font-bold text-blue-800 animate-pulse' 
                          : nextState !== undefined 
                            ? 'text-gray-700' 
                            : 'text-gray-300'
                      }`}
                    >
                      {nextState !== undefined ? nextState : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {trie.length > maxStates && (
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
            Showing first {maxStates} of {trie.length} states
          </div>
        )}
      </div>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex-shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-50 border border-blue-300"></span>
            Current State
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-200"></span>
            Active Transition
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-600">★</span>
            Output State
          </span>
        </div>
      </div>
    </div>
  );
};

// Match History Timeline Component
const MatchHistoryTimeline = ({ matchHistory, currentStep, showTitle = true }) => {
  if (!matchHistory || matchHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No matches found yet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Match History / 匹配历史
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {matchHistory.map((match, idx) => (
            <div 
              key={idx}
              className="bg-green-50 border-l-4 border-green-500 p-2 rounded-r shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-green-800">{match.pattern}</span>
                  <span className="text-xs text-gray-600 ml-2">
                    at position [{match.start}-{match.end}]
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Step {match.stepIndex + 1} • Char {match.charIndex}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                State: {match.state} • Found: "{match.pattern}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// State Transition History Component
const StateTransitionHistory = ({ stateHistory, currentNode, stepType, showTitle = true }) => {
  if (!stateHistory || stateHistory.length === 0) return null;
  
  // Get last 20 states for display
  const recentStates = stateHistory.slice(-20);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          State History / 状态历史
        </div>
      )}
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {recentStates.map((state, idx) => {
            const isCurrent = idx === recentStates.length - 1 && stepType !== 'init';
            const isPrevious = idx === recentStates.length - 2;
            return (
              <div key={idx} className="flex items-center">
                <div className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                  isCurrent 
                    ? 'bg-blue-100 border-blue-500 text-blue-800 font-bold scale-110 shadow-md' 
                    : isPrevious
                    ? 'bg-gray-100 border-gray-400 text-gray-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600'
                }`}>
                  {state}
                </div>
                {idx < recentStates.length - 1 && (
                  <span className="mx-1 text-gray-400">→</span>
                )}
              </div>
            );
          })}
          {stateHistory.length > 20 && (
            <span className="text-xs text-gray-400 ml-2">
              ... ({stateHistory.length - 20} earlier)
            </span>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Total transitions: {stateHistory.length - 1}
        </div>
      </div>
    </div>
  );
};

// Output Set Visualization Component
const OutputSetVisualization = ({ trie, currentNode, showTitle = true }) => {
  if (!trie || trie.length === 0) return null;
  
  const outputStates = trie
    .map((node, idx) => ({ state: idx, outputs: node.output }))
    .filter(item => item.outputs.length > 0);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Output Sets / 输出集合
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {outputStates.map(({ state, outputs }) => (
            <div 
              key={state}
              className={`p-2 rounded border ${
                state === currentNode 
                  ? 'bg-blue-50 border-blue-400 shadow-sm' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${
                  state === currentNode ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  State {state}
                </span>
                {state === currentNode && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">Current</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {outputs.map((pattern, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-300"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Character Processing Flow Component
const CharacterProcessingFlow = ({ step, text, showTitle = true }) => {
  if (!step || step.i === undefined) return null;
  
  const currentChar = text[step.i];
  const flowSteps = [];
  
  if (step.type === 'input') {
    flowSteps.push({ label: 'Read Char', value: `'${currentChar}'`, color: 'blue' });
    flowSteps.push({ label: 'Check Transition', value: `State ${step.node}`, color: 'yellow' });
  } else if (step.type === 'fail') {
    flowSteps.push({ label: 'No Transition', value: `'${currentChar}'`, color: 'red' });
    flowSteps.push({ label: 'Follow Fail', value: `${step.prevNode} → ${step.node}`, color: 'orange' });
  } else if (step.type === 'goto') {
    flowSteps.push({ label: 'Transition Found', value: `${step.prevNode} --${step.transitionChar}--> ${step.node}`, color: 'green' });
  } else if (step.type === 'match') {
    flowSteps.push({ label: 'Check Output', value: `State ${step.node}`, color: 'purple' });
    flowSteps.push({ label: 'Match Found', value: step.found.join(', '), color: 'green' });
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Processing Flow / 处理流程
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-3">
          {flowSteps.map((flowStep, idx) => {
            const colors = {
              blue: 'bg-blue-100 border-blue-400 text-blue-800',
              yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
              red: 'bg-red-100 border-red-400 text-red-800',
              orange: 'bg-orange-100 border-orange-400 text-orange-800',
              green: 'bg-green-100 border-green-400 text-green-800',
              purple: 'bg-purple-100 border-purple-400 text-purple-800',
            };
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className={`px-3 py-2 rounded-lg border-2 ${colors[flowStep.color] || 'bg-gray-100'} font-medium text-sm`}>
                  {flowStep.label}
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex-1 font-mono text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {flowStep.value}
                </div>
              </div>
            );
          })}
        </div>
        {step.i !== undefined && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>Position: {step.i} / {text.length - 1}</div>
              <div>Character: '{currentChar}'</div>
              <div>State: {step.node}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Optimization Visualization Component
const OptimizationVisualization = ({ trie, currentNode, transitionChar, showTitle = true }) => {
  if (!trie || currentNode === undefined) return null;
  
  const currentNodeData = trie[currentNode];
  if (!currentNodeData) return null;
  
  // Show optimized transitions (direct go vs following fail)
  const optimizedTransitions = [];
  Object.keys(currentNodeData.next).forEach(char => {
    const directState = currentNodeData.next[char];
    optimizedTransitions.push({
      char,
      directState,
      isOptimized: true,
      isActive: transitionChar === char
    });
  });
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Optimized Transitions / 优化转移
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="mb-3 text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
          <strong>Optimization:</strong> Direct transitions (O(1)) instead of following fail links
        </div>
        <div className="space-y-2">
          {optimizedTransitions.length > 0 ? (
            optimizedTransitions.map((trans, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded border ${
                  trans.isActive 
                    ? 'bg-blue-100 border-blue-400 shadow-sm' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">'{trans.char}'</span>
                  <span className="text-gray-400">→</span>
                  <span className={`font-bold ${
                    trans.isActive ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    State {trans.directState}
                  </span>
                  {trans.isActive && (
                    <span className="ml-auto text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Direct transition (optimized)
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              No transitions from state {currentNode}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Failure Link Tree Component
const FailureLinkTree = ({ trie, layout, currentNode, stepType, showTitle = true }) => {
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

// Match Counter & Statistics Component
const MatchCounterStats = ({ matches, matchHistory, patterns, showTitle = true }) => {
  const totalMatches = matches?.length || 0;
  const patternCounts = {};
  
  if (matches) {
    matches.forEach(m => {
      patternCounts[m.pattern] = (patternCounts[m.pattern] || 0) + 1;
    });
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Statistics / 统计信息
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-4">
          {/* Total Matches */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">Total Matches</div>
            <div className="text-2xl font-bold text-blue-800">{totalMatches}</div>
          </div>
          
          {/* Per Pattern Counts */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Matches per Pattern</div>
            <div className="space-y-1">
              {Object.entries(patternCounts).map(([pattern, count]) => (
                <div key={pattern} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="font-mono text-sm text-gray-700">{pattern}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Stats */}
          {matchHistory && matchHistory.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                <div>First match: Step {matchHistory[0]?.stepIndex + 1}</div>
                <div>Last match: Step {matchHistory[matchHistory.length - 1]?.stepIndex + 1}</div>
                <div>Unique patterns: {Object.keys(patternCounts).length}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Algorithm-Specific Visualization Components ---

// Naive Algorithm Visualizations
const NaiveMatchHistory = ({ matches, showTitle = true }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No matches found yet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Match History / 匹配历史
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {matches.map((match, idx) => (
            <div key={idx} className="bg-green-50 border-l-4 border-green-500 p-2 rounded-r shadow-sm">
              <div className="font-bold text-green-800">Match #{idx + 1}</div>
              <div className="text-xs text-gray-600 mt-1">Position: [{match.start}-{match.end}]</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NaiveStatistics = ({ comparisons, matches, textLength, patternLength, showTitle = true }) => {
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

// KMP Algorithm Visualizations
const KMPJumpVisualization = ({ jumpHistory, nextTable, showTitle = true }) => {
  if (!jumpHistory || jumpHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No jumps yet</p>
      </div>
    );
  }
  
  const recentJumps = jumpHistory.slice(-10);
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Jump History / 跳转历史
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {recentJumps.map((jump, idx) => (
            <div key={idx} className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded-r">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-800">j: {jump.from}</span>
                <span className="text-gray-400">→</span>
                <span className="font-bold text-purple-800">j: {jump.to}</span>
                {jump.reason === 'mismatch' && (
                  <span className="ml-auto text-xs text-gray-500">at position {jump.position}</span>
                )}
              </div>
              {nextTable && jump.from > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Using Next[{jump.from - 1}] = {nextTable[jump.from - 1]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KMPStatistics = ({ comparisons, matches, textLength, patternLength, showTitle = true }) => {
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
          <div>Time Complexity: O(n + m)</div>
          <div>Space Complexity: O(m)</div>
          <div>Efficiency: Better than Naive!</div>
        </div>
      </div>
    </div>
  );
};

// Rabin-Karp Algorithm Visualizations
const RKHashDetails = ({ step, showTitle = true }) => {
  if (!step || step.hp === undefined) return null;
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Hash Details / 哈希详情
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3 space-y-3">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-indigo-800 mb-2">Parameters</div>
          <div className="text-xs text-gray-700 space-y-1">
            <div>Base (d): {step.d || 256}</div>
            <div>Modulus (q): {step.q || 101}</div>
            <div>Multiplier (h): {step.h || 1}</div>
          </div>
        </div>
        {step.type === 'roll' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-yellow-800 mb-2">Rolling Hash Formula</div>
            <div className="text-xs text-gray-700 font-mono">
              H<sub>t</sub> = (d × (H<sub>t</sub> - T[i] × h) + T[i+m]) mod q
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Remove: '{step.removed}' | Add: '{step.added}'
            </div>
          </div>
        )}
        {step.hashCollisions !== undefined && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-red-800 mb-1">Hash Collisions</div>
            <div className="text-xl font-bold text-red-800">{step.hashCollisions}</div>
            <div className="text-xs text-gray-600 mt-1">False positives requiring verification</div>
          </div>
        )}
      </div>
    </div>
  );
};

const RKStatistics = ({ matches, hashCollisions, hashHistory, showTitle = true }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Statistics / 统计信息
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3 space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-green-600 mb-1">Matches Found</div>
          <div className="text-2xl font-bold text-green-800">{matches?.length || 0}</div>
        </div>
        {hashCollisions !== undefined && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs text-red-600 mb-1">Hash Collisions</div>
            <div className="text-2xl font-bold text-red-800">{hashCollisions}</div>
          </div>
        )}
        <div className="text-xs text-gray-600 space-y-1">
          <div>Time Complexity: O(n + m) average</div>
          <div>Space Complexity: O(1)</div>
          <div>Windows processed: {hashHistory?.length || 0}</div>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const ControlButton = ({ onClick, icon: Icon, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`p-2 rounded-full transition-colors ${disabled ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100 active:bg-blue-200'}`}
  >
    <Icon size={24} />
  </button>
);

// --- Main Application ---

const App = () => {
  const [algo, setAlgo] = useState('naive');
  const [text, setText] = useState('ababcabcacbab');
  const [pattern, setPattern] = useState('abcac');
  const [patternsAC, setPatternsAC] = useState('arrows, row, sun, under');
  
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const timerRef = useRef(null);
  const textInitializedRef = useRef(false);

  // Set appropriate default text when switching to AC algorithm
  useEffect(() => {
    if (algo === 'ac' && !textInitializedRef.current) {
      setText('arrows flew under the sun in a row');
      textInitializedRef.current = true;
    } else if (algo !== 'ac') {
      textInitializedRef.current = false;
    }
  }, [algo]);

  // Initialize Algorithm
  useEffect(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    let generatedSteps = [];
    
    switch (algo) {
      case 'naive':
        generatedSteps = generateNaiveSteps(text, pattern);
        break;
      case 'kmp':
        generatedSteps = generateKMPSteps(text, pattern);
        break;
      case 'rk':
        generatedSteps = generateRKSteps(text, pattern);
        break;
      case 'ac':
        generatedSteps = generateACSteps(text, patternsAC);
        break;
      default:
        break;
    }
    setSteps(generatedSteps);
  }, [algo, text, pattern, patternsAC]);

  // Timer Logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps.length, speed]);

  const step = steps[currentStep] || {};

  // Render Helpers
  const renderHighlightText = (str, activeIndices = [], color = 'bg-orange-200', matches = []) => {
    // Color palette for different patterns
    const matchColors = [
      'bg-green-200 border-green-400',
      'bg-purple-200 border-purple-400',
      'bg-pink-200 border-pink-400',
      'bg-yellow-200 border-yellow-400',
      'bg-cyan-200 border-cyan-400',
    ];
    
    // Create a map of index to match info
    const matchMap = new Map();
    matches.forEach((match, idx) => {
      for (let i = match.start; i <= match.end; i++) {
        if (!matchMap.has(i) || matchMap.get(i).priority < idx) {
          matchMap.set(i, { 
            pattern: match.pattern, 
            color: matchColors[idx % matchColors.length],
            priority: idx 
          });
        }
      }
    });
    
    return (
      <div className="flex font-mono text-lg overflow-x-auto pb-2 pt-3">
        {str.split('').map((char, idx) => {
           let bg = 'bg-white scale-100';
           let border = 'border-gray-200';
           let matchLabel = null;
           
           // Check if this index is part of a matched pattern
           if (matchMap.has(idx)) {
             const matchInfo = matchMap.get(idx);
             bg = `${matchInfo.color.split(' ')[0]} scale-110 shadow-sm`;
             border = matchInfo.color.split(' ')[1];
             // Show pattern label on first character of match
             if (idx === matches.find(m => m.start === idx)?.start) {
               matchLabel = matchInfo.pattern;
             }
           } else if (activeIndices.includes(idx)) {
               bg = `${color} scale-110 shadow-sm`;
               border = color.replace('bg-', 'border-').replace('200', '400');
           }
           
           return (
             <div key={idx} className={`flex flex-col items-center justify-center w-8 h-12 border mx-0.5 rounded transition-all duration-300 ease-in-out overflow-visible relative ${bg} ${border}`}>
               <span className="leading-none mt-2">{char || '\u00A0'}</span>
               <span className="text-[10px] text-gray-400 mt-0.5">{idx}</span>
               {matchLabel && (
                 <span className="absolute -top-5 text-[9px] font-bold text-gray-700 whitespace-nowrap bg-white px-1 rounded border border-gray-300 shadow-sm">
                   {matchLabel}
                 </span>
               )}
             </div>
           )
        })}
      </div>
    );
  };

  const renderKMPViz = () => {
    if (!step.nextTable) return null;
    return (
        <div className="mt-4 animate-fadeIn">
             <h3 className="font-semibold text-blue-800 mb-2">Next (LPS) Table <span className="text-sm font-normal text-gray-500 ml-1">/ Next(前缀)表</span>:</h3>
             <div className="flex font-mono text-sm">
                 {step.nextTable.map((val, idx) => (
                     <div key={idx} className={`flex flex-col w-8 border transition-colors duration-300 ${idx === step.j ? 'bg-yellow-200 border-yellow-500 scale-105' : 'bg-gray-50 border-gray-200'} text-center py-1`}>
                        <span className="font-bold">{val}</span>
                        <span className="text-[10px] text-gray-400">{pattern[idx]}</span>
                     </div>
                 ))}
             </div>
             <p className="text-sm text-gray-500 mt-1">
                 When mismatch happens at index <b>j</b>, jump to index <b>Next[j-1]</b>.
             </p>
        </div>
    );
  }

  const renderRKViz = () => {
    if (step.hp === undefined) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col items-center">
          <h4 className="font-bold text-indigo-900 flex items-center gap-2">
             <Hash size={16}/> Pattern Hash ($H_p$)
          </h4>
          <span className="text-xs font-normal text-indigo-400 mb-1">模式串哈希</span>
          <div className="text-3xl font-mono text-indigo-600">{step.hp}</div>
        </div>
        
        <div className={`p-4 rounded-lg border transition-all duration-500 flex flex-col items-center relative overflow-hidden ${step.match ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <h4 className="font-bold text-gray-800">Window Hash ($H_t$)</h4>
          <span className="text-xs font-normal text-gray-500 mb-2">当前窗口哈希</span>
          
          {/* Animated Hash Number */}
          <div key={step.ht} className="text-3xl font-mono animate-scaleIn">
             {step.ht}
          </div>

          {/* Rolling Animations */}
          <div className="flex gap-8 mt-2 text-xs font-mono h-6 relative w-full justify-center">
             {step.type === 'roll' && (
                 <>
                    <span className="text-red-500 animate-slideOutDown absolute left-[20%]">
                        -{step.removed}
                    </span>
                    <span className="text-green-600 animate-slideInUp absolute right-[20%]">
                        +{step.added}
                    </span>
                 </>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderACViz = () => {
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
  }

  return (
    <div className="min-h-screen bg-gray-100 p-1 md:p-2 font-sans text-gray-800">
      <style>{`
        @keyframes scaleIn {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideOutDown {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(10px); opacity: 0; }
        }
        @keyframes slideInUp {
            0% { transform: translateY(10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideOutDown { animation: slideOutDown 0.5s ease-out forwards; }
        .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; }
      `}</style>

      <div className="w-full space-y-2">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
                Algorithm Visualization
                <Badge color="blue">Chap 9.1</Badge>
            </h1>
            <p className="text-gray-500 mt-1">String Searching & Pattern Matching Mechanisms</p>
            <p className="text-gray-400 text-sm">字符串搜索与模式匹配机制</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0 overflow-x-auto">
            {['naive', 'kmp', 'rk', 'ac'].map(key => (
              <button
                key={key}
                onClick={() => setAlgo(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex flex-col items-center ${
                  algo === key 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>
                    {key === 'naive' && 'Naive'}
                    {key === 'kmp' && 'KMP'}
                    {key === 'rk' && 'Rabin-Karp'}
                    {key === 'ac' && 'Aho-Corasick'}
                </span>
                <span className="text-[10px] opacity-80 font-normal">
                    {key === 'naive' && '朴素算法'}
                    {key === 'kmp' && 'KMP算法'}
                    {key === 'rk' && 'RK算法'}
                    {key === 'ac' && 'AC自动机'}
                </span>
              </button>
            ))}
          </div>
        </header>

        {/* Configuration Panel - Above Visualization for AC algorithm */}
        {algo === 'ac' && (
          <Card title="Configuration / 配置" className="mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text (Main String) <span className="text-gray-400 font-normal">/ 文本(主串)</span>
                </label>
                <input 
                  type="text" 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patterns (comma separated)
                  <span className="text-gray-400 font-normal ml-1">/ 模式串 (逗号分隔)</span>
                </label>
                <input 
                  type="text" 
                  value={patternsAC} 
                  onChange={(e) => setPatternsAC(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Speed / 速度</label>
                <input 
                  type="range" 
                  min="100" max="2000" step="100" 
                  value={2100 - speed} 
                  onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Slow / 慢</span>
                  <span>Fast / 快</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Configuration Panel - Above Visualization for other algorithms */}
        {algo !== 'ac' && (
          <Card title="Configuration / 配置" className="mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text (Main String) <span className="text-gray-400 font-normal">/ 文本(主串)</span>
                </label>
                <input 
                  type="text" 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern <span className="text-gray-400 font-normal ml-1">/ 模式串</span>
                </label>
                <input 
                  type="text" 
                  value={pattern} 
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Speed / 速度</label>
                <input 
                  type="range" 
                  min="100" max="2000" step="100" 
                  value={2100 - speed} 
                  onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Slow / 慢</span>
                  <span>Fast / 快</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Visualization Panel - Full width for other algorithms */}
        {algo !== 'ac' && (
          <Card 
            title={
              <div className="flex items-center justify-between w-full">
                <span>Visualization / 演示</span>
                <div className="flex items-center gap-3">
                  {/* Control Bar - Compact inline */}
                  <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full border border-gray-300">
                    <ControlButton icon={RotateCcw} onClick={() => { setIsPlaying(false); setCurrentStep(0); }} />
                    <ControlButton icon={SkipBack} onClick={() => { setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)); }} disabled={currentStep === 0} />
                    <ControlButton icon={isPlaying ? Pause : Play} onClick={() => setIsPlaying(!isPlaying)} />
                    <ControlButton icon={SkipForward} onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); }} disabled={currentStep === steps.length - 1} />
                  </div>
                  <span className="text-xs text-gray-300 font-mono">Step {currentStep + 1} / {steps.length}</span>
                </div>
              </div>
            } 
            className="min-h-[500px] flex flex-col" 
            style={{ height: 'calc(100vh - 240px)', maxHeight: 'calc(100vh - 240px)' }}
          >

              {/* Explanation Box */}
              <div className="mb-2 bg-blue-50 border-l-4 border-blue-500 p-2 rounded-r-lg shadow-sm transition-all duration-300 flex-shrink-0">
                <div className="flex items-start gap-1.5">
                  <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-900 font-medium text-xs leading-tight">
                      {step.desc?.en || "Ready to start..."}
                    </p>
                    <p className="text-blue-700/80 mt-0.5 text-xs leading-tight">
                      {step.desc?.zh || "准备开始..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Visuals - Scrollable */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                {/* Visualization Section - Text Stream and Pattern Window together */}
                <div className="mb-3 flex-shrink-0">
                  <div className="mb-2 flex-shrink-0">
                    <VizTitle 
                      title="Visualization / 可视化"
                      tooltip={{
                        title: "Algorithm Visualization",
                        description: algo === 'naive'
                          ? "Shows the pattern window sliding over the text. Each position is checked character by character."
                          : algo === 'kmp'
                          ? "Shows the KMP algorithm with the Next (LPS) table. Pattern index jumps are visualized when mismatches occur."
                          : "Shows hash values for pattern and text window. Rolling hash updates are animated.",
                        zh: algo === 'naive'
                          ? "显示模式窗口在文本上滑动。每个位置都逐字符检查。"
                          : algo === 'kmp'
                          ? "显示带有 Next (LPS) 表的 KMP 算法。当出现不匹配时可视化模式索引跳转。"
                          : "显示模式和文本窗口的哈希值。滚动哈希更新是动画的。"
                      }}
                    />
                  </div>
                  
                  {/* Text String */}
                  <div className="mb-3">
                    <div className="mb-1">
                      <VizTitle 
                        title="Text Stream / 文本流"
                        tooltip={{
                          title: "Text Stream",
                          description: "The input text being processed. The highlighted character shows the current position being examined.",
                          zh: "正在处理的输入文本。高亮字符显示当前正在检查的位置。"
                        }}
                      />
                    </div>
                    {renderHighlightText(
                      text, 
                      step.i !== undefined && algo !== 'rk' ? [step.i] : [], 
                      'bg-blue-200 border-blue-400',
                      step.matches || []
                    )}
                  </div>

                  {/* Pattern Window - Only for Naive and KMP */}
                  {algo !== 'rk' && (
                    <div className="mb-3">
                      <div className="mb-1">
                        <VizTitle 
                          title="Pattern Window / 模式窗口"
                          tooltip={{
                            title: "Pattern Window",
                            description: "Shows the pattern aligned with the current text position. The pattern slides over the text as the algorithm progresses.",
                            zh: "显示与当前文本位置对齐的模式。模式在算法进行时在文本上滑动。"
                          }}
                        />
                      </div>
                      <div className="relative h-20">
                        <div style={{ transform: `translateX(${(step.i || 0) * 36}px)` }} className="transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) absolute left-0 top-0">
                          {renderHighlightText(pattern, step.j !== undefined ? [step.j] : [], 'bg-orange-200 border-orange-400')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Algorithm Details Panel */}
                <div className="border-t pt-3">
                  {algo === 'naive' ? (
                    /* Naive Algorithm Layout: Code + Match History + Statistics in one row */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                      {/* Code Viewer */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Code / 代码"
                            tooltip={{
                              title: "Code Viewer",
                              description: "Shows the executing code for the Naive string matching algorithm. The highlighted line indicates the current execution point.",
                              zh: "显示朴素字符串匹配算法的执行代码。高亮行表示当前执行位置。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <CodeViewer 
                            code={NAIVE_CODE}
                            highlightedLine={getCodeLineForStep('naive', step.type, step)}
                            stepType={step.type}
                            showTitle={true}
                            fileName="naive_search.cpp"
                            algorithmName="Naive String Matching"
                          />
                        </div>
                      </div>

                      {/* Match History */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Match History / 匹配历史"
                            tooltip={{
                              title: "Match History Timeline",
                              description: "Chronological list of all patterns found during execution. Shows pattern name, position in text, step number, and state where match occurred.",
                              zh: "执行过程中找到的所有模式的按时间顺序列表。显示模式名称、文本中的位置、步骤号和匹配发生的状态。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0">
                          <NaiveMatchHistory matches={step.matches || []} showTitle={false} />
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Statistics / 统计信息"
                            tooltip={{
                              title: "Match Counter & Statistics",
                              description: "Shows total matches found, matches per pattern, and processing statistics like first/last match positions and unique pattern count.",
                              zh: "显示找到的总匹配数、每个模式的匹配数以及处理统计信息，如第一个/最后一个匹配位置和唯一模式计数。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0">
                          <NaiveStatistics 
                            comparisons={step.comparisons || 0}
                            matches={step.matches || []}
                            textLength={text.length}
                            patternLength={pattern.length}
                            showTitle={false}
                          />
                        </div>
                      </div>
                    </div>
                  ) : algo === 'kmp' ? (
                    /* KMP Algorithm Layout: Code + (Next Table + Jump History) + Statistics = 3 cols */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                      {/* Code Viewer */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Code / 代码"
                            tooltip={{
                              title: "Code Viewer",
                              description: "Shows the executing code for the KMP algorithm. The highlighted line indicates the current execution point.",
                              zh: "显示 KMP 算法的执行代码。高亮行表示当前执行位置。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <CodeViewer 
                            code={KMP_CODE}
                            highlightedLine={getCodeLineForStep('kmp', step.type, step)}
                            stepType={step.type}
                            showTitle={true}
                            fileName="kmp_search.cpp"
                            algorithmName="KMP Algorithm"
                          />
                        </div>
                      </div>

                      {/* Next Table + Jump History Combined */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Next Table & Jumps / Next表与跳转"
                            tooltip={{
                              title: "Next Table & Jump History",
                              description: "Shows the Next (LPS) table and pattern index jumps. Visualizes how the algorithm skips unnecessary comparisons.",
                              zh: "显示 Next (LPS) 表和模式索引跳转。可视化算法如何跳过不必要的比较。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto space-y-3">
                          {/* Next Table */}
                          <div className="flex-shrink-0">
                            {renderKMPViz()}
                          </div>
                          {/* Jump History */}
                          <div className="flex-1 min-h-0">
                            <KMPJumpVisualization 
                              jumpHistory={step.jumpHistory || []}
                              nextTable={step.nextTable}
                              showTitle={false}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Statistics / 统计信息"
                            tooltip={{
                              title: "Match Counter & Statistics",
                              description: "Shows total matches found, matches per pattern, and processing statistics like first/last match positions and unique pattern count.",
                              zh: "显示找到的总匹配数、每个模式的匹配数以及处理统计信息，如第一个/最后一个匹配位置和唯一模式计数。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0">
                          <KMPStatistics 
                            comparisons={step.comparisons || 0}
                            matches={step.matches || []}
                            textLength={text.length}
                            patternLength={pattern.length}
                            showTitle={false}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Rabin-Karp Algorithm Layout: Code + Hash Visualization + (Hash Details + Statistics) = 3 cols */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                      {/* Code Viewer */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Code / 代码"
                            tooltip={{
                              title: "Code Viewer",
                              description: "Shows the executing code for the Rabin-Karp algorithm. The highlighted line indicates the current execution point.",
                              zh: "显示 Rabin-Karp 算法的执行代码。高亮行表示当前执行位置。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <CodeViewer 
                            code={RK_CODE}
                            highlightedLine={getCodeLineForStep('rk', step.type, step)}
                            stepType={step.type}
                            showTitle={true}
                            fileName="rabin_karp.cpp"
                            algorithmName="Rabin-Karp Algorithm"
                          />
                        </div>
                      </div>

                      {/* Hash Visualization */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Hash Values / 哈希值"
                            tooltip={{
                              title: "Hash Visualization",
                              description: "Shows pattern hash (Hp) and window hash (Ht) values with rolling hash animations.",
                              zh: "显示模式哈希 (Hp) 和窗口哈希 (Ht) 值，带有滚动哈希动画。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                          {renderRKViz()}
                        </div>
                      </div>

                      {/* Hash Details + Statistics Combined */}
                      <div className="lg:col-span-4 flex flex-col min-h-0">
                        <div className="mb-1 flex-shrink-0">
                          <VizTitle 
                            title="Details & Statistics / 详情与统计"
                            tooltip={{
                              title: "Hash Details & Statistics",
                              description: "Shows hash parameters, rolling hash formula, collision information, and match statistics.",
                              zh: "显示哈希参数、滚动哈希公式、冲突信息和匹配统计。"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto space-y-3">
                          {/* Hash Details */}
                          <div className="flex-1 min-h-0">
                            <RKHashDetails step={step} showTitle={false} />
                          </div>
                          {/* Statistics */}
                          <div className="flex-1 min-h-0">
                            <RKStatistics 
                              matches={step.matches || []}
                              hashCollisions={step.hashCollisions}
                              hashHistory={step.hashHistory}
                              showTitle={false}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
        )}

        {/* Visualization Panel - Full width for AC algorithm */}
        {algo === 'ac' && (
          <Card 
            title={
              <div className="flex items-center justify-between w-full">
                <span>Visualization / 演示</span>
                <div className="flex items-center gap-3">
                  {/* Control Bar - Compact inline */}
                  <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full border border-gray-300">
                    <ControlButton icon={RotateCcw} onClick={() => { setIsPlaying(false); setCurrentStep(0); }} />
                    <ControlButton icon={SkipBack} onClick={() => { setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)); }} disabled={currentStep === 0} />
                    <ControlButton icon={isPlaying ? Pause : Play} onClick={() => setIsPlaying(!isPlaying)} />
                    <ControlButton icon={SkipForward} onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); }} disabled={currentStep === steps.length - 1} />
                  </div>
                  <span className="text-xs text-gray-300 font-mono">Step {currentStep + 1} / {steps.length}</span>
                </div>
              </div>
            } 
            className="flex flex-col"
            style={{ height: 'calc(100vh - 240px)', maxHeight: 'calc(100vh - 240px)' }}
          >
            {/* Explanation Box - Compact */}
            <div className="mb-2 bg-blue-50 border-l-4 border-blue-500 p-2 rounded-r-lg shadow-sm transition-all duration-300 flex-shrink-0">
              <div className="flex items-start gap-1.5">
                <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-900 font-medium text-xs leading-tight">
                    {step.desc?.en || "Ready to start..."}
                  </p>
                  <p className="text-blue-700/80 mt-0.5 text-xs leading-tight">
                    {step.desc?.zh || "准备开始..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Visuals - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              {/* Text String Always Visible */}
              <div className="mb-2 flex-shrink-0">
                <div className="mb-1">
                  <VizTitle 
                    title="Text Stream / 文本流"
                    tooltip={{
                      title: "Text Stream",
                      description: "The input text being processed character by character. Matched patterns are highlighted with different colors and labeled above. The blue highlight shows the current character being processed.",
                      zh: "正在逐字符处理的输入文本。匹配的模式用不同颜色高亮并在上方标注。蓝色高亮显示当前正在处理的字符。"
                    }}
                  />
                </div>
                {renderHighlightText(
                  text, 
                  step.i !== undefined ? [step.i] : [], 
                  'bg-blue-200 border-blue-400',
                  step.matches || []
                )}
                {step.matches && step.matches.length > 0 && (
                  <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-1">
                    <span className="font-semibold">Matches:</span>
                    {step.matches.map((m, idx) => (
                      <span key={idx} className="font-mono text-xs">
                        "{m.pattern}"[{m.start}-{m.end}]
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Algorithm Details Panel */}
              <div className="border-t pt-2">
                {/* First Row: Main Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                  {/* Code Viewer - 4 columns */}
                  <div className="lg:col-span-4 flex flex-col min-h-0">
                    <div className="mb-1 flex-shrink-0">
                      <VizTitle 
                        title="Code / 代码"
                        tooltip={{
                          title: "Code Viewer",
                          description: "Shows the executing C++ code for the Aho-Corasick algorithm. The highlighted line indicates the current execution point.",
                          zh: "显示 Aho-Corasick 算法的执行代码。高亮行表示当前执行位置。"
                        }}
                      />
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <CodeViewer 
                        code={AC_CODE}
                        highlightedLine={getCodeLineForStep('ac', step.type, step)}
                        stepType={step.type}
                        fileName="mult_search.cpp"
                        algorithmName="Aho-Corasick Algorithm"
                      />
                    </div>
                  </div>
                  {/* Visualization - 5 columns */}
                  <div className="lg:col-span-5 flex flex-col min-h-0">
                    <div className="mb-1 flex-shrink-0">
                      <VizTitle 
                        title="Visualization / 可视化"
                        tooltip={{
                          title: "AC Automaton (Trie)",
                          description: "Interactive graph showing the AC automaton structure. Solid arrows are character transitions, dashed red arrows are failure links. The blue circle highlights the current state.",
                          zh: "显示 AC 自动机结构的交互式图。实线箭头是字符转移，红色虚线箭头是失败链接。蓝色圆圈高亮当前状态。"
                        }}
                      />
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto">
                      {renderACViz()}
                    </div>
                  </div>
                  {/* Transition Table - 3 columns */}
                  <div className="lg:col-span-3 flex flex-col min-h-0">
                    <div className="mb-1 flex-shrink-0">
                      <VizTitle 
                        title="Transitions / 转移表"
                        tooltip={{
                          title: "Transition Table",
                          description: "Table showing all possible character transitions from each state. The highlighted row is the current state, and highlighted cells show active transitions.",
                          zh: "显示每个状态的所有可能字符转移的表。高亮行是当前状态，高亮单元格显示活动转移。"
                        }}
                      />
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto">
                      <TransitionTable 
                        trie={step.trie}
                        currentNode={step.node}
                        transitionChar={step.transitionChar}
                        stepType={step.type}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Second Row: Additional Visualizations */}
                <div className="space-y-2">
                  {/* First row of additional visualizations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* Match History Timeline */}
                    <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                      <div className="mb-1 flex-shrink-0 px-3 pt-2">
                        <VizTitle 
                          title="Match History / 匹配历史"
                          tooltip={{
                            title: "Match History Timeline",
                            description: "Chronological list of all patterns found during execution. Shows pattern name, position in text, step number, and state where match occurred.",
                            zh: "执行过程中找到的所有模式的按时间顺序列表。显示模式名称、文本中的位置、步骤号和匹配发生的状态。"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-h-0">
                        <MatchHistoryTimeline 
                          matchHistory={step.matchHistory || []}
                          currentStep={currentStep}
                          showTitle={false}
                        />
                      </div>
                    </div>
                    
                    {/* State Transition History */}
                    <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                      <div className="mb-1 flex-shrink-0 px-3 pt-2">
                        <VizTitle 
                          title="State History / 状态历史"
                          tooltip={{
                            title: "State Transition History",
                            description: "Breadcrumb trail showing the sequence of states visited during execution. The highlighted state is the current one.",
                            zh: "显示执行过程中访问的状态序列的面包屑轨迹。高亮状态是当前状态。"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-h-0">
                        <StateTransitionHistory 
                          stateHistory={step.stateHistory || []}
                          currentNode={step.node}
                          stepType={step.type}
                          showTitle={false}
                        />
                      </div>
                    </div>
                    
                    {/* Character Processing Flow */}
                    <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                      <div className="mb-1 flex-shrink-0 px-3 pt-2">
                        <VizTitle 
                          title="Processing Flow / 处理流程"
                          tooltip={{
                            title: "Character Processing Flow",
                            description: "Step-by-step visualization of how each character is processed: reading, checking transitions, following failure links, and checking outputs.",
                            zh: "每个字符处理方式的逐步可视化：读取、检查转移、跟随失败链接和检查输出。"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-h-0">
                        <CharacterProcessingFlow 
                          step={step}
                          text={text}
                          showTitle={false}
                        />
                      </div>
                    </div>
                    
                    {/* Match Counter & Statistics */}
                    <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                      <div className="mb-1 flex-shrink-0 px-3 pt-2">
                        <VizTitle 
                          title="Statistics / 统计信息"
                          tooltip={{
                            title: "Match Counter & Statistics",
                            description: "Shows total matches found, matches per pattern, and processing statistics like first/last match positions and unique pattern count.",
                            zh: "显示找到的总匹配数、每个模式的匹配数以及处理统计信息，如第一个/最后一个匹配位置和唯一模式计数。"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-h-0">
                        <MatchCounterStats 
                          matches={step.matches || []}
                          matchHistory={step.matchHistory || []}
                          patterns={patternsAC.split(',').map(s => s.trim()).filter(s => s.length > 0)}
                          showTitle={false}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Second row of additional visualizations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Output Set Visualization */}
                    <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                      <div className="mb-1 flex-shrink-0 px-3 pt-2">
                        <VizTitle 
                          title="Output Sets / 输出集合"
                          tooltip={{
                            title: "Output Set Visualization",
                            description: "Lists all states that have output patterns. Shows which patterns end at each state. The current state is highlighted.",
                            zh: "列出所有具有输出模式的状态。显示哪些模式在每个状态结束。当前状态被高亮显示。"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-h-0">
                        <OutputSetVisualization 
                          trie={step.trie}
                          currentNode={step.node}
                          showTitle={false}
                        />
                      </div>
                    </div>
                    
                    {/* Optimization Visualization */}
                    <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                      <div className="mb-1 flex-shrink-0 px-3 pt-2">
                        <VizTitle 
                          title="Optimized Transitions / 优化转移"
                          tooltip={{
                            title: "Optimization Visualization",
                            description: "Shows the optimized direct transitions (O(1)) from the current state. These transitions avoid following failure links by pre-computing them during automaton construction.",
                            zh: "显示从当前状态的优化直接转移（O(1)）。这些转移通过在自动机构建期间预计算来避免跟随失败链接。"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-h-0">
                        <OptimizationVisualization 
                          trie={step.trie}
                          currentNode={step.node}
                          transitionChar={step.transitionChar}
                          showTitle={false}
                        />
                      </div>
                    </div>
                    
                    {/* Failure Link Tree */}
                    <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                      <div className="mb-1 flex-shrink-0 px-3 pt-2">
                        <VizTitle 
                          title="Failure Links / 失败链接"
                          tooltip={{
                            title: "Failure Link Tree",
                            description: "Simplified view showing only the failure links in the automaton. Failure links point to the longest proper suffix that is also a prefix of some pattern.",
                            zh: "仅显示自动机中失败链接的简化视图。失败链接指向某个模式的最长真后缀，同时也是某个模式的前缀。"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-h-0">
                        <FailureLinkTree 
                          trie={step.trie}
                          layout={step.layout}
                          currentNode={step.node}
                          stepType={step.type}
                          showTitle={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default App;