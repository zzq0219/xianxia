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

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void, isSubTab?: boolean }> = ({ label, isActive, onClick, isSubTab }) => (
    <button
        onClick={onClick}
        className={`px-4 transition-colors duration-200 font-semibold ${isSubTab
                ? `py-1 text-sm rounded-md ${isActive ? 'bg-amber-600/80 text-white' : 'bg-stone-700/60 text-gray-300 hover:bg-stone-700'}`
                : `py-2 text-base rounded-t-lg ${isActive ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50 hover:text-gray-200'}`
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
        <div className="h-full flex flex-col md:flex-row font-serif text-gray-300 p-4 gap-4">
            {/* Left Panel: Player Rank */}
            <div className="flex-shrink-0 md:w-1/3 bg-black/20 p-6 rounded-lg flex flex-col items-center justify-center text-center border border-stone-700/50">
                <h2 className="text-2xl font-bold text-white mb-4">我的战绩</h2>
                <div className="text-6xl mb-4">{playerRank.tierIcon}</div>
                <p className="text-3xl font-bold text-amber-400">{playerRank.tier} {playerRank.division}</p>
                <p className="text-lg text-gray-400 mt-2">{playerRank.points} 积分</p>
                <button
                    onClick={handleFindMatch}
                    disabled={isMatching}
                    className="mt-8 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-500 transition-colors shadow-lg w-40 h-14 flex items-center justify-center disabled:bg-red-800 disabled:cursor-wait"
                >
                    {isMatching ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin mr-3"></i>
                            匹配中...
                        </>
                    ) : (
                        '寻找对战'
                    )}
                </button>
            </div>

            {/* Right Panel: Leaderboards */}
            <div className="flex-grow bg-black/20 p-4 rounded-lg border border-stone-700/50 flex flex-col">
                <div className="flex-shrink-0 border-b border-stone-700">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex space-x-2">
                            {(Object.keys(leaderboardData) as MainTab[]).map(tab => (
                                <TabButton key={tab} label={tab} isActive={mainTab === tab} onClick={() => setMainTab(tab)} />
                            ))}
                        </div>
                        <button
                            onClick={handleRefreshLeaderboards}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-amber-600/80 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-wait flex items-center gap-2"
                            title="AI生成新的榜单"
                        >
                            <i className={`fa-solid fa-rotate ${isRefreshing ? 'fa-spin' : ''}`}></i>
                            {isRefreshing ? '生成中...' : '刷新榜单'}
                        </button>
                    </div>
                    {mainTab === '宗门排行榜' && (
                        <div className="px-2 py-2 flex space-x-2">
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