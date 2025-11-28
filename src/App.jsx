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
          
          <div className="flex gap-2 mt-4 md:mt-0 items-center">
            <div className="flex gap-2 overflow-x-auto">
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
            {hasSlides(algo) && (
              <button
                onClick={() => setShowSlides(true)}
                className="ml-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-green-600 text-white hover:bg-green-700 shadow-md flex items-center gap-2 whitespace-nowrap"
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
                <VizTitle title="Visualization / 可视化" />
              </div>
              <div className="mb-3">
                <VizTitle title="Text Stream / 文本流" />
                {renderHighlightText(text, step.i !== undefined ? [step.i] : [], 'bg-blue-200 border-blue-400', step.matches || [])}
              </div>
              <div className="mb-3">
                <VizTitle title="Pattern Window / 模式窗口" />
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
                  <VizTitle title="Code / 代码" />
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
                  <VizTitle title="Match History / 匹配历史" />
                  <div className="flex-1 min-h-0">
                    <NaiveMatchHistory matches={step.matches || []} showTitle={false} />
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle title="Statistics / 统计信息" />
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
                <VizTitle title="Visualization / 可视化" />
              </div>
              <div className="mb-3">
                <VizTitle title="Text Stream / 文本流" />
                {renderHighlightText(text, step.i !== undefined ? [step.i] : [], 'bg-blue-200 border-blue-400', step.matches || [])}
              </div>
              <div className="mb-3">
                <VizTitle title="Pattern Window / 模式窗口" />
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
                  <VizTitle title="Code / 代码" />
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
                  <VizTitle title="Next Table & Jumps / Next表与跳转" />
                  <div className="flex-1 min-h-0 overflow-auto space-y-3">
                    <KMPNextTable nextTable={step.nextTable} pattern={pattern} currentJ={step.j} />
                    <KMPJumpVisualization jumpHistory={step.jumpHistory || []} nextTable={step.nextTable} showTitle={false} />
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle title="Statistics / 统计信息" />
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
                <VizTitle title="Visualization / 可视化" />
              </div>
              <div className="mb-3">
                <VizTitle title="Text Stream / 文本流" />
                {renderHighlightText(text, [], 'bg-blue-200 border-blue-400', step.matches || [])}
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-6 flex flex-col min-h-0">
                  <VizTitle title="Code / 代码" />
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
                    <VizTitle title="Hash Values / 哈希值" />
                    <div className="flex-1 min-h-0 overflow-auto">
                      <RKHashVisualization step={step} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0 flex-1">
                    <VizTitle title="Details & Statistics / 详情与统计" />
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
              <VizTitle title="Text Stream / 文本流" />
              {renderHighlightText(text, step.i !== undefined ? [step.i] : [], 'bg-blue-200 border-blue-400', step.matches || [])}
            </div>
            <div className="border-t pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
                <div className="lg:col-span-4 flex flex-col min-h-0">
                  <VizTitle title="Code / 代码" />
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
                  <VizTitle title="Visualization / 可视化" />
                  <div className="flex-1 min-h-0 overflow-auto">
                    <ACAutomaton step={step} />
                  </div>
                </div>
                <div className="lg:col-span-3 flex flex-col min-h-0">
                  <VizTitle title="Transitions / 转移表" />
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
                    <VizTitle title="Match History / 匹配历史" />
                    <div className="flex-1 min-h-0">
                      <MatchHistoryTimeline matchHistory={step.matchHistory || []} currentStep={currentStep} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle title="State History / 状态历史" />
                    <div className="flex-1 min-h-0">
                      <StateTransitionHistory stateHistory={step.stateHistory || []} currentNode={step.node} stepType={step.type} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle title="Processing Flow / 处理流程" />
                    <div className="flex-1 min-h-0">
                      <CharacterProcessingFlow step={step} text={text} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle title="Statistics / 统计信息" />
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
                    <VizTitle title="Output Sets / 输出集合" />
                    <div className="flex-1 min-h-0">
                      <OutputSetVisualization trie={step.trie} currentNode={step.node} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle title="Optimized Transitions / 优化转移" />
                    <div className="flex-1 min-h-0">
                      <OptimizationVisualization trie={step.trie} currentNode={step.node} transitionChar={step.transitionChar} showTitle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0" style={{ minHeight: '180px' }}>
                    <VizTitle title="Failure Links / 失败链接" />
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

