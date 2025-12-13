
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
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, [descriptions]);

    const renderContent = () => {
        if (isLoading && descriptions.length === 0) {
            return <p className="text-center text-gold-400 animate-glow tracking-wider">回合结算中...</p>;
        }
        if (displayedDescriptions.length > 0) {
            return displayedDescriptions.map((desc, i) => (
                <p key={i} className="text-center animate-fade-in text-ink-200 leading-relaxed">{desc}</p>
            ));
        }
        if (!isPlayerTurn && !isLoading) {
            return <p className="text-center text-ink-500 tracking-wide">等待对手行动...</p>;
        }
        return <p className="text-center text-ink-500 tracking-wide">请选择你的行动。</p>;
    }

    return (
        <div className="w-full min-h-[10rem] max-h-[16rem] ink-card p-4 rounded-lg flex flex-col justify-start text-ink-300 font-serif transition-all duration-300 text-base overflow-y-auto relative">
            {/* 装饰角 */}
            <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-gold-500/30" />
            <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-gold-500/30" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-gold-500/30" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-gold-500/30" />

            <div className="space-y-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default ActionNarrator;