import { HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

export const VizTitle = ({ title, tooltip }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{title}</span>
    {tooltip && (
      <Tooltip content={tooltip}>
        <HelpCircle size={14} className="text-gray-600 hover:text-gray-800 cursor-help" />
      </Tooltip>
    )}
  </div>
);

