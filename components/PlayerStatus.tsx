import React from 'react';
import { CharacterCard, PlayerProfile } from '../types';

interface PartyStatusProps {
  playerProfile: PlayerProfile;
}

// 仙侠风格属性条
const StatBar: React.FC<{ value: number; maxValue: number; type: 'hp' | 'mp'; label: string }> = ({ value, maxValue, type, label }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  // 根据类型设置颜色
  const getBarColors = () => {
    if (type === 'hp') {
      return {
        bg: 'bg-cinnabar-600/30',
        bar: 'bg-gradient-to-r from-cinnabar-600 via-cinnabar-400 to-cinnabar-500',
        glow: 'shadow-[0_0_8px_rgba(166,61,61,0.4)]'
      };
    }
    return {
      bg: 'bg-blue-900/30',
      bar: 'bg-gradient-to-r from-blue-600 via-blue-400 to-blue-500',
      glow: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]'
    };
  };

  const colors = getBarColors();
  const icon = type === 'hp' ? '❤' : '✧';

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-ink-300 flex items-center gap-1">
          <span className={type === 'hp' ? 'text-cinnabar-400' : 'text-blue-400'}>{icon}</span>
          {label}
        </span>
        <span className="text-xs font-mono text-gold-500/80">{`${value}/${maxValue}`}</span>
      </div>
      <div className={`w-full ${colors.bg} rounded h-2 border border-ink-700/50 overflow-hidden`}>
        <div
          className={`${colors.bar} h-full rounded transition-all duration-500 ease-in-out ${colors.glow} relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* 进度条光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
      </div>
    </div>
  );
};

// 仙侠风格队伍成员卡片
const PartyMember: React.FC<{ char: CharacterCard }> = ({ char }) => (
  <div className="ink-card p-3 rounded-lg backdrop-blur-sm relative group hover:border-gold-500/40 transition-all duration-300">
    {/* 角落装饰 */}
    <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-gold-500/20" />
    <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-gold-500/20" />

    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold text-gold-300 font-elegant tracking-wide flex items-center gap-1">
        <span className="text-gold-500/60">◆</span>
        {char.name}
      </h3>
      <span className="realm-mark text-xs text-gold-400 font-elegant">{char.realm}</span>
    </div>
    <div className="space-y-2">
      <StatBar value={char.baseAttributes.hp} maxValue={char.baseAttributes.maxHp} type="hp" label="气血" />
      <StatBar value={char.baseAttributes.mp} maxValue={char.baseAttributes.maxMp} type="mp" label="真元" />
    </div>
  </div>
);

const PartyStatus: React.FC<PartyStatusProps> = ({ playerProfile }) => {
  const activeParty = playerProfile.maleParty.length > 0 ? playerProfile.maleParty : playerProfile.femaleParty;

  return (
    <div className="ink-card p-4 rounded-lg flex flex-col backdrop-blur-sm relative xianxia-frame">
      {/* 背景法阵装饰 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-500/5 text-6xl pointer-events-none">☯</div>

      {/* 标题 */}
      <div className="text-center mb-4 relative">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <h2 className="relative inline-block px-4 text-xl font-bold text-gold-400 font-brush tracking-[0.1em] bg-ink-900/90">
          <span className="text-gold-500/40 mr-1">⚔</span>
          {playerProfile.name}的修仙队伍
        </h2>
      </div>

      {/* 队员列表 */}
      <div className="space-y-3 overflow-y-auto">
        {activeParty.length > 0 ? (
          activeParty.map(char => <PartyMember key={char.id} char={char} />)
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-2 opacity-40">⚔</div>
            <p className="text-ink-400 font-elegant">尚无修士入阵</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyStatus;