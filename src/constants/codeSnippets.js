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

// AC Algorithm Code (from textbook)
export const AC_CODE = [
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
    if (stepType === 'input') return 5;
    if (stepType === 'goto') return 8;
    if (stepType === 'match') return 10;
    if (stepType === 'fail') return 7;
    return null;
  }
  
  return null;
};

