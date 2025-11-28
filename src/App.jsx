import React, { useState, useEffect, useRef } from 'react';
import { Badge } from './components/Badge';
import { Card } from './components/Card';
import { VizTitle } from './components/VizTitle';
import { CodeViewer } from './components/CodeViewer';
import { renderHighlightText } from './components/TextHighlight';
import { AlgorithmLayout } from './components/AlgorithmLayout';
import PDFViewer from './components/PDFViewer';
import { generateNaiveSteps, generateKMPSteps, generateRKSteps, generateACSteps } from './utils/algorithmGenerators';
import { getCodeLineForStep, NAIVE_CODE, KMP_CODE, RK_CODE, AC_CODE } from './constants/codeSnippets';
import { hasSlides, getSlideInfo } from './constants/slides';
import { FileText } from 'lucide-react';
import { NaiveMatchHistory } from './components/visualizations/Naive/NaiveMatchHistory';
import { NaiveStatistics } from './components/visualizations/Naive/NaiveStatistics';
import { KMPNextTable } from './components/visualizations/KMP/KMPNextTable';
import { KMPJumpVisualization } from './components/visualizations/KMP/KMPJumpVisualization';
import { KMPStatistics } from './components/visualizations/KMP/KMPStatistics';
import { RKHashVisualization } from './components/visualizations/RK/RKHashVisualization';
import { RKHashDetails } from './components/visualizations/RK/RKHashDetails';
import { RKStatistics } from './components/visualizations/RK/RKStatistics';
import { ACAutomaton } from './components/visualizations/AC/ACAutomaton';
import {
  TransitionTable,
  MatchHistoryTimeline,
  StateTransitionHistory,
  OutputSetVisualization,
  CharacterProcessingFlow,
  OptimizationVisualization,
  FailureLinkTree,
  MatchCounterStats
} from './components/visualizations/AC';

