import React, { useState } from 'react';
import { Send, Sunrise, Sparkles, Zap, Aperture, X, Map } from 'lucide-react';
import { ActionOption, GameMode } from '../types';

interface ActionPanelProps {
  isVisible: boolean;
  gameMode: GameMode;
  options: ActionOption[];
  onSelectOption: (option: ActionOption) => void;
  onCustomAction: (action: string) => void;
  onNextDay: () => void;
  onOpenMap?: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ 
  isVisible,
  gameMode,
  options, 
  onSelectOption, 
  onCustomAction,
  onNextDay,
  onOpenMap
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isCombatMenuOpen, setIsCombatMenuOpen] = useState(false);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onCustomAction(inputValue);
      setInputValue('');
    }
  };

  // --- COMBAT MODE ACTIONS (Expandable Orb Menu) ---
  if (gameMode === GameMode.BATTLE) {
    return (
      <>
        {/* --- The Drawer/Panel (Skills) --- */}
        <div className={`
            absolute bottom-24 left-0 right-0 z-30 flex justify-center
            transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${isCombatMenuOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}
        `}>
           <div className="flex items-end gap-2 sm:gap-4 px-4 pb-4 overflow-x-auto no-scrollbar max-w-full">
              {options.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => {
                      onSelectOption(opt);
                      // Optional: Close menu on select? setIsCombatMenuOpen(false);
                  }}
                  className="relative group w-24 h-32 sm:w-28 sm:h-40 flex-shrink-0 bg-ink-900 rounded border border-gold-dark hover:border-gold-base hover:-translate-y-2 transition-all duration-300 shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                  
                  {/* Icon */}
                  <div className="absolute top-2 right-2 text-stone-600 group-hover:text-gold-light transition-colors">
                     <Zap size={16} />
                  </div>
                  
                  {/* Text */}
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                     <span className="font-cursive text-xl text-stone-200 group-hover:text-gold-light writing-vertical-rl tracking-widest leading-none drop-shadow-md">
                        {opt.text}
                     </span>
                  </div>

                  {/* Desc overlay (very small) */}
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-[8px] text-stone-400 text-center truncate">
                     {opt.desc || '消耗灵力'}
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* --- The Toggle Button (Spirit Pearl) --- */}
        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center items-center">
            <button 
              onClick={() => setIsCombatMenuOpen(!isCombatMenuOpen)}
              className={`
                relative w-16 h-16 rounded-full flex items-center justify-center
                shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-500
                ${isCombatMenuOpen ? 'bg-ink-950 border-2 border-red-500 rotate-90' : 'bg-gradient-to-br from-ink-800 to-black border-2 border-gold-base animate-pulse-glow'}
              `}
            >
               {/* Inner Ring */}
               <div className={`absolute inset-1 rounded-full border border-dashed border-stone-500/50 ${isCombatMenuOpen ? '' : 'animate-spin-slow'}`}></div>
               
               {/* Icon */}
               {isCombatMenuOpen ? (
                 <X size={24} className="text-red-500" />
               ) : (
                 <Aperture size={28} className="text-gold-base" />
               )}

               {/* Label (Only when closed) */}
               {!isCombatMenuOpen && (
                 <div className="absolute -bottom-6 text-[10px] text-gold-dark font-serif tracking-widest whitespace-nowrap">
                    神通
                 </div>
               )}
            </button>
        </div>
      </>
    );
  }

  // --- EXPLORE MODE ACTIONS (Buttons + Input) ---
  return (
    <div className="absolute bottom-24 left-0 right-0 px-4 z-40 animate-slide-up bg-gradient-to-t from-black via-black/80 to-transparent pb-4 pt-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        
        {/* Story Choices */}
        <div className="flex justify-center flex-wrap gap-3 mb-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              className={`
                relative overflow-hidden px-6 py-3 rounded-md border backdrop-blur-md shadow-lg
                font-serif tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 group
                ${opt.type === 'event' 
                  ? 'bg-blue-950/40 border-blue-500/30 text-blue-100 hover:border-blue-400' 
                  : 'bg-stone-900/60 border-stone-600 text-stone-300 hover:border-gold-base hover:text-gold-light'}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="flex items-center gap-2 relative z-10">
                 {opt.type === 'event' && <Sparkles size={14} className="text-blue-400" />}
                 {opt.text}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Action Bar */}
        <div className="flex gap-2">
           {/* Map Button */}
           <button 
             onClick={onOpenMap}
             className="bg-ink-800/80 hover:bg-ink-700 border border-gold-dark/50 text-gold-base w-12 rounded-lg flex items-center justify-center shadow-lg transition-colors group"
             title="打开地图"
           >
             <Map size={20} className="group-hover:scale-110 transition-transform" />
           </button>

           <form onSubmit={handleSubmit} className="flex-1 bg-ink-900/90 border border-stone-700 rounded-lg flex items-center px-4 shadow-xl focus-within:border-gold-base transition-colors hover:border-stone-500">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="自行决断..."
                className="bg-transparent border-none outline-none text-stone-200 w-full py-3 font-serif placeholder-stone-600"
              />
              <button type="submit" className="text-stone-500 hover:text-gold-base transition-colors p-1">
                <Send size={18} />
              </button>
           </form>
           
           <button 
             onClick={onNextDay}
             className="bg-jade-dark/20 hover:bg-jade-dark/40 border border-jade-base/30 text-jade-light w-12 rounded-lg flex items-center justify-center shadow-lg transition-colors group"
             title="下一天"
           >
             <Sunrise size={20} className="group-hover:rotate-12 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  );
};