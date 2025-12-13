import React, { useState } from 'react';
import { CHARACTER_POOL } from '../constants';
import { generateAILeaderboards } from '../services/arenaLeaderboardService';
import { CharacterCard, GameState, Leaderboards, PlayerProfile } from '../types';
import LeaderboardTable from './LeaderboardTable';

interface ArenaProps {
    playerProfile: PlayerProfile;
    leaderboards: Leaderboards;
    onMatchFound: (opponent: CharacterCard) => void;
    gameState: GameState;
    onLeaderboardsUpdate: (newLeaderboards: Leaderboards) => void;
}

type MainTab = '宗门排行榜' | '野榜' | '区域榜' | '世界榜';
type SectSubTab = '总榜' | '核心弟子' | '内门弟子' | '外门弟子' | '杂役弟子';

// 仙侠风格标签按钮
const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void, isSubTab?: boolean }> = ({ label, isActive, onClick, isSubTab }) => (
    <button
        onClick={onClick}
        className={`px-4 transition-all duration-300 font-semibold ${isSubTab
            ? `py-1 text-sm rounded-lg ${isActive
                ? 'bg-gold-600/30 text-gold-300 border border-gold-500/40'
                : 'bg-ink-700/60 text-ink-300 hover:bg-ink-600/70 hover:text-gold-300 border border-ink-700/50'}`
            : `py-2 text-base rounded-t-lg ${isActive
                ? 'bg-ink-800/90 text-gold-400 border-b-2 border-gold-500/60 shadow-[0_0_10px_rgba(180,149,106,0.15)]'
                : 'bg-transparent text-ink-400 hover:bg-ink-800/50 hover:text-gold-300'}`
            }`}
    >
        {label}
    </button>
);

const Arena: React.FC<ArenaProps> = ({ playerProfile, leaderboards, onMatchFound, gameState, onLeaderboardsUpdate }) => {
    const [mainTab, setMainTab] = useState<MainTab>('宗门排行榜');
    const [sectSubTab, setSectSubTab] = useState<SectSubTab>('总榜');
    const [isMatching, setIsMatching] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const playerRank = playerProfile.arenaRank;
    const leaderboardData = leaderboards;

    const getCurrentData = () => {
        if (mainTab === '宗门排行榜') {
            return leaderboardData[mainTab][sectSubTab];
        }
        return (leaderboardData as any)[mainTab];
    };

    const handleFindMatch = () => {
        setIsMatching(true);
        setTimeout(() => {
            // New dynamic opponent generation logic
            const opponentPool = CHARACTER_POOL.filter(c => c.id !== playerProfile.name); // Exclude player self
            const randomOpponentTemplate = opponentPool[Math.floor(Math.random() * opponentPool.length)];

            // Create a new character instance for the opponent
            const opponentCard: CharacterCard = {
                ...randomOpponentTemplate,
                id: `arena-opponent-${Date.now()}`, // Unique ID for this match
                // Simulate points close to the player's rank
                // This is a simplified simulation. In a real app, this might be more complex.
                // We can add a temporary 'points' property to the card for the battle.
            };

            // We'll pass a complete CharacterCard object to onMatchFound.
            // The points simulation will be handled within the battle setup itself if needed,
            // but for matching, we just need a valid opponent.
            // The parent component will handle the battle state creation.
            onMatchFound(opponentCard);
            // setIsMatching(false) will be handled by the parent component closing the modal
        }, 2500);
    };

    const handleRefreshLeaderboards = async () => {
        setIsRefreshing(true);
        try {
            console.log('[竞技场] 开始AI生成榜单...');
            const newLeaderboards = await generateAILeaderboards(gameState);
            onLeaderboardsUpdate(newLeaderboards);
            console.log('[竞技场] 榜单刷新完成');
        } catch (error) {
            console.error('[竞技场] 榜单刷新失败:', error);
            alert('榜单刷新失败，请查看控制台了解详情');
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row font-serif text-ink-300 p-4 gap-4 bg-gradient-to-br from-ink-900/30 via-ink-950/50 to-ink-900/30">
            {/* 左侧面板：玩家战绩 - 仙侠风格 */}
            <div className="flex-shrink-0 md:w-1/3 ink-card p-6 rounded-lg flex flex-col items-center justify-center text-center relative xianxia-frame">
                {/* 背景法阵 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-500/10 text-8xl pointer-events-none">☯</div>

                {/* 角落装饰 */}
                <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-gold-500/25" />
                <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-gold-500/25" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-gold-500/25" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-gold-500/25" />

                <h2 className="text-2xl font-bold text-gold-400 mb-4 font-brush tracking-wider relative z-10">
                    <span className="text-gold-500/50 mr-2">〓</span>
                    我的战绩
                    <span className="text-gold-500/50 ml-2">〓</span>
                </h2>
                <div className="text-6xl mb-4 relative z-10 filter drop-shadow-[0_0_8px_rgba(180,149,106,0.4)]">{playerRank.tierIcon}</div>
                <p className="text-3xl font-bold text-gold-300 font-elegant relative z-10">{playerRank.tier} {playerRank.division}</p>
                <p className="text-lg text-ink-400 mt-2 flex items-center gap-2 relative z-10">
                    <span className="text-gold-500">◈</span>
                    {playerRank.points} 积分
                </p>

                {/* 对战按钮 - 仙侠风格 */}
                <button
                    onClick={handleFindMatch}
                    disabled={isMatching}
                    className="mt-8 bg-gradient-to-r from-cinnabar-600 to-cinnabar-500 text-white font-bold py-3 px-8 rounded-lg hover:from-cinnabar-500 hover:to-cinnabar-400 transition-all duration-300 shadow-[0_0_15px_rgba(166,61,61,0.3)] w-40 h-14 flex items-center justify-center disabled:from-ink-600 disabled:to-ink-700 disabled:cursor-wait border border-cinnabar-400/50 font-elegant tracking-wider relative z-10"
                >
                    {isMatching ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">☯</span>
                            寻敌中...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span>⚔</span>
                            寻找对战
                        </span>
                    )}
                </button>
            </div>

            {/* 右侧面板：排行榜 - 仙侠风格 */}
            <div className="flex-grow ink-card p-4 rounded-lg flex flex-col relative xianxia-frame">
                {/* 顶部装饰线 */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

                <div className="flex-shrink-0 border-b border-gold-600/20">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex space-x-2">
                            {(Object.keys(leaderboardData) as MainTab[]).map(tab => (
                                <TabButton key={tab} label={tab} isActive={mainTab === tab} onClick={() => setMainTab(tab)} />
                            ))}
                        </div>
                        <button
                            onClick={handleRefreshLeaderboards}
                            disabled={isRefreshing}
                            className="qi-flow-btn px-4 py-2 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                            title="AI生成新的榜单"
                        >
                            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
                            {isRefreshing ? '生成中...' : '刷新榜单'}
                        </button>
                    </div>
                    {mainTab === '宗门排行榜' && (
                        <div className="px-2 py-2 flex space-x-2 flex-wrap">
                            {(Object.keys(leaderboardData['宗门排行榜']) as SectSubTab[]).map(tab => (
                                <TabButton key={tab} label={tab} isActive={sectSubTab === tab} onClick={() => setSectSubTab(tab)} isSubTab />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto mt-2">
                    <LeaderboardTable data={getCurrentData()} />
                </div>
            </div>
        </div>
    );
};

export default Arena;