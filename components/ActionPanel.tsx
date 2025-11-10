import React, { useState } from 'react';

interface ActionPanelProps {
  choices: string[];
  onAction: (action: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ choices, onAction, isLoading, error }) => {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim() && !isLoading) {
      onAction(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-glow text-amber-300 font-serif">天地变幻...</div>
        </div>
      ) : (
        <>
        {error && <div className="text-red-400 text-center mb-4 font-serif animate-shake">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onAction(choice)}
                disabled={isLoading}
                className="w-full text-left bg-slate-700/80 px-4 py-3 rounded-md hover:bg-slate-600/80 hover:border-amber-400/50 border border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-serif shadow-md"
              >
                {choice}
              </button>
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="或输入你的行动..."
              disabled={isLoading}
              className="flex-1 bg-slate-900/80 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 font-serif shadow-inner shadow-black/50"
            />
            <button
              type="submit"
              disabled={isLoading || !customInput.trim()}
              className="bg-amber-600 text-white font-bold px-5 py-2 rounded-md hover:bg-amber-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-serif shadow-md shadow-amber-600/30"
            >
              确定
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ActionPanel;