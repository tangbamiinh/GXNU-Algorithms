export const Card = ({ children, title, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col ${className}`}>
    {title && (
      <div className="bg-blue-900 text-white px-3 py-2 font-semibold border-b border-blue-800 flex-shrink-0 text-sm">
        {title}
      </div>
    )}
    <div className="p-3 flex-1 flex flex-col min-h-0">{children}</div>
  </div>
);

