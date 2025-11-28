export const CharacterProcessingFlow = ({ step, text, showTitle = true }) => {
  if (!step || step.i === undefined) return null;
  
  const currentChar = text[step.i];
  const flowSteps = [];
  
  if (step.type === 'input') {
    flowSteps.push({ label: 'Read Char', value: `'${currentChar}'`, color: 'blue' });
    flowSteps.push({ label: 'Check Transition', value: `State ${step.node}`, color: 'yellow' });
  } else if (step.type === 'fail') {
    flowSteps.push({ label: 'No Transition', value: `'${currentChar}'`, color: 'red' });
    flowSteps.push({ label: 'Follow Fail', value: `${step.prevNode} → ${step.node}`, color: 'orange' });
  } else if (step.type === 'goto') {
    flowSteps.push({ label: 'Transition Found', value: `${step.prevNode} --${step.transitionChar}--> ${step.node}`, color: 'green' });
  } else if (step.type === 'match') {
    flowSteps.push({ label: 'Check Output', value: `State ${step.node}`, color: 'purple' });
    flowSteps.push({ label: 'Match Found', value: step.found.join(', '), color: 'green' });
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Processing Flow / 处理流程
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-3">
          {flowSteps.map((flowStep, idx) => {
            const colors = {
              blue: 'bg-blue-100 border-blue-400 text-blue-800',
              yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
              red: 'bg-red-100 border-red-400 text-red-800',
              orange: 'bg-orange-100 border-orange-400 text-orange-800',
              green: 'bg-green-100 border-green-400 text-green-800',
              purple: 'bg-purple-100 border-purple-400 text-purple-800',
            };
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className={`px-3 py-2 rounded-lg border-2 ${colors[flowStep.color] || 'bg-gray-100'} font-medium text-sm`}>
                  {flowStep.label}
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex-1 font-mono text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {flowStep.value}
                </div>
              </div>
            );
          })}
        </div>
        {step.i !== undefined && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>Position: {step.i} / {text.length - 1}</div>
              <div>Character: '{currentChar}'</div>
              <div>State: {step.node}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

