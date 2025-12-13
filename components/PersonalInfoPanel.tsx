import React from 'react';
import { calculateTotalAttributes } from '../services/utils';
import { CharacterCard, PlayerProfile } from '../types';

interface PersonalInfoPanelProps {
  playerProfile: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  hasPendingChallenge: boolean;
  onBattleClick: () => void;
  onRelationshipsClick: () => void;
  onReputationClick: () => void;
}

const StatBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="text-xs font-mono text-gray-400">{`${Math.round(value)}/${Math.round(maxValue)}`}</span>
      </div>
      <div className="w-full bg-stone-700 rounded-full h-2 border border-stone-600/50 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500 ease-in-out relative`} style={{ width: `${percentage}%` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

const PartyMember: React.FC<{ char: CharacterCard }> = ({ char }) => {
  const totalAttrs = calculateTotalAttributes(char);
  return (
    <div className="glass-morphism p-3 rounded-lg border border-stone-600/50 hover:border-xianxia-gold-500/50 transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-white font-serif">{char.name}</h3>
        <p className="text-amber-400 text-sm">{char.realm}</p>
      </div>
      <div className="space-y-2">
        <StatBar value={totalAttrs.hp} maxValue={totalAttrs.maxHp} color="bg-red-500" label="气血" />
        <StatBar value={totalAttrs.mp} maxValue={totalAttrs.maxMp} color="bg-blue-500" label="真元" />
      </div>
    </div>
  );
};

const PartyStatus: React.FC<{ playerProfile: PlayerProfile }> = ({ playerProfile }) => {
  const activeParty = playerProfile.maleParty.length > 0 ? playerProfile.maleParty : playerProfile.femaleParty;

  return (
    <InfoCard title={`${playerProfile.name}的队伍`}>
      <div className="space-y-3">
        {activeParty.length > 0 ? (
          activeParty.map(char => <PartyMember key={char.id} char={char} />)
        ) : (
          <p className="text-center text-gray-400">当前没有角色上阵</p>
        )}
      </div>
    </InfoCard>
  );
};


const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
    <h3 className="font-semibold text-xianxia-gold-400 mb-3 text-lg">{title}</h3>
    {children}
  </div>
);


const PersonalInfoPanel: React.FC<PersonalInfoPanelProps> = ({ playerProfile, isOpen, onClose, hasPendingChallenge, onBattleClick, onRelationshipsClick, onReputationClick }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-md bg-gradient-to-br from-stone-800/95 via-stone-900/95 to-stone-950/95 backdrop-blur-lg border-r border-xianxia-gold-400/30 shadow-2xl shadow-xianxia-gold-500/10 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-xianxia-gold-400/20 bg-stone-900/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gradient-gold text-shadow-glow font-serif">个人信息</h2>
            <button
              onClick={onBattleClick}
              className={`relative px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 border ${hasPendingChallenge
                  ? 'bg-red-800/80 border-red-500 text-white animate-pulse-fast shadow-glow-red'
                  : 'bg-stone-700/50 border-stone-600 text-gray-400 cursor-default'
                }`}
            >
              战况
              {hasPendingChallenge && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
            </button>
            <button
              onClick={onReputationClick}
              className="relative px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 border bg-stone-700/50 border-stone-600 text-gray-300 hover:bg-stone-600/80"
            >
              声望
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        <div className="p-4 overflow-y-auto scrollbar-xianxia h-[calc(100%-65px)] space-y-4 font-serif">

          <InfoCard title="当前身份">
            <p><span className="text-gray-400 w-16 inline-block">名号：</span> <span className="text-white font-bold">{playerProfile.name}</span></p>
            <p><span className="text-gray-400 w-16 inline-block">称号：</span> <span className="text-white">{playerProfile.title || '无'}</span></p>
          </InfoCard>

          <InfoCard title="经济状况">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-gem text-yellow-400 text-xl"></i>
              <span className="text-white font-bold text-lg">{playerProfile.spiritStones}</span>
              <span className="text-gray-300">灵石</span>
            </div>
          </InfoCard>

          <InfoCard title="人际关系">
            <button
              onClick={onRelationshipsClick}
              className="w-full text-left hover:bg-stone-800/50 p-2 -m-2 rounded-md transition-colors"
            >
              {playerProfile.relationships && playerProfile.relationships.length > 0 ? (
                <div>
                  <p className="text-gray-300">已结识 <span className="font-bold text-white">{playerProfile.relationships.length}</span> 位道友。</p>
                  <p className="text-xs text-amber-400 mt-1">点击查看详情</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 italic">江湖路远，尚未结识重要人物。</p>
                  <p className="text-xs text-amber-400 mt-1">点击查看详情</p>
                </div>
              )}
            </button>
          </InfoCard>

          <PartyStatus playerProfile={playerProfile} />

        </div>
      </div>
    </>
  );
};

export default PersonalInfoPanel;