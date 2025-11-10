import React, { useState, useEffect } from 'react';
import { PlayerProfile, DiceRollResult } from '../types';

interface PreBattleModalProps {
    playerProfile: PlayerProfile;
    opponentName: string;
    onBattleStart: (playerGender: 'Male' | 'Female', opponentGender: 'Male' | 'Female') => void;
    onClose: () => void;
}

const Dice: React.FC<{ value: number | null; rolling: boolean }> = ({ value, rolling }) => {
  const [displayValue, setDisplayValue] = useState(1);

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 50);
      return () => clearInterval(interval);
    } else if (value !== null) {
      setDisplayValue(value);
    }
  }, [rolling, value]);

  return (
    <div className="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-4xl font-bold text-stone-800 shadow-lg">
      {displayValue}
    </div>
  );
};

const PreBattleModal: React.FC<PreBattleModalProps> = ({ playerProfile, opponentName, onBattleStart, onClose }) => {
    const [stage, setStage] = useState<'roll' | 'select' | 'result'>('roll');
    const [diceResult, setDiceResult] = useState<DiceRollResult | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [playerChoice, setPlayerChoice] = useState<'Male' | 'Female' | null>(null);
    const [opponentChoice, setOpponentChoice] = useState<'Male' | 'Female' | null>(null);
    const [message, setMessage] = useState('通过拼点决定先手！');

    const handleRollDice = () => {
        setIsRolling(true);
        setTimeout(() => {
            let playerRoll, opponentRoll;
            do {
                playerRoll = Math.floor(Math.random() * 6) + 1;
                opponentRoll = Math.floor(Math.random() * 6) + 1;
            } while (playerRoll === opponentRoll); // Re-roll on tie for true 50/50 randomness

            const winner = playerRoll > opponentRoll ? 'player' : 'opponent';
            setDiceResult({ playerRoll, opponentRoll, winner });
            setIsRolling(false);
            setStage('select');
            setMessage(winner === 'player' ? '你赢得了先手！请选择你的出战队伍。' : '对手赢得了先手，正在选择队伍...');
        }, 1500);
    };

    const handleSelectGender = (gender: 'Male' | 'Female') => {
        if (diceResult?.winner === 'player' && !playerChoice) {
            setPlayerChoice(gender);
        }
    };

    // The main logic driver after the dice roll
    useEffect(() => {
        if (stage !== 'select' || !diceResult) return;

        // Both choices are made, move to result stage
        if (playerChoice && opponentChoice) {
            const timer = setTimeout(() => {
                setStage('result');
                setMessage('队伍确定，准备开战！');
            }, 1000);
            return () => clearTimeout(timer);
        }

        // If choices are not complete, let the winner choose or auto-assign loser's team
        if (!playerChoice || !opponentChoice) {
            if (diceResult.winner === 'player') {
                if (playerChoice && !opponentChoice) {
                    // Player has chosen, assign to opponent
                    const choice = playerChoice === 'Male' ? 'Female' : 'Male';
                    setMessage(`你已选择，对手将使用 ${choice === 'Male' ? '男性' : '女性'} 队伍。`);
                    const timer = setTimeout(() => setOpponentChoice(choice), 500);
                    return () => clearTimeout(timer);
                }
            } else { // Opponent is the winner
                if (!opponentChoice) {
                    // Opponent hasn't chosen yet, make them choose
                    const timer = setTimeout(() => {
                        const choice: 'Male' | 'Female' = Math.random() > 0.5 ? 'Male' : 'Female';
                        setOpponentChoice(choice);
                        setMessage(`对手选择了 ${choice === 'Male' ? '男性' : '女性'} 队伍。`);
                    }, 1500);
                    return () => clearTimeout(timer);
                } else if (opponentChoice && !playerChoice) {
                    // Opponent has chosen, assign to player
                    const choice = opponentChoice === 'Male' ? 'Female' : 'Male';
                    const timer = setTimeout(() => {
                        setPlayerChoice(choice);
                        setMessage(`你将使用 ${choice === 'Male' ? '男性' : '女性'} 队伍。`);
                    }, 500);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [stage, diceResult, playerChoice, opponentChoice]);


    const renderContent = () => {
        if (stage === 'roll') {
            return (
                <div className="text-center">
                    <div className="flex justify-around items-center my-8">
                        <div>
                            <p className="font-bold text-white mb-2">{playerProfile.name}</p>
                            <Dice value={null} rolling={isRolling} />
                        </div>
                        <p className="text-4xl font-serif text-amber-400">VS</p>
                        <div>
                            <p className="font-bold text-white mb-2">{opponentName}</p>
                            <Dice value={null} rolling={isRolling} />
                        </div>
                    </div>
                    <button
                        onClick={handleRollDice}
                        disabled={isRolling}
                        className="bg-amber-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
                    >
                        {isRolling ? '投掷中...' : '拼点'}
                    </button>
                </div>
            );
        }

        if (stage === 'select' || stage === 'result') {
            const canSelectMale = playerProfile.maleParty.length > 0;
            const canSelectFemale = playerProfile.femaleParty.length > 0;

            return (
                 <div className="text-center">
                    <div className="flex justify-around items-center my-4">
                        <div>
                            <p className="font-bold text-white mb-2">{playerProfile.name}</p>
                            <Dice value={diceResult?.playerRoll || 1} rolling={false} />
                        </div>
                        <p className={`text-2xl font-serif ${diceResult?.winner === 'player' ? 'text-green-400' : 'text-gray-400'}`}>
                            {diceResult?.winner === 'player' ? '胜利' : '败北'}
                        </p>
                        <div>
                            <p className="font-bold text-white mb-2">{opponentName}</p>
                            <Dice value={diceResult?.opponentRoll || 1} rolling={false} />
                        </div>
                    </div>
                    
                    <div className="my-6 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="font-semibold text-sky-400">你的队伍</p>
                            <p className="mt-2 text-lg font-bold text-white h-8 animate-fade-in">
                                {playerChoice ? (playerChoice === 'Male' ? '男性编队' : '女性编队') : '...'}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-red-400">对手队伍</p>
                            <p className="mt-2 text-lg font-bold text-white h-8 animate-fade-in">
                                {opponentChoice ? (opponentChoice === 'Male' ? '男性编队' : '女性编队') : '...'}
                            </p>
                        </div>
                    </div>

                    {diceResult?.winner === 'player' && !playerChoice && (
                        <div className="mt-4 flex justify-center gap-4 animate-fade-in">
                            <button 
                                onClick={() => handleSelectGender('Male')}
                                disabled={!canSelectMale}
                                className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                男性编队
                            </button>
                             <button 
                                onClick={() => handleSelectGender('Female')}
                                disabled={!canSelectFemale}
                                className="bg-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                女性编队
                            </button>
                        </div>
                    )}
                    {stage === 'result' && playerChoice && opponentChoice && (
                        <div className="mt-8 animate-fade-in">
                            <button
                                onClick={() => onBattleStart(playerChoice, opponentChoice)}
                                className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-500 transition-colors shadow-lg animate-pulse-fast"
                            >
                                进入战斗
                            </button>
                        </div>
                    )}
                 </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-lg shadow-2xl flex flex-col">
                <div className="p-4 text-center bg-black/20">
                    <h2 className="text-xl font-bold text-amber-300 font-serif">战前准备</h2>
                </div>
                <div className="p-6 font-serif">
                    <p className="text-center text-amber-300 mb-6 h-6">{message}</p>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PreBattleModal;