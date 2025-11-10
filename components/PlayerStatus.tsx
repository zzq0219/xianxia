import React from 'react';
import { PlayerProfile, CharacterCard } from '../types';

interface PartyStatusProps {
  playerProfile: PlayerProfile;
}

const StatBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="text-xs font-mono text-gray-400">{`${value}/${maxValue}`}</span>
      </div>
      <div className="w-full bg-slate-600 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const PartyMember: React.FC<{char: CharacterCard}> = ({char}) => (
    <div className="bg-slate-700/50 p-3 rounded-lg backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white font-serif">{char.name}</h3>
            <p className="text-amber-400 text-sm">{char.realm}</p>
        </div>
        <div className="space-y-2">
            <StatBar value={char.baseAttributes.hp} maxValue={char.baseAttributes.maxHp} color="bg-red-500" label="气血" />
            <StatBar value={char.baseAttributes.mp} maxValue={char.baseAttributes.maxMp} color="bg-blue-500" label="真元" />
        </div>
    </div>
);

const PartyStatus: React.FC<PartyStatusProps> = ({ playerProfile }) => {
  const activeParty = playerProfile.maleParty.length > 0 ? playerProfile.maleParty : playerProfile.femaleParty;

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex flex-col backdrop-blur-sm">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white font-serif">{playerProfile.name}的队伍</h2>
      </div>
      <div className="space-y-3 overflow-y-auto">
        {activeParty.length > 0 ? (
          activeParty.map(char => <PartyMember key={char.id} char={char} />)
        ) : (
          <p className="text-center text-gray-400">当前没有角色上阵</p>
        )}
      </div>
    </div>
  );
};

export default PartyStatus;