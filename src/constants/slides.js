// PDF slides mapping for each algorithm
export const SLIDE_PDFS = {
  naive: {
    path: '/data/slides/Naive_String_Matching.pdf',
    title: 'Naive String Matching',
    titleZh: '朴素字符串匹配'
  },
  kmp: {
    path: '/data/slides/KMP_Algorithm_Intelligent_String_Matching.pdf',
    title: 'KMP Algorithm: Intelligent String Matching',
    titleZh: 'KMP算法：智能字符串匹配'
  },
  rk: {
    path: '/data/slides/Rabin_Karp_String_Matching_Hashing_Story.pdf',
    title: 'Rabin-Karp String Matching: Hashing Story',
    titleZh: 'Rabin-Karp 字符串匹配：哈希故事'
  },
  ac: {
    path: '/data/slides/Aho-Corasick_Multi-Pattern_Search.pdf',
    title: 'Aho-Corasick Multi-Pattern Search',
    titleZh: 'Aho-Corasick 多模式搜索'
  }
};

// Check if slides are available for an algorithm
export const hasSlides = (algorithm) => {
  return algorithm in SLIDE_PDFS;
};

// Get slide info for an algorithm
export const getSlideInfo = (algorithm) => {
  return SLIDE_PDFS[algorithm] || null;
};

