import React from 'react';
import { ModalType, PlayerProfile, CharacterCard, Leaderboards } from '../types';
import PartyFormation from './PartyFormation';
import Inventory from './Inventory';
import Arena from './Arena';
import Shop from './Shop';

interface ModalProps {
  activeModal: ModalType;
  onClose: () => void;
  playerProfile: PlayerProfile;
  setPlayerProfile: (profile: PlayerProfile) => void;
  leaderboards: Leaderboards;
  onMatchFound: (opponent: CharacterCard) => void;
}

const Modal: React.FC<ModalProps> = ({ activeModal, onClose, playerProfile, setPlayerProfile, leaderboards, onMatchFound }) => {

  const renderContent = () => {
    switch(activeModal) {
      case '队伍':
        return <PartyFormation playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} />;
      case '商城':
        return <Shop playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} />;
      case '背包':
        return <Inventory playerProfile={playerProfile} setPlayerProfile={setPlayerProfile} />;
      case '竞技场':
        return <Arena playerProfile={playerProfile} leaderboards={leaderboards} onMatchFound={onMatchFound} />;
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
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-900/80 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
          <h2 className="text-2xl font-bold text-amber-300 font-serif tracking-widest">{activeModal}</h2>
          <button
            onClick={onClose}
            className="text-amber-300 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Modal;