export const ControlButton = ({ onClick, icon: Icon, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`p-2 rounded-full transition-colors ${disabled ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100 active:bg-blue-200'}`}
  >
    <Icon size={24} />
  </button>
);

