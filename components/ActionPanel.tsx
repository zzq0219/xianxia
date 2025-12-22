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
                className="group relative w-full text-left bg-gradient-to-r from-[#1c1c1c] to-[#151515] px-4 py-3.5 rounded-r-lg rounded-l-sm border-l-2 border-l-stone-600 hover:border-l-amber-500 border-y border-r border-white/5 hover:bg-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-serif shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-500"></div>
                <div className="relative flex items-center justify-between">
                  <span className="text-stone-300 group-hover:text-amber-100 transition-colors">{choice}</span>
                  <i className="fa-solid fa-chevron-right text-[10px] text-stone-600 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                </div>
              </button>
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-3 items-stretch">
            <div className="relative flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="道友意下如何..."
                disabled={isLoading}
                className="w-full h-full bg-[#0a0a0a] border border-stone-700/50 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 text-stone-300 placeholder-stone-600 disabled:opacity-50 font-serif shadow-inner text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !customInput.trim()}
              className="bg-gradient-to-b from-amber-700 to-amber-800 text-amber-100 font-bold px-6 py-2 rounded-lg border border-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-serif shadow-lg shadow-amber-900/50 text-sm tracking-wide"
            >
              行事
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ActionPanel;