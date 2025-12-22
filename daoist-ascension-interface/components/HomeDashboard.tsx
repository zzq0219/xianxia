import React from 'react';
import { 
  ShoppingBag, Scroll, Crown, BrainCircuit, MessageCircle, 
  Sprout, Landmark, Activity, Skull, Lock, PenTool, 
  Megaphone, UserCog, Settings
} from 'lucide-react';
import { SystemMenuItem } from '../types';

// --- Configuration ---
const SECT_MANAGEMENT: SystemMenuItem[] = [
  { id: 'biz', label: '产业', desc: '宗门资产', icon: Landmark, category: 'sect', color: 'text-amber-400' },
  { id: 'breed', label: '育灵轩', desc: '灵兽培育', icon: Sprout, category: 'sect', color: 'text-emerald-400' },
  { id: 'heal', label: '医馆', desc: '炼丹疗伤', icon: Activity, category: 'sect', color: 'text-rose-400' },
  { id: 'jail', label: '镇狱', desc: '关押妖魔', icon: Lock, category: 'sect', color: 'text-purple-400' },
  { id: 'manner', label: '礼仪馆', desc: '门派法规', icon: PenTool, category: 'sect', color: 'text-indigo-300' },
];

const WORLD_EVENTS: SystemMenuItem[] = [
  { id: 'shop', label: '万宝楼', desc: '奇珍异宝', icon: ShoppingBag, category: 'world', color: 'text-yellow-400' },
  { id: 'event', label: '大闯关', desc: '限时秘境', icon: Crown, category: 'world', color: 'text-red-500' },
  { id: 'bounty', label: '红尘录', desc: '悬赏任务', icon: Skull, category: 'world', color: 'text-stone-400' },
  { id: 'news', label: '江湖闻', desc: '天下大势', icon: Megaphone, category: 'world', color: 'text-orange-400' },
];

const PERSONAL_GROWTH: SystemMenuItem[] = [
    { id: 'status', label: '道心', desc: '属性总览', icon: UserCog, category: 'personal', color: 'text-cyan-400' },
    { id: 'memory', label: '识海', desc: '记忆碎片', icon: BrainCircuit, category: 'personal', color: 'text-pink-400' },
    { id: 'quest', label: '天命', desc: '主线任务', icon: Scroll, category: 'personal', color: 'text-amber-200' },
    { id: 'chat', label: '传音', desc: '好友通讯', icon: MessageCircle, category: 'personal', color: 'text-blue-300' },
    { id: 'system', label: '天机', desc: '系统设置', icon: Settings, category: 'personal', color: 'text-gray-400' },
];

interface HomeDashboardProps {
  isVisible: boolean;
}

const CategorySection: React.FC<{ title: string; items: SystemMenuItem[]; delayStart: number }> = ({ title, items, delayStart }) => (
  <div className="mb-8 animate-slide-up" style={{ animationDelay: `${delayStart}ms` }}>
    <div className="flex items-center gap-3 mb-4 px-2">
      <div className="w-1.5 h-1.5 rotate-45 bg-gold-base"></div>
      <h3 className="text-stone-300 font-serif font-bold text-lg tracking-wider">{title}</h3>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-stone-800 to-transparent"></div>
    </div>
    
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
      {items.map((item, idx) => (
        <button 
          key={item.id}
          className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all duration-300"
        >
          <div className="relative w-14 h-14 sm:w-16 sm:h-16">
             {/* Icon Background container */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-black rounded-2xl border border-stone-800 group-hover:border-gold-base/60 shadow-lg group-hover:shadow-gold-base/10 transition-all transform group-hover:-translate-y-1"></div>
             {/* Icon */}
             <div className="absolute inset-0 flex items-center justify-center">
               <item.icon size={28} className={`${item.color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300`} />
             </div>
             {/* Notification Dot (Mock) */}
             {['quest', 'event', 'breed'].includes(item.id) && (
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-vermilion rounded-full border border-black animate-pulse shadow-[0_0_8px_#f87171]"></div>
             )}
          </div>
          <div className="text-center w-full">
             <div className="text-stone-300 text-sm font-serif group-hover:text-gold-light truncate">{item.label}</div>
             <div className="text-[10px] text-stone-600 scale-90 hidden sm:block truncate">{item.desc}</div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ isVisible }) => {
  // Use h-full and overflow-y-auto to allow scrolling within the container
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden pt-2 pb-32 px-4 scroll-smooth">
       <div className="max-w-4xl mx-auto">
          
          {/* Hero/Meditate Area */}
          <div className="relative h-56 mb-8 rounded-3xl overflow-hidden border border-stone-800/50 shadow-2xl group cursor-pointer animate-fade-in mx-1">
              <img src="https://picsum.photos/id/1047/800/400?grayscale" alt="Meditation" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 z-10">
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-jade-dark/60 border border-jade-base/30 text-jade-light text-xs px-2 py-0.5 rounded backdrop-blur">洞天福地</span>
                </div>
                <h2 className="text-3xl text-white font-title tracking-widest drop-shadow-md">静室修行</h2>
                <p className="text-stone-400 text-sm font-serif mt-1 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   当前灵气浓度: 充盈
                </p>
              </div>
              
              <div className="absolute right-6 bottom-6 z-10">
                 <div className="w-14 h-14 rounded-full border border-gold-base/50 bg-black/40 backdrop-blur flex items-center justify-center animate-pulse-glow hover:bg-gold-base/20 transition-colors">
                    <span className="text-gold-base font-cursive text-2xl">收</span>
                 </div>
              </div>
          </div>

          {/* Grid Categories */}
          <CategorySection title="宗门事务" items={SECT_MANAGEMENT} delayStart={100} />
          <CategorySection title="红尘万象" items={WORLD_EVENTS} delayStart={200} />
          <CategorySection title="道途修行" items={PERSONAL_GROWTH} delayStart={300} />

          {/* Extra padding at bottom to ensure last items clear the dock */}
          <div className="h-10"></div>
       </div>
    </div>
  );
};