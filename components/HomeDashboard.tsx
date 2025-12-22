import React from 'react';
import { GameState, ModalType, SystemMenuItem } from '../types';

interface HomeDashboardProps {
    isVisible: boolean;
    onNavClick: (modal: ModalType) => void;
    onQuestClick: () => void;
    onBusinessClick: () => void;
    onCultivationClick: () => void;
    onMemoryClick: () => void;
    onCharacterStatusClick: () => void;
    onPrisonClick: () => void;
    onEtiquetteHallClick: () => void;
    onGauntletClick: () => void;
    onAnnouncementsClick: () => void;
    onSystemClick: () => void;
    onHospitalClick: () => void;
    gameState: GameState;
}

const CategorySection: React.FC<{ title: string; items: SystemMenuItem[]; delayStart: number; onGlobalNav: (item: SystemMenuItem) => void }> = ({ title, items, delayStart, onGlobalNav }) => (
    <div className="mb-8 animate-slide-up relative" style={{ animationDelay: `${delayStart}ms` }}>
        {/* Header Decoration */}
        <div className="flex items-center gap-4 mb-4 px-2">
            <div className="relative flex items-center justify-center w-6 h-6">
                <div className="absolute inset-0 border border-amber-500/30 rotate-45 transform scale-75"></div>
                <div className="w-1.5 h-1.5 bg-amber-500 rotate-45 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
            </div>
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-stone-400 font-serif font-bold text-lg tracking-[0.2em]">{title}</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-900/50 via-stone-800/30 to-transparent"></div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-4 sm:gap-y-6 gap-x-2">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onGlobalNav(item)}
                    className="flex flex-col items-center gap-2 sm:gap-3 group relative p-1"
                >
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1">
                        {/* Decorative Backplate */}
                        <div className="absolute inset-0 bg-[#111] rounded-[14px] border border-white/5 rotate-45 scale-75 group-hover:rotate-90 group-hover:scale-90 group-hover:border-amber-500/30 transition-all duration-500 ease-out shadow-lg"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-stone-800/20 to-black rounded-[14px] border border-white/5 group-hover:border-amber-500/40 shadow-inner group-hover:shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)] transition-all duration-300"></div>

                        {/* Icon */}
                        <div className="relative z-10 flex items-center justify-center">
                            <i className={`${item.icon} text-xl sm:text-2xl ${item.color} opacity-90 group-hover:opacity-100 group-hover:scale-110 drop-shadow-md transition-all duration-300`}></i>
                        </div>

                        {/* Notification Dot */}
                        {item.badge && item.badge > 0 ? (
                            <div className="absolute -top-1 -right-1 z-20 w-4 h-4 bg-rose-600 text-white text-[10px] flex items-center justify-center rounded-full border border-black animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.6)] font-bold">
                                {item.badge > 9 ? '9+' : item.badge}
                            </div>
                        ) : null}
                    </div>

                    <div className="text-center w-full z-10">
                        <div className="text-stone-300 text-xs font-serif font-medium tracking-wider group-hover:text-amber-100 transition-colors">{item.label}</div>
                        <div className="text-[10px] text-stone-600 scale-90 hidden sm:block truncate mt-0.5 group-hover:text-amber-500/70 transition-colors">{item.desc}</div>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

