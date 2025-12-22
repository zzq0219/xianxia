
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
        <div className="w-full h-full relative flex flex-col md:flex-row justify-center items-center p-4 overflow-hidden">
            {/* Atmospheric Background Overlay */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80 pointer-events-none z-0" />

            {/* Player's Side (Left/Bottom) */}
            <div className="relative z-10 flex-1 flex flex-col items-center md:items-end justify-center gap-6 md:pr-12 lg:pr-24 transition-all duration-500">
                <div className="relative group">
                    {/* Character Glow/Aura */}
                    <div className="absolute inset-0 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="animate-fade-in transition-transform duration-300 hover:scale-105 relative z-10">
                        <CharacterCardDisplay participant={player} isPlayer={true} wasHit={lastHit === 'player'} />
                    </div>

                    {/* Platform/Ground Effect */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-xl rounded-[100%] z-0" />
                </div>

                {player.pet && (
                    <div className="animate-fade-in-right absolute -right-4 top-0 md:top-auto md:-right-24 md:bottom-0">
                        <PetDisplay pet={player.pet} />
                    </div>
                )}
            </div>

            {/* VS Divider / Center Space */}
            <div className="relative z-0 h-12 w-full md:w-24 flex items-center justify-center opacity-50">
                {/* Optional: Add VS icon or center decoration here if desired */}
            </div>

            {/* Opponent's Side (Right/Top) */}
            <div className="relative z-10 flex-1 flex flex-col items-center md:items-start justify-center gap-6 md:pl-12 lg:pl-24 transition-all duration-500">
                <div className="relative group">
                    {/* Enemy Glow/Aura */}
                    <div className="absolute inset-0 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="animate-fade-in transition-transform duration-300 hover:scale-105 relative z-10">
                        <CharacterCardDisplay participant={opponent} isPlayer={false} wasHit={lastHit === 'opponent'} />
                    </div>

                    {/* Platform/Ground Effect */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/60 blur-xl rounded-[100%] z-0" />
                </div>

                {opponent.pet && (
                    <div className="animate-fade-in-left absolute -left-4 top-0 md:top-auto md:-left-24 md:bottom-0">
                        <PetDisplay pet={opponent.pet} />
                    </div>
                )}
            </div>

            {/* Animation Layer */}
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                {animation && <CombatAnimationEffect animation={animation} />}
            </div>
        </div>
    );
};

export default Battlefield;