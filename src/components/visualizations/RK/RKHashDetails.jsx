export const RKHashDetails = ({ step, showTitle = true }) => {
  if (!step || step.hp === undefined) return null;
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Hash Details / 哈希详情
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3 space-y-3">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-indigo-800 mb-2">Parameters</div>
          <div className="text-xs text-gray-700 space-y-1">
            <div>Base (d): {step.d || 256}</div>
            <div>Modulus (q): {step.q || 101}</div>
            <div>Multiplier (h): {step.h || 1}</div>
          </div>
        </div>
        {step.type === 'roll' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-yellow-800 mb-2">Rolling Hash Formula</div>
            <div className="text-xs text-gray-700 font-mono">
              H<sub>t</sub> = (d × (H<sub>t</sub> - T[i] × h) + T[i+m]) mod q
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Remove: '{step.removed}' | Add: '{step.added}'
            </div>
          </div>
        )}
        {step.hashCollisions !== undefined && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-red-800 mb-1">Hash Collisions</div>
            <div className="text-xl font-bold text-red-800">{step.hashCollisions}</div>
            <div className="text-xs text-gray-600 mt-1">False positives requiring verification</div>
          </div>
        )}
      </div>
    </div>
  );
};