const App = () => {
  const [algo, setAlgo] = useState('naive');
  const [text, setText] = useState('ababcabcacbab');
  const [pattern, setPattern] = useState('abcac');
  const [patternsAC, setPatternsAC] = useState('arrows, row, sun, under');
  
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [showSlides, setShowSlides] = useState(false);

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
          
          <div className="flex gap-2 mt-4 md:mt-0 items-center flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {['naive', 'kmp', 'rk', 'ac'].map(key => (
                <button
                  key={key}
                  onClick={() => setAlgo(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex flex-col items-center ${
                    algo === key 
                      ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                      : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
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
            {hasSlides(algo) && (
              <button
                onClick={() => setShowSlides(true)}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-green-600 text-white hover:bg-green-700 shadow-md flex items-center gap-2 whitespace-nowrap"
                title="View Slides / 查看幻灯片"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Slides / 幻灯片</span>
              </button>
            )}
          </div>
        </header>

        {/* Configuration Panel */}
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
                {algo === 'ac' ? (
                  <>Patterns (comma separated) <span className="text-gray-400 font-normal ml-1">/ 模式串 (逗号分隔)</span></>
                ) : (
                  <>Pattern <span className="text-gray-400 font-normal ml-1">/ 模式串</span></>
                )}
              </label>
              {algo === 'ac' ? (
                <input 
                  type="text" 
                  value={patternsAC} 
                  onChange={(e) => setPatternsAC(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow duration-200"
                />
              ) : (
                <input 
                  type="text" 
                  value={pattern} 
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-shadow duration-200"
                />
              )}
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

        {/* Algorithm-specific visualizations */}
        {algo === 'naive' && (
          <AlgorithmLayout
            title="Visualization / 演示"
            step={step}
            currentStep={currentStep}
            steps={steps}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setCurrentStep={setCurrentStep}
          >
            <div className="mb-3 flex-shrink-0">
              <div className="mb-2">
                <VizTitle 
                  title="Visualization / 可视化"
                  tooltip={{
                    title: "Algorithm Visualization",
                    description: "Shows the pattern window sliding over the text. Each position is checked character by character.",
                    zh: "显示模式窗口在文本上滑动。每个位置都逐字符检查。"
                  }}
                />
              </div>
              <div className="mb-3">
                <VizTitle 
                  title="Text Stream / 文本流"
                  tooltip={{
                    title: "Text Stream",
                    description: "The input text being processed. The highlighted character shows the current position being examined.",
                    zh: "正在处理的输入文本。高亮字符显示当前正在检查的位置。"
                  }}
                />
                {renderHighlightText(text, step.i !== undefined ? [step.i] : [], 'bg-blue-200 border-blue-400', step.matches || [])}
              </div>
              <div className="mb-3">
                <VizTitle 
                  title="Pattern Window / 模式窗口"
                  tooltip={{
                    title: "Pattern Window",
                    description: "Shows the pattern aligned with the current text position. The pattern slides over the text as the algorithm progresses.",
                    zh: "显示与当前文本位置对齐的模式。模式在算法进行时在文本上滑动。"
                  }}
                />
                <div className="relative h-20">
                  <div style={{ transform: `translateX(${(step.i || 0) * 36}px)` }} className="transition-transform duration-500 absolute left-0 top-0">
                    {renderHighlightText(pattern, step.j !== undefined ? [step.j] : [], 'bg-orange-200 border-orange-400')}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle 
                    title="Code / 代码"
                    tooltip={{
                      title: "Code Viewer",
                      description: "Shows the executing code for the Naive string matching algorithm. The highlighted line indicates the current execution point.",
                      zh: "显示朴素字符串匹配算法的执行代码。高亮行表示当前执行位置。"
                    }}
                  />
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <CodeViewer 
                      code={NAIVE_CODE}
                      highlightedLine={getCodeLineForStep('naive', step.type, step)}
                      stepType={step.type}
                      fileName="naive_search.cpp"
                      algorithmName="Naive String Matching"
                    />
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle 
                    title="Match History / 匹配历史"
                    tooltip={{
                      title: "Match History Timeline",
                      description: "Chronological list of all patterns found during execution. Shows pattern name, position in text, step number, and state where match occurred.",
                      zh: "执行过程中找到的所有模式的按时间顺序列表。显示模式名称、文本中的位置、步骤号和匹配发生的状态。"
                    }}
                  />
                  <div className="flex-1 min-h-0">
                    <NaiveMatchHistory matches={step.matches || []} showTitle={false} />
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle 
                    title="Statistics / 统计信息"
                    tooltip={{
                      title: "Match Counter & Statistics",
                      description: "Shows total matches found, matches per pattern, and processing statistics like first/last match positions and unique pattern count.",
                      zh: "显示找到的总匹配数、每个模式的匹配数以及处理统计信息，如第一个/最后一个匹配位置和唯一模式计数。"
                    }}
                  />
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
            </div>
          </AlgorithmLayout>
        )}

        {algo === 'kmp' && (
          <AlgorithmLayout
            title="Visualization / 演示"
            step={step}
            currentStep={currentStep}
            steps={steps}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setCurrentStep={setCurrentStep}
          >
            <div className="mb-3 flex-shrink-0">
              <div className="mb-2">
                <VizTitle 
                  title="Visualization / 可视化"
                  tooltip={{
                    title: "Algorithm Visualization",
                    description: "Shows the KMP algorithm with the Next (LPS) table. Pattern index jumps are visualized when mismatches occur.",
                    zh: "显示带有 Next (LPS) 表的 KMP 算法。当出现不匹配时可视化模式索引跳转。"
                  }}
                />
              </div>
              <div className="mb-3">
                <VizTitle 
                  title="Text Stream / 文本流"
                  tooltip={{
                    title: "Text Stream",
                    description: "The input text being processed. The highlighted character shows the current position being examined.",
                    zh: "正在处理的输入文本。高亮字符显示当前正在检查的位置。"
                  }}
                />
                {renderHighlightText(text, step.i !== undefined ? [step.i] : [], 'bg-blue-200 border-blue-400', step.matches || [])}
              </div>
              <div className="mb-3">
                <VizTitle 
                  title="Pattern Window / 模式窗口"
                  tooltip={{
                    title: "Pattern Window",
                    description: "Shows the pattern aligned with the current text position. The pattern slides over the text as the algorithm progresses.",
                    zh: "显示与当前文本位置对齐的模式。模式在算法进行时在文本上滑动。"
                  }}
                />
                <div className="relative h-20">
                  <div style={{ transform: `translateX(${(step.i || 0) * 36}px)` }} className="transition-transform duration-500 absolute left-0 top-0">
                    {renderHighlightText(pattern, step.j !== undefined ? [step.j] : [], 'bg-orange-200 border-orange-400')}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle 
                    title="Code / 代码"
                    tooltip={{
                      title: "Code Viewer",
                      description: "Shows the executing code for the KMP algorithm. The highlighted line indicates the current execution point.",
                      zh: "显示 KMP 算法的执行代码。高亮行表示当前执行位置。"
                    }}
                  />
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <CodeViewer 
                      code={KMP_CODE}
                      highlightedLine={getCodeLineForStep('kmp', step.type, step)}
                      stepType={step.type}
                      fileName="kmp_search.cpp"
                      algorithmName="KMP Algorithm"
                    />
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle 
                    title="Next Table & Jumps / Next表与跳转"
                    tooltip={{
                      title: "Next Table & Jump History",
                      description: "Shows the Next (LPS) table and pattern index jumps. Visualizes how the algorithm skips unnecessary comparisons.",
                      zh: "显示 Next (LPS) 表和模式索引跳转。可视化算法如何跳过不必要的比较。"
                    }}
                  />
                  <div className="flex-1 min-h-0 overflow-auto space-y-3">
                    <KMPNextTable nextTable={step.nextTable} pattern={pattern} currentJ={step.j} />
                    <KMPJumpVisualization jumpHistory={step.jumpHistory || []} nextTable={step.nextTable} showTitle={false} />
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle 
                    title="Statistics / 统计信息"
                    tooltip={{
                      title: "Match Counter & Statistics",
                      description: "Shows total matches found, matches per pattern, and processing statistics like first/last match positions and unique pattern count.",
                      zh: "显示找到的总匹配数、每个模式的匹配数以及处理统计信息，如第一个/最后一个匹配位置和唯一模式计数。"
                    }}
                  />
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
            </div>
          </AlgorithmLayout>
        )}

        {algo === 'rk' && (
          <AlgorithmLayout
            title="Visualization / 演示"
            step={step}
            currentStep={currentStep}
            steps={steps}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setCurrentStep={setCurrentStep}
          >
            <div className="mb-3 flex-shrink-0">
              <div className="mb-2">
                <VizTitle 
                  title="Visualization / 可视化"
                  tooltip={{
                    title: "Algorithm Visualization",
                    description: "Shows hash values for pattern and text window. Rolling hash updates are animated.",
                    zh: "显示模式和文本窗口的哈希值。滚动哈希更新是动画的。"
                  }}
                />
              </div>
              <div className="mb-3">
                <VizTitle 
                  title="Text Stream / 文本流"
                  tooltip={{
                    title: "Text Stream",
                    description: "The input text being processed. The highlighted character shows the current position being examined.",
                    zh: "正在处理的输入文本。高亮字符显示当前正在检查的位置。"
                  }}
                />
                {renderHighlightText(text, [], 'bg-blue-200 border-blue-400', step.matches || [])}
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-6 flex flex-col min-h-0">
                  <VizTitle 
                    title="Code / 代码"
                    tooltip={{
                      title: "Code Viewer",
                      description: "Shows the executing code for the Rabin-Karp algorithm. The highlighted line indicates the current execution point.",
                      zh: "显示 Rabin-Karp 算法的执行代码。高亮行表示当前执行位置。"
                    }}
                  />
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <CodeViewer 
                      code={RK_CODE}
                      highlightedLine={getCodeLineForStep('rk', step.type, step)}
                      stepType={step.type}
                      fileName="rabin_karp.cpp"
                      algorithmName="Rabin-Karp Algorithm"
                    />
                  </div>
                </div>
                <div className="lg:col-span-6 flex flex-col min-h-0 gap-3">
                  <div className="flex flex-col min-h-0 flex-shrink-0">
                    <VizTitle 
                      title="Hash Values / 哈希值"
                      tooltip={{
                        title: "Hash Visualization",
                        description: "Shows pattern hash (Hp) and window hash (Ht) values with rolling hash animations.",
                        zh: "显示模式哈希 (Hp) 和窗口哈希 (Ht) 值，带有滚动哈希动画。"
                      }}
                    />
                    <div className="flex-1 min-h-0 overflow-auto">
                      <RKHashVisualization step={step} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0 flex-1">
                    <VizTitle 
                      title="Details & Statistics / 详情与统计"
                      tooltip={{
                        title: "Hash Details & Statistics",
                        description: "Shows hash parameters, rolling hash formula, collision information, and match statistics.",
                        zh: "显示哈希参数、滚动哈希公式、冲突信息和匹配统计。"
                      }}
                    />
                    <div className="flex-1 min-h-0 overflow-auto space-y-3">
                      <RKHashDetails step={step} showTitle={false} />
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
            </div>
          </AlgorithmLayout>
        )}

        {algo === 'ac' && (
          <AlgorithmLayout
            title="Visualization / 演示"
            step={step}
            currentStep={currentStep}
            steps={steps}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setCurrentStep={setCurrentStep}
          >
            <div className="mb-2 flex-shrink-0">
              <VizTitle 
                title="Text Stream / 文本流"
                tooltip={{
                  title: "Text Stream",
                  description: "The input text being processed character by character. Matched patterns are highlighted with different colors and labeled above. The blue highlight shows the current character being processed.",
                  zh: "正在逐字符处理的输入文本。匹配的模式用不同颜色高亮并在上方标注。蓝色高亮显示当前正在处理的字符。"
                }}
              />
              {renderHighlightText(text, step.i !== undefined ? [step.i] : [], 'bg-blue-200 border-blue-400', step.matches || [])}
            </div>
            <div className="border-t pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle 
                    title="Code / 代码"
                    tooltip={{
                      title: "Code Viewer",
                      description: "Shows the executing C++ code for the Aho-Corasick algorithm. The highlighted line indicates the current execution point.",
                      zh: "显示 Aho-Corasick 算法的执行代码。高亮行表示当前执行位置。"
                    }}
                  />
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
                <div className="lg:col-span-5 flex flex-col min-h-0">
                  <VizTitle 
                    title="Visualization / 可视化"
                    tooltip={{
                      title: "AC Automaton (Trie)",
                      description: "Interactive graph showing the AC automaton structure. Solid arrows are character transitions, dashed red arrows are failure links. The blue circle highlights the current state.",
                      zh: "显示 AC 自动机结构的交互式图。实线箭头是字符转移，红色虚线箭头是失败链接。蓝色圆圈高亮当前状态。"
                    }}
                  />
                  <div className="flex-1 min-h-0 overflow-auto">
                    <ACAutomaton step={step} />
                  </div>
                </div>
                <div className="lg:col-span-3 flex flex-col min-h-0">
                  <VizTitle 
                    title="Transitions / 转移表"
                    tooltip={{
                      title: "Transition Table",
                      description: "Table showing all possible character transitions from each state. The highlighted row is the current state, and highlighted cells show active transitions.",
                      zh: "显示每个状态的所有可能字符转移的表。高亮行是当前状态，高亮单元格显示活动转移。"
                    }}
                  />
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
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle 
                      title="Match History / 匹配历史"
                      tooltip={{
                        title: "Match History Timeline",
                        description: "Chronological list of all patterns found during execution. Shows pattern name, position in text, step number, and state where match occurred.",
                        zh: "执行过程中找到的所有模式的按时间顺序列表。显示模式名称、文本中的位置、步骤号和匹配发生的状态。"
                      }}
                    />
                    <div className="flex-1 min-h-0">
                      <MatchHistoryTimeline matchHistory={step.matchHistory || []} currentStep={currentStep} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle 
                      title="State History / 状态历史"
                      tooltip={{
                        title: "State Transition History",
                        description: "Breadcrumb trail showing the sequence of states visited during execution. The highlighted state is the current one.",
                        zh: "显示执行过程中访问的状态序列的面包屑轨迹。高亮状态是当前状态。"
                      }}
                    />
                    <div className="flex-1 min-h-0">
                      <StateTransitionHistory stateHistory={step.stateHistory || []} currentNode={step.node} stepType={step.type} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle 
                      title="Processing Flow / 处理流程"
                      tooltip={{
                        title: "Character Processing Flow",
                        description: "Step-by-step visualization of how each character is processed: reading, checking transitions, following failure links, and checking outputs.",
                        zh: "每个字符处理方式的逐步可视化：读取、检查转移、跟随失败链接和检查输出。"
                      }}
                    />
                    <div className="flex-1 min-h-0">
                      <CharacterProcessingFlow step={step} text={text} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle 
                      title="Statistics / 统计信息"
                      tooltip={{
                        title: "Match Counter & Statistics",
                        description: "Shows total matches found, matches per pattern, and processing statistics like first/last match positions and unique pattern count.",
                        zh: "显示找到的总匹配数、每个模式的匹配数以及处理统计信息，如第一个/最后一个匹配位置和唯一模式计数。"
                      }}
                    />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle 
                      title="Output Sets / 输出集合"
                      tooltip={{
                        title: "Output Set Visualization",
                        description: "Lists all states that have output patterns. Shows which patterns end at each state. The current state is highlighted.",
                        zh: "列出所有具有输出模式的状态。显示哪些模式在每个状态结束。当前状态被高亮显示。"
                      }}
                    />
                    <div className="flex-1 min-h-0">
                      <OutputSetVisualization trie={step.trie} currentNode={step.node} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle 
                      title="Optimized Transitions / 优化转移"
                      tooltip={{
                        title: "Optimization Visualization",
                        description: "Shows the optimized direct transitions (O(1)) from the current state. These transitions avoid following failure links by pre-computing them during automaton construction.",
                        zh: "显示从当前状态的优化直接转移（O(1)）。这些转移通过在自动机构建期间预计算来避免跟随失败链接。"
                      }}
                    />
                    <div className="flex-1 min-h-0">
                      <OptimizationVisualization trie={step.trie} currentNode={step.node} transitionChar={step.transitionChar} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle 
                      title="Failure Links / 失败链接"
                      tooltip={{
                        title: "Failure Link Tree",
                        description: "Simplified view showing only the failure links in the automaton. Failure links point to the longest proper suffix that is also a prefix of some pattern.",
                        zh: "仅显示自动机中失败链接的简化视图。失败链接指向某个模式的最长真后缀，同时也是某个模式的前缀。"
                      }}
                    />
                    <div className="flex-1 min-h-0">
                      <FailureLinkTree trie={step.trie} layout={step.layout} currentNode={step.node} stepType={step.type} showTitle={false} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AlgorithmLayout>
        )}

        {/* PDF Slides Viewer */}
        {showSlides && hasSlides(algo) && (
          <PDFViewer
            pdfPath={getSlideInfo(algo).path}
            title={`${getSlideInfo(algo).title} / ${getSlideInfo(algo).titleZh}`}
            onClose={() => setShowSlides(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;

