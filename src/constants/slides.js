// PDF slides mapping for each algorithm
export const SLIDE_PDFS = {
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

