import React from 'react';

interface CombatLogProps {
  log: string[];
  onClose: () => void;
}

const CombatLog: React.FC<CombatLogProps> = ({ log, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
    >
        <div 
            className="bg-slate-800 w-full max-w-2xl h-4/5 rounded-xl shadow-2xl border border-slate-700 overflow-hidden backdrop-blur-lg bg-slate-800/80 flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-white font-serif">战斗记录</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
                 <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:my-2 font-serif">
                    {log.map((entry, index) => (
                        <p key={index} className={`${entry.startsWith('>') ? 'text-sky-400' : ''}`}>
                            {entry}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CombatLog;