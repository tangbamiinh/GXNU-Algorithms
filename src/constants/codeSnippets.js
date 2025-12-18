// Naive Algorithm Code
export const NAIVE_CODE = [
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
export const KMP_CODE = [
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
export const RK_CODE = [
  { line: 1, code: "int rabin_karp(string text, string pattern) {", phase: "search" },
  { line: 2, code: "    int d = 256, q = 101;", phase: "search" },
  { line: 3, code: "    int m = pattern.length();", phase: "search" },
  { line: 4, code: "    int n = text.length();", phase: "search" },
  { line: 5, code: "    int h = 1, p = 0, t = 0;", phase: "search" },
  { line: 6, code: "", phase: "search" },
  { line: 7, code: "    // Calculate h = d^(m-1) % q", phase: "search" },
  { line: 8, code: "    for (int i = 0; i < m - 1; i++) {", phase: "search" },
  { line: 9, code: "        h = (h * d) % q;", phase: "search" },
  { line: 10, code: "    }", phase: "search" },
  { line: 11, code: "", phase: "search" },
  { line: 12, code: "    // Calculate initial hash values", phase: "search" },
  { line: 13, code: "    for (int i = 0; i < m; i++) {", phase: "search" },
  { line: 14, code: "        p = (d * p + pattern[i]) % q;", phase: "search" },
  { line: 15, code: "        t = (d * t + text[i]) % q;", phase: "search" },
  { line: 16, code: "    }", phase: "search" },
  { line: 17, code: "", phase: "search" },
  { line: 18, code: "    for (int i = 0; i <= n - m; i++) {", phase: "search" },
  { line: 19, code: "        if (p == t) {", phase: "search" },
  { line: 20, code: "            // Verify by comparing characters", phase: "search" },
  { line: 21, code: "            if (text.substr(i, m) == pattern) {", phase: "search" },
  { line: 22, code: "                return i;", phase: "search" },
  { line: 23, code: "            }", phase: "search" },
  { line: 24, code: "        }", phase: "search" },
  { line: 25, code: "        if (i < n - m) {", phase: "search" },
  { line: 26, code: "            // Rolling hash", phase: "search" },
  { line: 27, code: "            t = (d * (t - text[i] * h) + text[i+m]) % q;", phase: "search" },
  { line: 28, code: "            if (t < 0) t += q;", phase: "search" },
  { line: 29, code: "        }", phase: "search" },
  { line: 30, code: "    }", phase: "search" },
  { line: 31, code: "    return -1;", phase: "search" },
  { line: 32, code: "}", phase: "search" },
];

// AC Algorithm Code - Node Structure
export const AC_NODE_CODE = [
  { line: 1, code: "// The fundamental node structure", phase: "build" },
  { line: 2, code: "// 基础节点结构", phase: "build" },
  { line: 3, code: "typedef struct node {", phase: "build" },
  { line: 4, code: "    int cnt;", phase: "build" },
  { line: 5, code: "    node* fail;", phase: "build" },
  { line: 6, code: "    node* go[dsize];", phase: "build" },
  { line: 7, code: "    vector<string> output;", phase: "build" },
  { line: 8, code: "} tnode;", phase: "build" },
];

// AC Algorithm Code - Insert Function
export const AC_INSERT_CODE = [
  { line: 1, code: "// Function to insert a pattern into the trie", phase: "build" },
  { line: 2, code: "// 将一个模式串插入 Trie 的函数", phase: "build" },
  { line: 3, code: "void insert(const string& word) {", phase: "build" },
  { line: 4, code: "    tnode* cur = root;", phase: "build" },
  { line: 5, code: "    for(int i=0; i < word.length(); ++i) {", phase: "build" },
  { line: 6, code: "        if (!cur->go[idx[word[i]]])", phase: "build" },
  { line: 7, code: "            cur->go[idx[word[i]]] = newnode();", phase: "build" },
  { line: 8, code: "        cur = cur->go[idx[word[i]]];", phase: "build" },
  { line: 9, code: "    }", phase: "build" },
  { line: 10, code: "    cur->output.push_back(word);", phase: "build" },
  { line: 11, code: "    cur->cnt += 1;", phase: "build" },
  { line: 12, code: "}", phase: "build" },
];

// AC Algorithm Code - Build Failure Function
export const AC_BUILD_FAILURE_CODE = [
  { line: 1, code: "// 构建失败指针", phase: "build" },
  { line: 2, code: "void build_failure() {", phase: "build" },
  { line: 3, code: "    queue<tnode*> q;", phase: "build" },
  { line: 4, code: "    root->fail = NULL;", phase: "build" },
  { line: 5, code: "    q.push(root);", phase: "build" },
  { line: 6, code: "", phase: "build" },
  { line: 7, code: "    while(!q.empty()) {", phase: "build" },
  { line: 8, code: "        tnode* cur = q.front(); q.pop();", phase: "build" },
  { line: 9, code: "", phase: "build" },
  { line: 10, code: "        for(int i=0; i < dsize; ++i) {", phase: "build" },
  { line: 11, code: "            if(cur->go[i]) {", phase: "build" },
  { line: 12, code: "                // State exists, find its failure link", phase: "build" },
  { line: 13, code: "                tnode* p = cur->fail;", phase: "build" },
  { line: 14, code: "                // Traverse failure links of parent to find fallback", phase: "build" },
  { line: 15, code: "                while(p && !p->go[i]) p = p->fail;", phase: "build" },
  { line: 16, code: "                if(p)", phase: "build" },
  { line: 17, code: "                    cur->go[i]->fail = p->go[i];", phase: "build" },
  { line: 18, code: "                else", phase: "build" },
  { line: 19, code: "                    cur->go[i]->fail = root;", phase: "build" },
  { line: 20, code: "                q.push(cur->go[i]);", phase: "build" },
  { line: 21, code: "            } else {", phase: "build" },
  { line: 22, code: "                // State does not exist, fill it in for faster search", phase: "build" },
  { line: 23, code: "                // This is a key optimization: pre-computing transitions", phase: "build" },
  { line: 24, code: "                // 这是一个关键优化:预计算状态转换", phase: "build" },
  { line: 25, code: "                cur->go[i] = (cur == root) ? root : cur->fail->go[i];", phase: "build" },
  { line: 26, code: "            }", phase: "build" },
  { line: 27, code: "        }", phase: "build" },
  { line: 28, code: "    }", phase: "build" },
  { line: 29, code: "}", phase: "build" },
];

// AC Algorithm Code - Search Function (from textbook)
export const AC_SEARCH_CODE = [
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

// Legacy AC_CODE for backward compatibility
export const AC_CODE = AC_SEARCH_CODE;

// Max Flow Algorithm Code (Edmonds-Karp) - Python
export const MAXFLOW_CODE = [
  { line: 1, code: "    def max_flow(self):", phase: "flow" },
  { line: 2, code: "        max_flow_value = 0", phase: "flow" },
  { line: 3, code: "        parent = [-1] * self.num_nodes", phase: "flow" },
  { line: 4, code: "", phase: "flow" },
  { line: 5, code: "        # While there is a path from source to sink in residual graph", phase: "flow" },
  { line: 6, code: "        # 当残量图中存在从源点到汇点的路径时", phase: "flow" },
  { line: 7, code: "        while self.bfs(parent):", phase: "flow" },
  { line: 8, code: "            path_flow = float('Inf')", phase: "flow" },
  { line: 9, code: "            s = self.sink", phase: "flow" },
  { line: 10, code: "", phase: "flow" },
  { line: 11, code: "            # Find the minimum residual capacity in the path found", phase: "flow" },
  { line: 12, code: "            # 找出所发现路径中的最小残量容量（即路径的瓶颈）", phase: "flow" },
  { line: 13, code: "            while s != self.source:", phase: "flow" },
  { line: 14, code: "                path_flow = min(path_flow, self.capacity[parent[s]][s])", phase: "flow" },
  { line: 15, code: "                s = parent[s]", phase: "flow" },
  { line: 16, code: "", phase: "flow" },
  { line: 17, code: "            # Update residual capacities of the edges and reverse edges", phase: "flow" },
  { line: 18, code: "            # 更新边和反向边的残量容量", phase: "flow" },
  { line: 19, code: "            max_flow_value += path_flow", phase: "flow" },
  { line: 20, code: "            v = self.sink", phase: "flow" },
  { line: 21, code: "            while v != self.source:", phase: "flow" },
  { line: 22, code: "                u = parent[v]", phase: "flow" },
  { line: 23, code: "                self.capacity[u][v] -= path_flow  # Decrease forward capacity", phase: "flow" },
  { line: 24, code: "                # 减少正向边的容量", phase: "flow" },
  { line: 25, code: "                self.capacity[v][u] += path_flow  # Increase backward capacity", phase: "flow" },
  { line: 26, code: "                # 增加反向边的容量", phase: "flow" },
  { line: 27, code: "                v = parent[v]", phase: "flow" },
  { line: 28, code: "", phase: "flow" },
  { line: 29, code: "        return max_flow_value", phase: "flow" },
];

// Max Flow BFS Code - Python
export const MAXFLOW_BFS_CODE = [
  { line: 1, code: "    def bfs(self, parent):", phase: "bfs" },
  { line: 2, code: "        # Find an augmenting path from source to sink using BFS", phase: "bfs" },
  { line: 3, code: "        # 使用 BFS（广度优先搜索）查找从源点到汇点的增广路径", phase: "bfs" },
  { line: 4, code: "        visited = [False] * self.num_nodes", phase: "bfs" },
  { line: 5, code: "        queue = deque([self.source])", phase: "bfs" },
  { line: 6, code: "        visited[self.source] = True", phase: "bfs" },
  { line: 7, code: "        parent[self.source] = -1", phase: "bfs" },
  { line: 8, code: "", phase: "bfs" },
  { line: 9, code: "        while queue:", phase: "bfs" },
  { line: 10, code: "            u = queue.popleft()", phase: "bfs" },
  { line: 11, code: "            for v in self.graph[u]:", phase: "bfs" },
  { line: 12, code: "                # If v is not visited and there is residual capacity", phase: "bfs" },
  { line: 13, code: "                # 如果 v 未被访问且存在残量容量（即可以有流量通过）", phase: "bfs" },
  { line: 14, code: "                if not visited[v] and self.capacity[u][v] > 0:", phase: "bfs" },
  { line: 15, code: "                    queue.append(v)", phase: "bfs" },
  { line: 16, code: "                    visited[v] = True", phase: "bfs" },
  { line: 17, code: "                    parent[v] = u", phase: "bfs" },
  { line: 18, code: "                    if v == self.sink:", phase: "bfs" },
  { line: 19, code: "                        return True", phase: "bfs" },
  { line: 20, code: "        return False", phase: "bfs" },
];

// Map step types to code lines with context
export const getCodeLineForStep = (algo, stepType, step) => {
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
    const phase = step && step.phase;

    if (phase === 'build_trie') {
      // Stage 1: Building Trie - Node struct: lines 1-8, Insert: lines 10-21
      if (stepType === 'build_init') return 1; // Start of node struct
      if (stepType === 'insert_start') return 10; // insert function start
      if (stepType === 'insert_char') return 12; // for loop
      if (stepType === 'insert_check') return 13; // if check
      if (stepType === 'insert_create') return 14; // newnode()
      if (stepType === 'insert_move') return 15; // cur = cur->go[...]
      if (stepType === 'insert_output') return 17; // output.push_back
      if (stepType === 'stage1_complete') return 21; // end of insert function
    } else if (phase === 'build_failure') {
      // Stage 2: Building Failure Links - lines 1-29
      if (stepType === 'build_fail_init') return 2; // build_failure start
      if (stepType === 'build_fail_queue') return 5; // q.push(root)
      if (stepType === 'build_fail_loop') return 7; // while loop
      if (stepType === 'build_fail_check') return 11; // if(cur->go[i])
      if (stepType === 'build_fail_traverse') return 15; // while(p && !p->go[i])
      if (stepType === 'build_fail_set') return 17; // cur->go[i]->fail = ...
      if (stepType === 'build_fail_optimize') return 25; // else optimization
      if (stepType === 'stage2_complete') return 29; // end of function
    } else {
      // Stage 3: Search phase
      if (stepType === 'input') return 5;
      if (stepType === 'goto') return 8;
      if (stepType === 'match') return 10;
      if (stepType === 'fail') return 7;
    }
    return null;
  }

  if (algo === 'maxflow') {
    const phase = step && step.phase;

    if (phase === 'bfs') {
      // BFS phase
      if (stepType === 'bfs_init') return 1;
      if (stepType === 'bfs_queue') return 5;
      if (stepType === 'bfs_loop') return 9;
      if (stepType === 'bfs_check') return 14;
      if (stepType === 'bfs_visit') return 16;
      if (stepType === 'bfs_found') return 19;
      if (stepType === 'bfs_not_found') return 20;
    } else {
      // Flow augmentation phase
      if (stepType === 'flow_init') return 1;
      if (stepType === 'flow_while') return 7;
      if (stepType === 'flow_find_min') return 13;
      if (stepType === 'flow_update') return 21;
      if (stepType === 'flow_augment') return 19;
      if (stepType === 'flow_complete') return 29;
    }
    return null;
  }

  return null;
};

// Get appropriate AC code based on phase
export const getACCode = (phase) => {
  if (phase === 'build_trie') {
    // Stage 1: Building the Trie
    let lineNum = 1;
    const combined = [];

    // Add node struct code
    AC_NODE_CODE.forEach(line => {
      combined.push({ ...line, line: lineNum++ });
    });

    // Add blank line
    combined.push({ line: lineNum++, code: "", phase: "build_trie" });

    // Add insert function code
    AC_INSERT_CODE.forEach(line => {
      combined.push({ ...line, line: lineNum++ });
    });

    return combined;
  } else if (phase === 'build_failure') {
    // Stage 2: Building Failure Links
    let lineNum = 1;
    const combined = [];

    // Add build_failure function code
    AC_BUILD_FAILURE_CODE.forEach(line => {
      combined.push({ ...line, line: lineNum++ });
    });

    return combined;
  } else {
    // Stage 3: Search
    return AC_SEARCH_CODE;
  }
};

// Get appropriate Max Flow code based on phase
export const getMaxFlowCode = (phase) => {
  if (phase === 'bfs') {
    return MAXFLOW_BFS_CODE;
  } else {
    return MAXFLOW_CODE;
  }
};
