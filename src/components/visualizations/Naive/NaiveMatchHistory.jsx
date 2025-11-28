export const NaiveMatchHistory = ({ matches, showTitle = true }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No matches found yet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
      {showTitle && (
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold text-sm flex-shrink-0">
          Match History / 匹配历史
        </div>
      )}
      <div className="overflow-y-auto flex-1 min-h-0 p-3">
        <div className="space-y-2">
          {matches.map((match, idx) => (
            <div key={idx} className="bg-green-50 border-l-4 border-green-500 p-2 rounded-r shadow-sm">
              <div className="font-bold text-green-800">Match #{idx + 1}</div>
              <div className="text-xs text-gray-600 mt-1">Position: [{match.start}-{match.end}]</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

