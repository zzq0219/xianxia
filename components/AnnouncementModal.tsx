import React, { useState } from 'react';
import { GameState, Announcement } from '../types';

interface AnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    announcements: GameState['announcements'];
    onRefresh: () => void;
    isLoading: boolean;
}

type Tab = 'sect' | 'adventure' | 'world';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2 text-base font-semibold rounded-t-lg transition-colors duration-200 font-serif ${
            isActive 
            ? 'bg-stone-800/80 text-amber-400 border-b-2 border-amber-400' 
            : 'bg-transparent text-gray-400 hover:bg-stone-900/50 hover:text-gray-200'
        }`}
    >
        {label}
    </button>
);

const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({ announcement }) => (
    <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50 animate-fade-in">
        <div className="flex justify-between items-baseline">
            <h3 className="text-xl font-bold text-white font-serif">{announcement.title}</h3>
            <p className="text-sm text-gray-500 font-mono">{announcement.timestamp}</p>
        </div>
        <p className="text-gray-300 mt-2">{announcement.content}</p>
    </div>
);


const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, announcements, onRefresh, isLoading }) => {
    const [activeTab, setActiveTab] = useState<Tab>('sect');
    
    if (!isOpen) return null;

    const tabData: Record<Tab, { label: string; data: Announcement[] }> = {
        'sect': { label: '宗门公告', data: announcements.sect },
        'adventure': { label: '奇遇逸闻', data: announcements.adventure },
        'world': { label: '世界法旨', data: announcements.world }
    };

    const currentData = tabData[activeTab].data;

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ornate-border bg-stone-900 w-full max-w-4xl h-auto max-h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 pr-6 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">天机阁</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={onRefresh} disabled={isLoading} className="text-amber-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait">
                           <i className={`fa-solid fa-arrows-rotate text-xl ${isLoading ? 'animate-spin' : ''}`}></i>
                        </button>
                        <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                            <i className="fa-solid fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700">
                    {Object.entries(tabData).map(([key, { label }]) => (
                        <TabButton
                            key={key}
                            label={label}
                            isActive={activeTab === key}
                            onClick={() => setActiveTab(key as Tab)}
                        />
                    ))}
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {currentData.length > 0 ? (
                        currentData.map(announcement => (
                            <AnnouncementCard key={announcement.id} announcement={announcement} />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 pt-10">
                            <p className="text-4xl mb-4">📜</p>
                            <p>{isLoading ? '正在从天机阁获取最新情报...' : '此分类下暂无情报。'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementModal;
