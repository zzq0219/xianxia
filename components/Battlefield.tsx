
import React from 'react';
import { BattleParticipant, PetCard } from '../types';
import CharacterCardDisplay from './CharacterCard';

type CombatAnimation = {
    key: number;
    effect: 'slash' | 'fire' | 'heal' | 'shield' | 'default';
    attacker: 'player' | 'opponent';
}

interface BattlefieldProps {
    player: BattleParticipant;
    opponent: BattleParticipant;
    animation: CombatAnimation | null;
    lastHit: 'player' | 'opponent' | null;
}

const CombatAnimationEffect: React.FC<{ animation: CombatAnimation }> = ({ animation }) => {
    const getEffectElement = () => {
        const effectClasses = "text-6xl md:text-8xl text-yellow-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.7)]";

        switch (animation.effect) {
            case 'slash':
                return <div className={effectClasses}>⚔️</div>;
            case 'fire':
                return <div className={effectClasses}>🔥</div>;
            case 'heal':
                return <div className={`text-6xl md:text-8xl text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.7)]`}>✨</div>;
            case 'shield':
                return <div className={`text-6xl md:text-8xl text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.7)]`}>🛡️</div>;
            default:
                return <div className={effectClasses}>💥</div>;
        }
    };

    // Animate a simple flash in the center
    return (
        <div key={animation.key} className="absolute inset-0 flex items-center justify-center pointer-events-none animate-flash">
            <div className="relative w-32 h-32">
                {getEffectElement()}
            </div>
        </div>
    )
}

const PetDisplay: React.FC<{ pet: PetCard }> = ({ pet }) => (
    <div className="w-24 h-32 bg-stone-800/70 rounded-lg border border-stone-600 p-2 flex flex-col items-center justify-center text-center">
        <div className="text-2xl">🐾</div>
        <p className="text-xs font-bold text-white truncate">{pet.name}</p>
        <p className="text-[10px] text-amber-400">[{pet.rarity}]</p>
    </div>
);

const Battlefield: React.FC<BattlefieldProps> = ({ player, opponent, animation, lastHit }) => {
    return (
        <div className="w-full h-full relative flex justify-around items-center p-4">
            {/* Player's Side */}
            <div className="flex items-center gap-4">
                <div className="animate-fade-in transition-transform duration-300 hover:scale-105">
                    <CharacterCardDisplay participant={player} isPlayer={true} wasHit={lastHit === 'player'} />
                </div>
                {player.pet && (
                    <div className="animate-fade-in-right">
                        <PetDisplay pet={player.pet} />
                    </div>
                )}
            </div>

            {/* Animation Layer */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                {animation && <CombatAnimationEffect animation={animation} />}
            </div>

            {/* Opponent's Side */}
            <div className="flex items-center gap-4">
                {opponent.pet && (
                    <div className="animate-fade-in-left">
                        <PetDisplay pet={opponent.pet} />
                    </div>
                )}
                <div className="animate-fade-in transition-transform duration-300 hover:scale-105">
                    <CharacterCardDisplay participant={opponent} isPlayer={false} wasHit={lastHit === 'opponent'} />
                </div>
            </div>
        </div>
    );
};

export default Battlefield;