export const KMPNextTable = ({ nextTable, pattern, currentJ }) => {
  if (!nextTable) return null;
  return (
    <div className="mt-4 animate-fadeIn">
      <h3 className="font-semibold text-blue-800 mb-2">Next (LPS) Table <span className="text-sm font-normal text-gray-500 ml-1">/ Next(前缀)表</span>:</h3>
      <div className="flex font-mono text-sm">
        {nextTable.map((val, idx) => (
          <div key={idx} className={`flex flex-col w-8 border transition-colors duration-300 ${idx === currentJ ? 'bg-yellow-200 border-yellow-500 scale-105' : 'bg-gray-50 border-gray-200'} text-center py-1`}>
            <span className="font-bold">{val}</span>
            <span className="text-[10px] text-gray-400">{pattern[idx]}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        When mismatch happens at index <b>j</b>, jump to index <b>Next[j-1]</b>.
      </p>
    </div>
  );
};

