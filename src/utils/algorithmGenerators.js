import { calculateTrieLayout } from './trieLayout';

export const generateNaiveSteps = (text, pattern) => {
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

export const generateKMPSteps = (text, pattern) => {
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
            en: `Mismatch at P[${oldJ}]. Jump j to ${j} (Next[${oldJ - 1}]). i stays at ${i}.`,
            zh: `P[${oldJ}] 处不匹配。j 跳转到 ${j} (Next[${oldJ - 1}])。i 保持在 ${i}。`
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

export const generateRKSteps = (text, pattern) => {
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
          match: text[i + j] === pattern[j],
          desc: { en: `Checking T[${i + j}] === P[${j}]...`, zh: `检查 T[${i + j}] === P[${j}]...` }
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
          en: `Rolling Hash: Remove '${text[i]}', add '${text[i + m]}'.`,
          zh: `滚动哈希：移除 '${text[i]}'，添加 '${text[i + m]}'。`
        }
      });
    }
  }
  return steps;
};

export const generateACSteps = (text, patternsInput) => {
  const steps = [];
  const patterns = patternsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
  if (patterns.length === 0) return steps;

  // Initialize empty trie with root
  const trie = [{ next: {}, fail: 0, output: [] }];

  // Helper to calculate layout
  const getLayout = () => calculateTrieLayout(trie);

  // Stage 1: Build Trie - Initialize
  steps.push({
    type: 'build_init',
    phase: 'build_trie',
    trie: JSON.parse(JSON.stringify(trie)),
    layout: getLayout(),
    node: 0,
    desc: {
      en: "Stage 1: Initialize AC Automaton. Starting with root node.",
      zh: "阶段 1：初始化 AC 自动机。从根节点开始。"
    }
  });

  // Stage 1: Build Trie - Insert patterns one by one
  patterns.forEach((pat, patIdx) => {
    let u = 0;

    steps.push({
      type: 'insert_start',
      phase: 'build_trie',
      trie: JSON.parse(JSON.stringify(trie)),
      layout: getLayout(),
      pattern: pat,
      patternIndex: patIdx,
      currentNode: u,
      charIndex: -1,
      desc: {
        en: `Inserting pattern "${pat}" into trie.`,
        zh: `将模式串 "${pat}" 插入 Trie。`
      }
    });

    for (let charIdx = 0; charIdx < pat.length; charIdx++) {
      const char = pat[charIdx];

      steps.push({
        type: 'insert_char',
        phase: 'build_trie',
        trie: JSON.parse(JSON.stringify(trie)),
        layout: getLayout(),
        pattern: pat,
        patternIndex: patIdx,
        currentNode: u,
        charIndex: charIdx,
        char: char,
        desc: {
          en: `Processing character '${char}' at position ${charIdx} of pattern "${pat}".`,
          zh: `处理模式串 "${pat}" 位置 ${charIdx} 的字符 '${char}'。`
        }
      });

      if (!trie[u].next[char]) {
        steps.push({
          type: 'insert_check',
          phase: 'build_trie',
          trie: JSON.parse(JSON.stringify(trie)),
          layout: getLayout(),
          pattern: pat,
          patternIndex: patIdx,
          currentNode: u,
          charIndex: charIdx,
          char: char,
          desc: {
            en: `No transition for '${char}' from state ${u}. Creating new node.`,
            zh: `状态 ${u} 没有 '${char}' 的转移。创建新节点。`
          }
        });

        trie[u].next[char] = trie.length;
        trie.push({ next: {}, fail: 0, output: [] });

        steps.push({
          type: 'insert_create',
          phase: 'build_trie',
          trie: JSON.parse(JSON.stringify(trie)),
          layout: getLayout(),
          pattern: pat,
          patternIndex: patIdx,
          currentNode: u,
          newNode: trie.length - 1,
          charIndex: charIdx,
          char: char,
          desc: {
            en: `Created new state ${trie.length - 1} for transition '${char}' from state ${u}.`,
            zh: `为状态 ${u} 的转移 '${char}' 创建新状态 ${trie.length - 1}。`
          }
        });
      }

      const prevNode = u;
      u = trie[u].next[char];

      steps.push({
        type: 'insert_move',
        phase: 'build_trie',
        trie: JSON.parse(JSON.stringify(trie)),
        layout: getLayout(),
        pattern: pat,
        patternIndex: patIdx,
        prevNode: prevNode,
        currentNode: u,
        charIndex: charIdx,
        char: char,
        desc: {
          en: `Move from state ${prevNode} to state ${u} via transition '${char}'.`,
          zh: `通过转移 '${char}' 从状态 ${prevNode} 移动到状态 ${u}。`
        }
      });
    }

    trie[u].output.push(pat);

    steps.push({
      type: 'insert_output',
      phase: 'build_trie',
      trie: JSON.parse(JSON.stringify(trie)),
      layout: getLayout(),
      pattern: pat,
      patternIndex: patIdx,
      currentNode: u,
      desc: {
        en: `Pattern "${pat}" inserted. State ${u} now has output: [${trie[u].output.join(', ')}].`,
        zh: `模式串 "${pat}" 已插入。状态 ${u} 现在有输出：[${trie[u].output.join(', ')}]。`
      }
    });
  });

  // Transition: Stage 1 Complete
  steps.push({
    type: 'stage1_complete',
    phase: 'build_trie',
    trie: JSON.parse(JSON.stringify(trie)),
    layout: getLayout(),
    desc: {
      en: "Stage 1 Complete: Trie built successfully. All patterns inserted.",
      zh: "阶段 1 完成：Trie 构建成功。所有模式已插入。"
    }
  });

  // Stage 2: Build Failure Links using BFS
  steps.push({
    type: 'build_fail_init',
    phase: 'build_failure',
    trie: JSON.parse(JSON.stringify(trie)),
    layout: getLayout(),
    desc: {
      en: "Stage 2: Starting to build failure links. Initialize root's fail to NULL.",
      zh: "阶段 2：开始构建失败链接。将根的失败指针初始化为 NULL。"
    }
  });

  const queue = [];
  for (let char in trie[0].next) {
    const v = trie[0].next[char];
    trie[v].fail = 0;
    queue.push(v);

    steps.push({
      type: 'build_fail_queue',
      phase: 'build_failure',
      trie: JSON.parse(JSON.stringify(trie)),
      layout: getLayout(),
      currentNode: v,
      parentNode: 0,
      char: char,
      desc: {
        en: `Set failure link for state ${v} (child of root via '${char}') to root (0).`,
        zh: `将状态 ${v}（通过 '${char}' 从根的子节点）的失败链接设置为根（0）。`
      }
    });
  }

  while (queue.length > 0) {
    const u = queue.shift();

    steps.push({
      type: 'build_fail_loop',
      phase: 'build_failure',
      trie: JSON.parse(JSON.stringify(trie)),
      layout: getLayout(),
      currentNode: u,
      queueLength: queue.length,
      desc: {
        en: `Processing state ${u} from queue. Building failure links for its children.`,
        zh: `处理队列中的状态 ${u}。为其子节点构建失败链接。`
      }
    });

    // Get all possible characters (dsize simulation - using all chars seen so far)
    const allChars = new Set();
    Object.keys(trie[u].next).forEach(c => allChars.add(c));
    // Also check failure link path for optimization
    let tempF = trie[u].fail;
    while (tempF > 0) {
      Object.keys(trie[tempF].next).forEach(c => allChars.add(c));
      tempF = trie[tempF].fail;
    }

    for (let char of allChars) {
      const hasTransition = !!trie[u].next[char];

      steps.push({
        type: 'build_fail_check',
        phase: 'build_failure',
        trie: JSON.parse(JSON.stringify(trie)),
        layout: getLayout(),
        currentNode: u,
        char: char,
        hasTransition: hasTransition,
        desc: {
          en: `Checking transition '${char}' from state ${u}. ${hasTransition ? 'Transition exists.' : 'Transition does not exist - will optimize.'}`,
          zh: `检查状态 ${u} 的转移 '${char}'。${hasTransition ? '转移存在。' : '转移不存在 - 将进行优化。'}`
        }
      });

      if (hasTransition) {
        const v = trie[u].next[char];
        let f = trie[u].fail;

        steps.push({
          type: 'build_fail_traverse',
          phase: 'build_failure',
          trie: JSON.parse(JSON.stringify(trie)),
          layout: getLayout(),
          currentNode: u,
          childNode: v,
          char: char,
          failCandidate: f,
          desc: {
            en: `State ${v} exists. Traverse failure links from parent ${u}'s fail (${f}) to find fallback.`,
            zh: `状态 ${v} 存在。从父节点 ${u} 的失败链接（${f}）遍历失败链接以找到后备。`
          }
        });

        while (f > 0 && !trie[f].next[char]) {
          const prevF = f;
          f = trie[f].fail;

          steps.push({
            type: 'build_fail_traverse',
            phase: 'build_failure',
            trie: JSON.parse(JSON.stringify(trie)),
            layout: getLayout(),
            currentNode: u,
            childNode: v,
            char: char,
            failCandidate: f,
            prevFailCandidate: prevF,
            desc: {
              en: `No transition '${char}' from fail candidate ${prevF}. Follow fail link to ${f}.`,
              zh: `失败候选 ${prevF} 没有转移 '${char}'。跟随失败链接到 ${f}。`
            }
          });
        }

        const failTarget = trie[f].next[char] || 0;
        trie[v].fail = failTarget;
        trie[v].output = [...trie[v].output, ...trie[failTarget].output];

        steps.push({
          type: 'build_fail_set',
          phase: 'build_failure',
          trie: JSON.parse(JSON.stringify(trie)),
          layout: getLayout(),
          currentNode: u,
          childNode: v,
          char: char,
          failTarget: failTarget,
          desc: {
            en: `Set failure link for state ${v} to ${failTarget}. Output: [${trie[v].output.join(', ')}].`,
            zh: `将状态 ${v} 的失败链接设置为 ${failTarget}。输出：[${trie[v].output.join(', ')}]。`
          }
        });

        queue.push(v);
      } else {
        // Optimization: pre-compute transition
        const optimizedTarget = u === 0 ? 0 : (trie[trie[u].fail].next[char] || 0);
        trie[u].next[char] = optimizedTarget;

        steps.push({
          type: 'build_fail_optimize',
          phase: 'build_failure',
          trie: JSON.parse(JSON.stringify(trie)),
          layout: getLayout(),
          currentNode: u,
          char: char,
          optimizedTarget: optimizedTarget,
          desc: {
            en: `Optimization: Pre-compute transition '${char}' from state ${u} to ${optimizedTarget} (via fail link).`,
            zh: `优化：预计算状态 ${u} 到 ${optimizedTarget} 的转移 '${char}'（通过失败链接）。`
          }
        });
      }
    }
  }

  const layout = getLayout();

  // Transition: Stage 2 Complete
  steps.push({
    type: 'stage2_complete',
    phase: 'build_failure',
    trie: JSON.parse(JSON.stringify(trie)),
    layout: layout,
    node: 0,
    desc: {
      en: "Stage 2 Complete: Failure links built successfully. AC Automaton ready for search.",
      zh: "阶段 2 完成：失败链接构建成功。AC 自动机准备搜索。"
    }
  });

  // Stage 3: Search phase
  let u = 0;
  const allMatches = []; // Track all matches found so far
  const stateHistory = [0]; // Track state transition history
  const matchHistory = []; // Track chronological match history

  steps.push({
    type: 'init',
    phase: 'search',
    trie: JSON.parse(JSON.stringify(trie)),
    layout: layout,
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
      phase: 'search',
      trie: JSON.parse(JSON.stringify(trie)),
      layout: layout,
      node: u,
      i,
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
        phase: 'search',
        trie: JSON.parse(JSON.stringify(trie)),
        layout: layout,
        node: u,
        i,
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
        phase: 'search',
        trie: JSON.parse(JSON.stringify(trie)),
        layout: layout,
        node: u,
        i,
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
        phase: 'search',
        trie: JSON.parse(JSON.stringify(trie)),
        layout: layout,
        node: u,
        i,
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

// Helper function to deep clone arrays while preserving Infinity values
const deepCloneWithInfinity = (obj) => {
  if (obj === Infinity || obj === Number.POSITIVE_INFINITY) {
    return Infinity;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneWithInfinity(item));
  }
  if (obj && typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      cloned[key] = deepCloneWithInfinity(obj[key]);
    }
    return cloned;
  }
  return obj;
};

// Max Flow Algorithm (Edmonds-Karp) Step Generator
// Input format: "m n|exp1_revenue exp1_instr1 exp1_instr2 ...|exp2_revenue exp2_instr1 ...|cost1 cost2 ... costn"
// Example: "2 2|10 1 2|5 1|3 4"
export const generateMaxFlowSteps = (inputText) => {
  const steps = [];

  if (!inputText || inputText.trim() === '') {
    return steps;
  }

  try {
    const lines = inputText.trim().split('|');
    if (lines.length < 2) return steps;

    const firstLine = lines[0].trim().split(/\s+/);
    const m = parseInt(firstLine[0]) || 0; // number of experiments
    const n = parseInt(firstLine[1]) || 0; // number of instruments

    if (m === 0 || n === 0) return steps;

    // Parse experiments
    const experiments = [];
    let totalRevenue = 0;
    for (let i = 1; i <= m && i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/).map(x => parseInt(x));
      if (parts.length === 0) continue;
      const revenue = parts[0];
      const instruments = parts.slice(1).map(x => x - 1); // Convert to 0-indexed
      experiments.push({ revenue, instruments });
      totalRevenue += revenue;
    }

    // Parse instrument costs
    const costs = [];
    if (lines.length > m + 1) {
      const costLine = lines[m + 1].trim().split(/\s+/);
      for (let i = 0; i < n && i < costLine.length; i++) {
        costs.push(parseInt(costLine[i]) || 0);
      }
    }

    // Build graph structure
    const source = 0;
    const sink = m + n + 1;
    const numNodes = sink + 1;

    // Initialize capacity matrix
    const capacity = Array(numNodes).fill(null).map(() => Array(numNodes).fill(0));
    const graph = Array(numNodes).fill(null).map(() => []);
    const flow = Array(numNodes).fill(null).map(() => Array(numNodes).fill(0));

    // Build graph: Source -> Experiments
    for (let i = 0; i < m; i++) {
      const expNode = i + 1;
      const cap = experiments[i]?.revenue || 0;
      capacity[source][expNode] = cap;
      graph[source].push(expNode);
      graph[expNode].push(source);
    }

    // Build graph: Experiments -> Instruments
    for (let i = 0; i < m; i++) {
      const expNode = i + 1;
      const instruments = experiments[i]?.instruments || [];
      for (const instrIdx of instruments) {
        if (instrIdx >= 0 && instrIdx < n) {
          const instrNode = m + 1 + instrIdx;
          capacity[expNode][instrNode] = Infinity;
          if (!graph[expNode].includes(instrNode)) {
            graph[expNode].push(instrNode);
            graph[instrNode].push(expNode);
          }
        }
      }
    }

    // Build graph: Instruments -> Sink
    for (let i = 0; i < n; i++) {
      const instrNode = m + 1 + i;
      const cap = costs[i] || 0;
      capacity[instrNode][sink] = cap;
      if (!graph[instrNode].includes(sink)) {
        graph[instrNode].push(sink);
        graph[sink].push(instrNode);
      }
    }

    // Initial state
    steps.push({
      type: 'init',
      phase: 'flow',
      graph: deepCloneWithInfinity(graph),
      capacity: deepCloneWithInfinity(capacity),
      flow: deepCloneWithInfinity(flow),
      maxFlow: 0,
      augmentingPaths: [],
      currentPath: null,
      desc: {
        en: `Initialized graph with ${m} experiments and ${n} instruments. Total revenue potential: ${totalRevenue}.`,
        zh: `初始化图：${m} 个实验，${n} 个仪器。总收益潜力：${totalRevenue}。`
      }
    });

    let maxFlowValue = 0;
    const augmentingPaths = [];

    // Edmonds-Karp algorithm
    while (true) {
      // BFS to find augmenting path
      const visited = Array(numNodes).fill(false);
      const parent = Array(numNodes).fill(-1);
      const queue = [source];
      visited[source] = true;
      parent[source] = -1;
      let foundPath = false;
      const bfsVisited = [];

      steps.push({
        type: 'bfs_init',
        phase: 'bfs',
        graph: deepCloneWithInfinity(graph),
        capacity: deepCloneWithInfinity(capacity),
        flow: deepCloneWithInfinity(flow),
        maxFlow: maxFlowValue,
        visited: [...visited],
        queue: [...queue],
        currentPath: null,
        augmentingPaths: [...augmentingPaths],
        desc: {
          en: `Starting BFS to find augmenting path from source to sink.`,
          zh: `开始 BFS 查找从源点到汇点的增广路径。`
        }
      });

      while (queue.length > 0) {
        const u = queue.shift();
        bfsVisited.push(u);

        steps.push({
          type: 'bfs_loop',
          phase: 'bfs',
          graph: deepCloneWithInfinity(graph),
          capacity: deepCloneWithInfinity(capacity),
          flow: deepCloneWithInfinity(flow),
          maxFlow: maxFlowValue,
          visited: [...visited],
          queue: [...queue],
          currentNode: u,
          bfsVisited: [...bfsVisited],
          currentPath: null,
          augmentingPaths: [...augmentingPaths],
          desc: {
            en: `Processing node ${u === source ? 'Source' : u === sink ? 'Sink' : u <= m ? `Experiment ${u}` : `Instrument ${u - m}`}.`,
            zh: `处理节点 ${u === source ? '源点' : u === sink ? '汇点' : u <= m ? `实验 ${u}` : `仪器 ${u - m}`}。`
          }
        });

        for (const v of graph[u]) {
          const residualCapacity = capacity[u][v] - flow[u][v];
          if (!visited[v] && residualCapacity > 0) {
            visited[v] = true;
            parent[v] = u;
            queue.push(v);

            steps.push({
              type: 'bfs_check',
              phase: 'bfs',
              graph: deepCloneWithInfinity(graph),
              capacity: deepCloneWithInfinity(capacity),
              flow: deepCloneWithInfinity(flow),
              maxFlow: maxFlowValue,
              visited: [...visited],
              queue: [...queue],
              currentNode: u,
              nextNode: v,
              residualCapacity: residualCapacity,
              bfsVisited: [...bfsVisited],
              currentPath: null,
              augmentingPaths: [...augmentingPaths],
              desc: {
                en: `Found edge ${u} -> ${v} with residual capacity ${residualCapacity}.`,
                zh: `找到边 ${u} -> ${v}，残量容量为 ${residualCapacity}。`
              }
            });

            if (v === sink) {
              foundPath = true;
              break;
            }
          }
        }
        if (foundPath) break;
      }

      if (!foundPath) {
        steps.push({
          type: 'bfs_not_found',
          phase: 'bfs',
          graph: deepCloneWithInfinity(graph),
          capacity: deepCloneWithInfinity(capacity),
          flow: deepCloneWithInfinity(flow),
          maxFlow: maxFlowValue,
          visited: [...visited],
          augmentingPaths: [...augmentingPaths],
          desc: {
            en: `No augmenting path found. Maximum flow: ${maxFlowValue}.`,
            zh: `未找到增广路径。最大流：${maxFlowValue}。`
          }
        });
        break;
      }

      // Reconstruct path and find minimum capacity
      const path = [];
      let pathFlow = Infinity;
      let s = sink;
      while (s !== source) {
        path.unshift(s);
        const u = parent[s];
        pathFlow = Math.min(pathFlow, capacity[u][s] - flow[u][s]);
        s = u;
      }
      path.unshift(source);

      steps.push({
        type: 'bfs_found',
        phase: 'bfs',
        graph: deepCloneWithInfinity(graph),
        capacity: deepCloneWithInfinity(capacity),
        flow: deepCloneWithInfinity(flow),
        maxFlow: maxFlowValue,
        augmentingPath: [...path],
        pathFlow: pathFlow,
        augmentingPaths: [...augmentingPaths],
        desc: {
          en: `Found augmenting path: ${path.join(' -> ')}. Minimum capacity: ${pathFlow}.`,
          zh: `找到增广路径：${path.join(' -> ')}。最小容量：${pathFlow}。`
        }
      });

      // Augment flow along the path
      maxFlowValue += pathFlow;
      augmentingPaths.push({ path: [...path], flow: pathFlow });

      steps.push({
        type: 'flow_init',
        phase: 'flow',
        graph: deepCloneWithInfinity(graph),
        capacity: deepCloneWithInfinity(capacity),
        flow: deepCloneWithInfinity(flow),
        maxFlow: maxFlowValue,
        augmentingPath: [...path],
        pathFlow: pathFlow,
        augmentingPaths: [...augmentingPaths],
        desc: {
          en: `Augmenting flow by ${pathFlow} along the path.`,
          zh: `沿路径增加流量 ${pathFlow}。`
        }
      });

      let v = sink;
      while (v !== source) {
        const u = parent[v];

        // Update flow first
        flow[u][v] += pathFlow;
        flow[v][u] -= pathFlow; // Backward edge

        steps.push({
          type: 'flow_update',
          phase: 'flow',
          graph: deepCloneWithInfinity(graph),
          capacity: deepCloneWithInfinity(capacity),
          flow: deepCloneWithInfinity(flow),
          maxFlow: maxFlowValue,
          augmentingPath: [...path],
          pathFlow: pathFlow,
          currentEdge: [u, v],
          augmentingPaths: [...augmentingPaths],
          desc: {
            en: `Updated edge ${u} -> ${v}: flow = ${flow[u][v]}, residual capacity = ${capacity[u][v] - flow[u][v]}.`,
            zh: `已更新边 ${u} -> ${v}：流量 = ${flow[u][v]}，残量容量 = ${capacity[u][v] - flow[u][v]}。`
          }
        });

        v = parent[v];
      }

      steps.push({
        type: 'flow_augment',
        phase: 'flow',
        graph: deepCloneWithInfinity(graph),
        capacity: deepCloneWithInfinity(capacity),
        flow: deepCloneWithInfinity(flow),
        maxFlow: maxFlowValue,
        augmentingPath: [...path],
        pathFlow: pathFlow,
        augmentingPaths: [...augmentingPaths],
        desc: {
          en: `Flow augmented. New total flow: ${maxFlowValue}.`,
          zh: `流量已增加。新的总流量：${maxFlowValue}。`
        }
      });
    }

    // Final result
    const maxProfit = totalRevenue - maxFlowValue;

    steps.push({
      type: 'flow_complete',
      phase: 'flow',
      graph: deepCloneWithInfinity(graph),
      capacity: deepCloneWithInfinity(capacity),
      flow: deepCloneWithInfinity(flow),
      maxFlow: maxFlowValue,
      totalRevenue: totalRevenue,
      maxProfit: maxProfit,
      augmentingPaths: [...augmentingPaths],
      desc: {
        en: `Algorithm complete. Maximum flow: ${maxFlowValue}. Maximum profit: ${maxProfit} (Revenue: ${totalRevenue} - Min Cut: ${maxFlowValue}).`,
        zh: `算法完成。最大流：${maxFlowValue}。最大利润：${maxProfit}（收益：${totalRevenue} - 最小割：${maxFlowValue}）。`
      }
    });

  } catch (error) {
    console.error('Error generating Max Flow steps:', error);
  }

  return steps;
};