export const HomeDashboard: React.FC<HomeDashboardProps> = (props) => {
    const {
        isVisible,
        gameState,
        onNavClick,
        onQuestClick,
        onBusinessClick,
        onCultivationClick,
        onMemoryClick,
        onCharacterStatusClick,
        onPrisonClick,
        onEtiquetteHallClick,
        onGauntletClick,
        onAnnouncementsClick,
        onSystemClick,
        onHospitalClick
    } = props;

    if (!isVisible) return null;

    // --- Configuration ---
    // Actions map for dispatching clicks
    const handleMenuClick = (item: SystemMenuItem) => {
        switch (item.id) {
            case 'biz': onBusinessClick(); break;
            case 'breed': onCultivationClick(); break;
            case 'heal': onHospitalClick(); break;
            case 'jail': onPrisonClick(); break;
            case 'manner': onEtiquetteHallClick(); break;
            case 'shop': onNavClick('商城'); break;
            case 'gauntlet': onGauntletClick(); break;
            case 'arena': onNavClick('竞技场'); break;
            case 'bounty': onNavClick('商城'); break;
            case 'news': onAnnouncementsClick(); break;
            case 'status': onCharacterStatusClick(); break;
            case 'memory': onMemoryClick(); break;
            case 'quest': onQuestClick(); break;
            case 'system': onSystemClick(); break;
            case 'team': onNavClick('队伍'); break;
            default: console.warn('Unknown menu item', item.id);
        }
    };

    // Need to access props that were not explicitly typed in HomeDashboardProps but are likely needed.
    // Actually, looking at App.tsx usage later, I should ensure all these callbacks are passed.
    // For now, I will use the ones defined in interface.

    const SECT_MANAGEMENT: SystemMenuItem[] = [
        { id: 'biz', label: '产业', desc: '宗门资产', icon: 'fa-solid fa-building', category: 'sect', color: 'text-amber-400' },
        { id: 'breed', label: '育灵轩', desc: '灵兽培育', icon: 'fa-solid fa-dna', category: 'sect', color: 'text-emerald-400' },
        { id: 'heal', label: '医馆', desc: '炼丹疗伤', icon: 'fa-solid fa-hospital', category: 'sect', color: 'text-rose-400' },
        { id: 'jail', label: '镇狱', desc: '关押妖魔', icon: 'fa-solid fa-dungeon', category: 'sect', color: 'text-purple-400' },
        { id: 'manner', label: '礼仪馆', desc: '门派法规', icon: 'fa-solid fa-ribbon', category: 'sect', color: 'text-indigo-300' },
        { id: 'team', label: '弟子', desc: '门人管理', icon: 'fa-solid fa-users', category: 'sect', color: 'text-blue-300' },
    ];

    const WORLD_EVENTS: SystemMenuItem[] = [
        { id: 'shop', label: '万宝楼', desc: '奇珍异宝', icon: 'fa-solid fa-store', category: 'world', color: 'text-yellow-400' },
        { id: 'gauntlet', label: '大闯关', desc: '限时秘境', icon: 'fa-solid fa-crown', category: 'world', color: 'text-red-500' },
        { id: 'arena', label: '演武场', desc: '同门切磋', icon: 'fa-solid fa-khanda', category: 'world', color: 'text-red-400' },
        { id: 'news', label: '江湖闻', desc: '天下大势', icon: 'fa-solid fa-bullhorn', category: 'world', color: 'text-orange-400', badge: 0 },
    ];

    const PERSONAL_GROWTH: SystemMenuItem[] = [
        { id: 'status', label: '道心', desc: '属性总览', icon: 'fa-solid fa-user-gear', category: 'personal', color: 'text-cyan-400' },
        { id: 'memory', label: '识海', desc: '记忆碎片', icon: 'fa-solid fa-brain', category: 'personal', color: 'text-pink-400' },
        { id: 'quest', label: '天命', desc: '主线任务', icon: 'fa-solid fa-scroll', category: 'personal', color: 'text-amber-200', badge: gameState.playerProfile.quests.filter(q => q.status === 'In Progress').length },
        // { id: 'chat', label: '传音', desc: '好友通讯', icon: 'fa-solid fa-comments', category: 'personal', color: 'text-blue-300' }, // Missing prop
        { id: 'system', label: '天机', desc: '系统设置', icon: 'fa-solid fa-gear', category: 'personal', color: 'text-gray-400' },
    ];

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden pt-4 pb-4 px-4 scroll-smooth scrollbar-none relative">

            {/* Background Decoration: Flying Swords & Ink */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Top Right Hanging Sword */}
                <div className="absolute top-20 -right-10 opacity-10 transform -rotate-45 scale-150 animate-float" style={{ animationDuration: '8s' }}>
                    <i className="fa-solid fa-khanda text-9xl text-cyan-900"></i>
                </div>
                {/* Bottom Left Sword */}
                <div className="absolute bottom-40 -left-10 opacity-5 transform rotate-12 scale-125 animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }}>
                    <i className="fa-solid fa-sword text-8xl text-stone-700"></i>
                </div>
                {/* Drifting Cloud/Ink 1 */}
                <div className="absolute top-40 left-10 opacity-5 transform scale-150 animate-pulse" style={{ animationDuration: '15s' }}>
                    <i className="fa-solid fa-cloud text-9xl text-stone-500 blur-xl"></i>
                </div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Hero/Meditate Area */}
                <div className="relative h-48 mb-10 rounded-3xl overflow-hidden border border-white/5 shadow-2xl group cursor-pointer animate-fade-in mx-1 ring-1 ring-white/5">
                    {/* Background */}
                    <div className="absolute inset-0 bg-stone-950">
                        {/* Subtle animated texture or gradient */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,53,15,0.15),transparent_70%)]"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    </div>

                    <div className="absolute top-4 right-4 z-10 opacity-30 group-hover:opacity-50 transition-opacity flex flex-col items-center gap-2">
                        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                        <i className="fa-solid fa-khanda text-4xl text-white/40 rotate-180"></i>
                    </div>

                    <div className="absolute bottom-6 left-6 z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs px-2 py-0.5 rounded backdrop-blur">洞天福地</span>
                        </div>
                        <h2 className="text-3xl text-white font-serif tracking-widest drop-shadow-md">静室修行</h2>
                        <p className="text-stone-400 text-sm font-serif mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            当前灵气浓度: 充盈
                        </p>
                    </div>

                    <div className="absolute right-6 bottom-6 z-10">
                        <div className="w-12 h-12 rounded-full border border-amber-500/50 bg-black/40 backdrop-blur flex items-center justify-center animate-pulse-glow hover:bg-amber-500/20 transition-colors">
                            <span className="text-amber-500 font-serif text-xl">收</span>
                        </div>
                    </div>
                </div>

                {/* Grid Categories */}
                <CategorySection title="宗门事务" items={SECT_MANAGEMENT} delayStart={100} onGlobalNav={handleMenuClick} />
                <CategorySection title="红尘万象" items={WORLD_EVENTS} delayStart={200} onGlobalNav={handleMenuClick} />
                <CategorySection title="道途修行" items={PERSONAL_GROWTH} delayStart={300} onGlobalNav={handleMenuClick} />

                {/* Extra padding at bottom to ensure last items clear the dock */}
                <div className="h-10"></div>
            </div>
        </div>
    );
};