import React from 'react';
import { CharacterCard, GameState, Leaderboards, ModalType, PetCard, PlayerProfile } from '../types';
import Arena from './Arena';
import Inventory from './Inventory';
import PartyFormation from './PartyFormation';
import Shop from './Shop';

interface ModalProps {
  activeModal: ModalType;
  onClose: () => void;
  playerProfile: PlayerProfile;
  setPlayerProfile: (profile: PlayerProfile) => void;
  leaderboards: Leaderboards;
  onMatchFound: (opponent: CharacterCard) => void;
  onViewPet: (pet: PetCard) => void;
  gameState: GameState;
  onLeaderboardsUpdate: (newLeaderboards: Leaderboards) => void;
}

const Modal: React.FC<ModalProps> = ({ activeModal, onClose, playerProfile, setPlayerProfile, leaderboards, onMatchFound, onViewPet, gameState, onLeaderboardsUpdate }) => {

  const renderContent = () => {
    switch (activeModal) {
      case '队伍':
        return <PartyFormation playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} onViewPet={onViewPet} />;
      case '商城':
        return <Shop playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} />;
      case '背包':
        return <Inventory playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} onViewPet={onViewPet} />;
      case '竞技场':
        return <Arena playerProfile={playerProfile} leaderboards={leaderboards} onMatchFound={onMatchFound} gameState={gameState} onLeaderboardsUpdate={onLeaderboardsUpdate} />;
      case '任务':
      default:
        return (
          <div className="p-6 text-gray-300 font-serif flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-4">📜</div>
            <p>这里是 <span className="font-semibold text-amber-400">{activeModal}</span> 界面的占位内容。</p>
            <p className="mt-4 text-center text-gray-400">后续开发将在此处填充相关的游戏信息，例如背包列表、技能树、人物关系或当前任务日志等。</p>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* 顶部光效 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />

        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700/50">
          <h2 className="text-2xl font-bold text-gradient-gold text-shadow-glow font-serif tracking-widest">{activeModal}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 hover:border-xianxia-gold-500 text-gray-400 hover:text-xianxia-gold-400 transition-all duration-200 flex items-center justify-center group"
          >
            <i className="fa-solid fa-times text-xl group-hover:rotate-90 transition-transform duration-200"></i>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />
      </div>
    </div>
  );
};

export default Modal;