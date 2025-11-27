import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Info, Hash, CornerDownRight } from 'lucide-react';

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
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 ${className}`}>
    {title && (
      <div className="bg-blue-900 text-white px-4 py-3 font-semibold border-b border-blue-800">
        {title}
      </div>
    )}
    <div className="p-4">{children}</div>
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

  for (let i = 0; i <= n - m; i++) {
    steps.push({
      type: 'shift',
      i, j: 0,
      highlight: [],
      desc: { en: `Shift pattern to index ${i}.`, zh: `将模式串移动到索引 ${i}。` }
    });

    let match = true;
    for (let j = 0; j < m; j++) {
      steps.push({
        type: 'compare',
        i, j,
        highlight: [i + j],
        match: text[i + j] === pattern[j],
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
          desc: { en: "Mismatch found. Break loop.", zh: "发现不匹配。跳出循环。" }
        });
        break;
      }
    }

    if (match) {
      steps.push({
        type: 'match',
        i, j: m - 1,
        highlight: Array.from({ length: m }, (_, k) => i + k),
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

  steps.push({
    type: 'init',
    i, j,
    nextTable: lps,
    desc: { en: "Initialize KMP. Calculate Next (LPS) table.", zh: "初始化 KMP。计算 Next (最长公共前缀后缀) 表。" }
  });

  while (i < n) {
    steps.push({
      type: 'compare',
      i, j,
      nextTable: lps,
      match: text[i] === pattern[j],
      desc: { 
        en: `Compare T[${i}] ('${text[i]}') with P[${j}] ('${pattern[j]}').`, 
        zh: `比较 T[${i}] ('${text[i]}') 和 P[${j}] ('${pattern[j]}')。` 
      }
    });

    if (pattern[j] === text[i]) {
      i++;
      j++;
      if (j === m) {
        steps.push({
          type: 'match',
          i: i - j, j: m - 1,
          nextTable: lps,
          desc: { en: `Pattern found at index ${i - j}!`, zh: `在索引 ${i - j} 处找到模式串！` }
        });
        j = lps[j - 1];
        steps.push({
          type: 'jump',
          i, j,
          nextTable: lps,
          desc: { en: `Jump pattern index j to ${j} (from Next table).`, zh: `根据 Next 表将模式串索引 j 跳转到 ${j}。` }
        });
      }
    } else {
      if (j !== 0) {
        let oldJ = j;
        j = lps[j - 1];
        steps.push({
          type: 'jump',
          i, j,
          nextTable: lps,
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

  steps.push({
    type: 'init',
    i: 0,
    hp: p, ht: t,
    desc: { 
      en: `Calculate initial hashes. Hp(Pattern) = ${p}, Ht(Text window 0) = ${t}.`, 
      zh: `计算初始哈希值。Hp(模式串) = ${p}，Ht(文本窗口0) = ${t}。` 
    }
  });

  for (let i = 0; i <= n - m; i++) {
    steps.push({
      type: 'compare_hash',
      i, hp: p, ht: t,
      match: p === t,
      desc: { 
        en: `Window at ${i}. Compare Hash: ${p} vs ${t}.`, 
        zh: `窗口在 ${i}。比较哈希值：${p} vs ${t}。` 
      }
    });

    if (p === t) {
      steps.push({
        type: 'check_chars',
        i, hp: p, ht: t,
        desc: { en: "Hashes match! Check characters one by one.", zh: "哈希值匹配！逐个检查字符。" }
      });
      
      let match = true;
      for (let j = 0; j < m; j++) {
        steps.push({
            type: 'verify',
            i, j, hp: p, ht: t,
            match: text[i+j] === pattern[j],
            desc: { en: `Checking T[${i+j}] === P[${j}]...`, zh: `检查 T[${i+j}] === P[${j}]...` }
        });
        if (text[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }

      if (match) {
        steps.push({
          type: 'match',
          i, hp: p, ht: t,
          desc: { en: `Pattern found at index ${i}.`, zh: `在索引 ${i} 处找到模式串。` }
        });
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

  steps.push({
    type: 'init',
    trie, layout,
    node: 0,
    i: -1,
    desc: { en: "AC Automaton Built. Ready to search.", zh: "AC 自动机已构建。准备搜索。" }
  });

  let u = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    steps.push({
        type: 'input',
        trie, layout, node: u, i,
        char,
        desc: { en: `Read character '${char}'. Current State: ${u}.`, zh: `读取字符 '${char}'。当前状态：${u}。` }
    });

    while (u > 0 && !trie[u].next[char]) {
      let prev = u;
      u = trie[u].fail;
      steps.push({
        type: 'fail',
        trie, layout, node: u, i,
        prevNode: prev,
        desc: { en: `No transition for '${char}'. Follow Fail link ${prev} -> ${u}.`, zh: `没有 '${char}' 的转移。跟随失败链接 ${prev} -> ${u}。` }
      });
    }

    if (trie[u].next[char]) {
      let prev = u;
      u = trie[u].next[char];
      steps.push({
        type: 'goto',
        trie, layout, node: u, i,
        prevNode: prev,
        desc: { en: `Transition ${prev} --${char}--> ${u}.`, zh: `状态转移 ${prev} --${char}--> ${u}。` }
      });
    }

    if (trie[u].output.length > 0) {
      steps.push({
        type: 'match',
        trie, layout, node: u, i,
        found: trie[u].output,
        desc: { en: `Output at state ${u}: ${trie[u].output.join(', ')}.`, zh: `状态 ${u} 输出：${trie[u].output.join(', ')}。` }
      });
    }
  }

  return steps;
};

// --- AC Algorithm Code (from textbook) ---
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
const getCodeLineForStep = (stepType, step) => {
  // For 'input' step, highlight the for loop and the character being read
  if (stepType === 'input') return 5;
  
  // For 'goto' step, highlight the state transition line
  if (stepType === 'goto') return 8;
  
  // For 'match' step, highlight the output check
  if (stepType === 'match') return 10;
  
  // For 'fail' step, we show the transition check (though actual fail logic is in build_failure)
  if (stepType === 'fail') return 7;
  
  // For 'init', no specific line
  return null;
};

// Code Viewer Component
const CodeViewer = ({ code, highlightedLine, stepType }) => {
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
        } px-3 py-1.5 transition-all duration-200`}
      >
        <span className={`mr-4 w-8 text-right select-none ${
          isHighlighted ? 'text-blue-300 font-bold' : 'text-gray-500'
        }`}>
          {item.line}
        </span>
        <span className="flex-1 font-mono text-sm whitespace-pre">
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
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-xl"
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
      <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-gray-300 text-xs font-mono ml-3 font-semibold">mult_search.cpp</span>
        </div>
        <span className="text-gray-500 text-xs">Aho-Corasick Algorithm</span>
      </div>
      <div ref={codeRef} className="overflow-visible bg-gray-950" style={{ overscrollBehavior: 'contain' }}>
        <div className="py-2">
          {code.map((item, idx) => renderCodeLine(item, idx))}
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
  const renderHighlightText = (str, activeIndices = [], color = 'bg-orange-200') => {
    return (
      <div className="flex font-mono text-lg overflow-x-auto pb-2 pt-3">
        {str.split('').map((char, idx) => {
           let bg = 'bg-white scale-100';
           let border = 'border-gray-200';
           
           if (activeIndices.includes(idx)) {
               bg = `${color} scale-110 shadow-sm`;
               border = color.replace('bg-', 'border-').replace('200', '400');
           }
           
           return (
             <div key={idx} className={`flex flex-col items-center justify-center w-8 h-12 border mx-0.5 rounded transition-all duration-300 ease-in-out overflow-visible ${bg} ${border}`}>
               <span className="leading-none">{char || '\u00A0'}</span>
               <span className="text-[10px] text-gray-400 mt-0.5">{idx}</span>
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
                       return (
                           <g key={`link-${idx}`}>
                               <line 
                                   x1={source.x} y1={source.y} 
                                   x2={target.x} y2={target.y} 
                                   stroke={isFail ? "#f87171" : "#cbd5e1"} 
                                   strokeWidth={isFail ? 1.5 : 2}
                                   strokeDasharray={isFail ? "5,5" : "0"}
                                   markerEnd={isFail ? "url(#arrowhead-fail)" : "url(#arrowhead)"}
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
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 font-sans text-gray-800">
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

      <div className="w-full space-y-4">
        
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
          <Card title="Configuration / 配置">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Input & Controls - Side by side for other algorithms */}
        {algo !== 'ac' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Configuration / 配置" className="lg:col-span-1">
              <div className="space-y-4">
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
                
                <div className="pt-4 border-t border-gray-100">
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

            <Card title="Visualization / 演示" className="lg:col-span-2 min-h-[500px] flex flex-col">
              {/* Control Bar */}
              <div className="flex justify-center items-center gap-4 mb-6 p-2 bg-gray-50 rounded-full w-fit mx-auto border border-gray-200">
                <ControlButton icon={RotateCcw} onClick={() => { setIsPlaying(false); setCurrentStep(0); }} />
                <ControlButton icon={SkipBack} onClick={() => { setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)); }} disabled={currentStep === 0} />
                <ControlButton icon={isPlaying ? Pause : Play} onClick={() => setIsPlaying(!isPlaying)} />
                <ControlButton icon={SkipForward} onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); }} disabled={currentStep === steps.length - 1} />
              </div>

              {/* Explanation Box */}
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm min-h-[100px] transition-all duration-300">
                <div className="flex items-start">
                  <Info className="text-blue-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <div className="w-full">
                    <p className="text-blue-900 font-medium text-lg leading-relaxed">
                      {step.desc?.en || "Ready to start..."}
                    </p>
                    <p className="text-blue-700/80 mt-2 border-t border-blue-200 pt-2 text-base">
                      {step.desc?.zh || "准备开始..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Visuals */}
              <div className="flex-1 overflow-x-auto">
                {/* Text String Always Visible */}
                <div className="mb-6">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Text Stream / 文本流
                  </h5>
                  {renderHighlightText(
                    text, 
                    step.i !== undefined && algo !== 'rk' ? [step.i] : [], 
                    'bg-blue-200 border-blue-400'
                  )}
                </div>

                {/* Algorithm Specifics */}
                <div className="mb-6 relative h-20">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Pattern Window / 模式窗口
                  </h5>
                  {/* Animated Window Slider */}
                  <div style={{ transform: `translateX(${(step.i || 0) * 36}px)` }} className="transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) absolute left-0 top-6">
                    {renderHighlightText(pattern, step.j !== undefined ? [step.j] : [], 'bg-orange-200 border-orange-400')}
                  </div>
                </div>

                {/* Algorithm Details Panel */}
                <div className="border-t pt-4">
                  {algo === 'rk' && renderRKViz()}
                  {algo === 'kmp' && renderKMPViz()}
                </div>
              </div>

              {/* Step Counter */}
              <div className="mt-auto pt-4 text-right text-xs text-gray-400">
                Step {currentStep + 1} / {steps.length}
              </div>
            </Card>
          </div>
        )}

        {/* Visualization Panel - Full width for AC algorithm */}
        {algo === 'ac' && (
          <Card title="Visualization / 演示" className="min-h-[500px] flex flex-col">
            {/* Control Bar */}
            <div className="flex justify-center items-center gap-4 mb-6 p-2 bg-gray-50 rounded-full w-fit mx-auto border border-gray-200">
              <ControlButton icon={RotateCcw} onClick={() => { setIsPlaying(false); setCurrentStep(0); }} />
              <ControlButton icon={SkipBack} onClick={() => { setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)); }} disabled={currentStep === 0} />
              <ControlButton icon={isPlaying ? Pause : Play} onClick={() => setIsPlaying(!isPlaying)} />
              <ControlButton icon={SkipForward} onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); }} disabled={currentStep === steps.length - 1} />
            </div>

            {/* Main Visuals */}
            <div className="flex-1 overflow-x-auto">
              {/* Text String Always Visible */}
              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Text Stream / 文本流
                </h5>
                {renderHighlightText(
                  text, 
                  step.i !== undefined ? [step.i] : [], 
                  'bg-blue-200 border-blue-400'
                )}
              </div>

              {/* Algorithm Details Panel */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                  {/* Code Viewer - 4 columns */}
                  <div className="lg:col-span-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Code / 代码
                    </h5>
                    <CodeViewer 
                      code={AC_CODE}
                      highlightedLine={getCodeLineForStep(step.type, step)}
                      stepType={step.type}
                    />
                  </div>
                  {/* Visualization - 6 columns */}
                  <div className="lg:col-span-6">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Visualization / 可视化
                    </h5>
                    {renderACViz()}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Counter */}
            <div className="mt-auto pt-4 text-right text-xs text-gray-400">
              Step {currentStep + 1} / {steps.length}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default App;