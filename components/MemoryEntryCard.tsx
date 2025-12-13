import React, { useState } from 'react';
import { MemoryCategory, MemoryEntry } from '../types';

interface MemoryEntryCardProps {
    entry: MemoryEntry;
    index: number;
    activeCategory: MemoryCategory;
    onDeleteEntry: (category: MemoryCategory, entryId: string) => void;
}

const MemoryEntryCard: React.FC<MemoryEntryCardProps> = ({ entry, index, activeCategory, onDeleteEntry }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const contentClasses = `transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-24' : 'max-h-full'
        }`;

    return (
        <div
            className="glass-morphism p-5 rounded-lg border border-stone-700/50 hover:border-xianxia-gold-500/50 transition-all duration-300 group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-600/20 to-amber-700/20 text-amber-300 text-xs rounded-full border border-amber-600/30">
                            第 {index + 1} 条
                        </span>
                        <h3 className="text-lg font-bold text-white font-serif">
                            {entry.title}
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <i className="fa-solid fa-clock"></i>
                            {entry.timestamp}
                        </span>
                        {entry.location && (
                            <span className="flex items-center gap-1">
                                <i className="fa-solid fa-location-dot"></i>
                                {entry.location}
                            </span>
                        )}
                        {entry.involvedCharacters && entry.involvedCharacters.length > 0 && (
                            <span className="flex items-center gap-1">
                                <i className="fa-solid fa-users"></i>
                                {entry.involvedCharacters.join('、')}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => onDeleteEntry(activeCategory, entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-400 hover:text-red-300 p-2"
                    title="删除此记忆"
                >
                    <i className="fa-solid fa-trash-alt"></i>
                </button>
            </div>
            <div
                className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-stone-900/30 p-4 rounded border border-stone-700/30 cursor-pointer"
                onClick={toggleCollapse}
            >
                <div className={contentClasses}>
                    {entry.content}
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                    {isCollapsed ? '点击展开' : '点击折叠'}
                </div>
            </div>
        </div>
    );
};

export default MemoryEntryCard;