
import React, { useEffect, useState } from 'react';

interface ActionNarratorProps {
    descriptions: string[];
    isLoading: boolean;
    isPlayerTurn: boolean;
}

const ActionNarrator: React.FC<ActionNarratorProps> = ({ descriptions, isLoading, isPlayerTurn }) => {
    const [displayedDescriptions, setDisplayedDescriptions] = useState<string[]>([]);

    useEffect(() => {
        setDisplayedDescriptions([]);
        if (descriptions.length > 0) {
            let index = 0;
            const intervalId = setInterval(() => {
                setDisplayedDescriptions(prev => [...prev, descriptions[index]]);
                index++;
                if (index >= descriptions.length) {
                    clearInterval(intervalId);
                }
            }, 100); // Faster reveal for more dynamic feel
            return () => clearInterval(intervalId);
        }
    }, [descriptions]);

    const renderContent = () => {
        if (isLoading && descriptions.length === 0) {
            return <p className="text-center text-amber-300 animate-glow">回合结算中...</p>;
        }
        if (displayedDescriptions.length > 0) {
            return displayedDescriptions.map((desc, i) => (
                <p key={i} className="text-center animate-fade-in">{desc}</p>
            ));
        }
        if (!isPlayerTurn && !isLoading) {
            return <p className="text-center text-gray-400">等待对手行动...</p>;
        }
        return <p className="text-center text-gray-500">请选择你的行动。</p>;
    }

    return (
        <div className="w-full min-h-[10rem] max-h-[16rem] bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col justify-start text-gray-300 font-serif transition-all duration-300 text-base shadow-inner shadow-black/50 overflow-y-auto">
            <div className="space-y-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default ActionNarrator;