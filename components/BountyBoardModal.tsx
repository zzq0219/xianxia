import React, { useEffect, useState } from 'react';
import { BountyTarget } from '../types';
import { getRarityTextColor } from './rarityHelpers';

interface BountyBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bountyBoard: BountyTarget[];
  onViewTarget: (target: BountyTarget) => void;
  onAccept: (targetId: string) => void;
  onClaim: (targetId: string) => void;
  onRefresh: () => void;
  onAddTarget: (gender: 'Male' | 'Female') => void;
  isLoading: boolean;
}

type TabType = '悬赏中' | '追踪中' | '已完成' | '已结束';

const BountyBoardModal: React.FC<BountyBoardModalProps> = ({ isOpen, onClose, bountyBoard, onViewTarget, onAccept, onClaim, onRefresh, onAddTarget, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('悬赏中');

  if (!isOpen) return null;

  const filteredBounties = bountyBoard.filter(b => b.status === activeTab);

  const CountdownTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

    useEffect(() => {
      const timer = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          clearInterval(timer);
          // Potentially trigger a refresh of the bounty board data here
        }
        setTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(timer);
    }, [endTime]);

    const formatTime = (ms: number) => {
      if (ms <= 0) return "即将完成...";
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return <span className="font-mono text-amber-400">{formatTime(timeLeft)}</span>;
  };

  const renderActionButton = (bounty: BountyTarget) => {
    switch (bounty.status) {
      case '悬赏中':
        return (
          <button onClick={() => onAccept(bounty.id)} className="bg-green-600/80 text-white font-bold px-4 py-2 rounded-md hover:bg-green-500/80 transition-colors">
            接受悬赏
          </button>
        );
      case '追踪中':
        return (
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-gray-400">剩余时间</p>
            <CountdownTimer endTime={bounty.endTime} />
          </div>
        );
      case '已完成':
        return (
          <button onClick={() => onClaim(bounty.id)} className="bg-yellow-500/80 text-white font-bold px-4 py-2 rounded-md hover:bg-yellow-400/80 transition-colors animate-pulse-slow">
            查看结果
          </button>
        );
      case '已结束':
        return <span className="text-gray-500 font-semibold">已结束</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
          <h2 className="text-2xl font-bold text-amber-300 font-serif">红尘录</h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-stone-700 bg-black/10">
          <div className="flex space-x-2">
            <button onClick={() => setActiveTab('悬赏中')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === '悬赏中' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>悬赏中</button>
            <button onClick={() => setActiveTab('追踪中')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === '追踪中' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>追踪中</button>
            <button onClick={() => setActiveTab('已完成')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === '已完成' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>已完成</button>
            <button onClick={() => setActiveTab('已结束')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === '已结束' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>已结束</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onAddTarget('Female')} disabled={isLoading} className="px-3 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-md hover:bg-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? '生成中...' : '添加女性目标'}
            </button>
            <button onClick={() => onAddTarget('Male')} disabled={isLoading} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-md hover:bg-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? '生成中...' : '添加男性目标'}
            </button>
            <button onClick={onRefresh} disabled={isLoading} className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-md hover:bg-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              <i className={`fa-solid fa-sync ${isLoading ? 'animate-spin' : ''}`}></i> 刷新悬赏
            </button>
          </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {filteredBounties.length > 0 ? (
            <div className="space-y-4">
              {filteredBounties.map(bounty => (
                <div key={bounty.id} className="bg-black/20 p-4 rounded-lg border border-stone-700/50 flex justify-between items-center">
                  <div className="cursor-pointer flex-grow" onClick={() => onViewTarget(bounty)}>
                    <h3 className={`text-xl font-bold font-serif ${getRarityTextColor(bounty.character.rarity)}`}>{bounty.name} <span className="text-base font-normal text-gray-400">[{bounty.character.rarity}]</span></h3>
                    <p className="text-sm text-gray-400 italic mt-1">线索: {bounty.locationHint}</p>
                    <p className="text-sm text-pink-400 mt-1">特征: {bounty.specialTrait}</p>
                  </div>
                  <div className="w-32 text-center flex-shrink-0">
                    {renderActionButton(bounty)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 pt-10">
              <p className="text-4xl mb-4">📜</p>
              <p>此榜单上暂无记录。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BountyBoardModal;