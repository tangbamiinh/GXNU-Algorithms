import { Hash } from 'lucide-react';

export const RKHashVisualization = ({ step }) => {
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

