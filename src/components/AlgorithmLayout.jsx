import React from 'react';
import { Info } from 'lucide-react';
import { Card } from './Card';
import { ControlButton } from './ControlButton';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

export const AlgorithmLayout = ({ 
  title, 
  step, 
  currentStep, 
  steps, 
  isPlaying, 
  setIsPlaying, 
  setCurrentStep,
  children 
}) => {
  return (
    <Card 
      title={
        <div className="flex items-center justify-between w-full">
          <span>{title}</span>
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
        {children}
      </div>
    </Card>
  );
};

