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
          <div className="p-6 text-ink-300 font-serif flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-4 opacity-60">📜</div>
            <p>这里是 <span className="font-semibold text-gold-400">{activeModal}</span> 界面的占位内容。</p>
            <p className="mt-4 text-center text-ink-400">后续开发将在此处填充相关的游戏信息，例如背包列表、技能树、人物关系或当前任务日志等。</p>
          </div>
        );
    }
  };

  // 根据Modal类型获取图标
  const getModalIcon = (type: ModalType): string => {
    const icons: Record<string, string> = {
      '队伍': '⚔️',
      '商城': '🏪',
      '背包': '📦',
      '竞技场': '🏆',
      '任务': '📜',
    };
    return icons[type] || '📜';
  };

  return (
    <div
      className="fixed inset-0 bg-ink-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ink-card relative w-full max-w-6xl h-[90vh] rounded-lg overflow-hidden flex flex-col animate-fade-in xianxia-frame immortal-mist"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 水墨顶部装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

        {/* 四角祥云装饰 */}
        <div className="absolute top-3 left-3 text-gold-500/30 text-sm">☁</div>
        <div className="absolute top-3 right-3 text-gold-500/30 text-sm" style={{ transform: 'scaleX(-1)' }}>☁</div>
        <div className="absolute bottom-3 left-3 text-gold-500/30 text-sm" style={{ transform: 'scaleY(-1)' }}>☁</div>
        <div className="absolute bottom-3 right-3 text-gold-500/30 text-sm" style={{ transform: 'scale(-1)' }}>☁</div>

        {/* 角落装饰线 - 增强 */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-gold-500/25" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-gold-500/25" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-gold-500/25" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-gold-500/25" />

        {/* 背景法阵装饰 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-500/5 text-[15rem] pointer-events-none select-none">
          ✧
        </div>

        {/* 标题栏 - 卷轴风格 */}
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-ink-900/60 border-b border-gold-500/20 relative">
          {/* 标题装饰线 */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

          <div className="flex items-center gap-3">
            {/* 标题图标 */}
            <span className="text-2xl filter drop-shadow-[0_0_6px_rgba(180,149,106,0.4)]">
              {getModalIcon(activeModal)}
            </span>
            <h2 className="text-2xl font-bold text-gold-400 font-brush tracking-[0.15em] ink-title">
              <span className="text-gold-500/40 mr-2">〓</span>
              {activeModal}
              <span className="text-gold-500/40 ml-2">〓</span>
            </h2>
          </div>

          {/* 关闭按钮 - 印章风格 */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-ink-800/80 hover:bg-ink-700/80 border border-gold-500/30 hover:border-cinnabar-400/50 text-ink-400 hover:text-cinnabar-400 transition-all duration-300 flex items-center justify-center group"
            title="关闭"
          >
            <span className="text-lg group-hover:scale-110 transition-transform duration-300">✕</span>
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-grow overflow-y-auto bg-ink-900/30 relative">
          {/* 内容区边缘渐隐效果 */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-ink-900/50 to-transparent pointer-events-none z-10" />
          {renderContent()}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-ink-900/50 to-transparent pointer-events-none z-10" />
        </div>

        {/* 水墨底部装饰线 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      </div>
    </div>
  );
};

export default Modal;