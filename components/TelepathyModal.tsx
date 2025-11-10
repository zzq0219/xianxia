import React, { useState, useEffect } from 'react';
import { PlayerProfile, CharacterRelationship } from '../types';

interface TelepathyModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerProfile: PlayerProfile;
}

const TelepathyModal: React.FC<TelepathyModalProps> = ({ isOpen, onClose, playerProfile }) => {
    const [acquaintances, setAcquaintances] = useState<CharacterRelationship[]>([]);
    const [selectedContact, setSelectedContact] = useState<CharacterRelationship | null>(null);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [inputText, setInputText] = useState('');
    const [isAiResponding, setIsAiResponding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const familiarContacts = playerProfile.relationships.filter(
                rel => rel.relationshipStatus === '熟人'
            );
            setAcquaintances(familiarContacts);
            if (familiarContacts.length > 0) {
                setSelectedContact(familiarContacts[0]);
            } else {
                setSelectedContact(null);
            }
            setMessages([]);
            setInputText('');
        }
    }, [isOpen, playerProfile.relationships]);

    if (!isOpen) return null;

    const handleSendMessage = async () => {
        if (inputText.trim() && !isAiResponding && selectedContact) {
            const userMessage = { sender: 'user', text: inputText };
            const newMessages = [...messages, userMessage];
            setMessages(newMessages);
            setInputText('');
            setIsAiResponding(true);

            const systemInstruction = `你正在扮演角色 ${selectedContact.name}。请以 ${selectedContact.name} 的身份和口吻，简洁地回复玩家。你的回复应该符合仙侠世界的背景和你的角色设定。`;
            
            const history = newMessages.slice(-5).map(msg => `${msg.sender === 'user' ? playerProfile.name : selectedContact.name}: ${msg.text}`).join('\n');

            const prompt = `
对话历史:
${history}

玩家 (${playerProfile.name}) 的最新消息:
"${inputText}"

现在，请以 ${selectedContact.name} 的身份回复。
`;

            try {
                const aiResponse = await window.TavernHelper.generateRaw({
                    ordered_prompts: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: prompt }
                    ]
                });
                setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
            } catch (error) {
                console.error("传音失败:", error);
                setMessages(prev => [...prev, { sender: 'ai', text: '...信号中断...' }]);
            } finally {
                setIsAiResponding(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border-dialog bg-stone-900/90 backdrop-blur-lg w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 联系人列表 */}
                <div className="w-1/3 border-r-2 border-amber-500/10 flex flex-col bg-black/20">
                    <h3 className="text-xl font-bold text-amber-200 p-4 border-b-2 border-amber-500/10 text-center font-serif tracking-widest">传音玉简</h3>
                    <ul className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-amber-700/50 scrollbar-track-transparent">
                        {acquaintances.length > 0 ? (
                            acquaintances.map(contact => (
                                <li
                                    key={contact.id}
                                    className={`p-4 flex items-center cursor-pointer hover:bg-amber-500/10 transition-colors duration-200 border-b border-amber-500/5 ${selectedContact?.id === contact.id ? 'bg-amber-500/20' : ''}`}
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    <i className="fa-solid fa-user-circle text-2xl mr-4 text-amber-300/70"></i>
                                    <span className="text-lg text-gray-200 font-serif">{contact.name}</span>
                                </li>
                            ))
                        ) : (
                            <li className="p-4 text-center text-gray-500">暂无熟人</li>
                        )}
                    </ul>
                </div>

                {/* 对话窗口 */}
                <div className="w-2/3 flex flex-col bg-stone-800/30">
                    {selectedContact ? (
                        <>
                            <div className="p-4 border-b-2 border-amber-500/10 flex justify-between items-center bg-black/20">
                                <h3 className="text-xl font-bold text-amber-200 font-serif tracking-wider">{selectedContact.name}</h3>
                                <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                                    <i className="fa-solid fa-times text-xl"></i>
                                </button>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-amber-700/50 scrollbar-track-transparent">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender === 'ai' && <i className="fa-solid fa-user-circle text-2xl text-amber-300/70 mt-1"></i>}
                                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg font-serif shadow-md ${msg.sender === 'user' ? 'bg-blue-900/60 text-white rounded-br-none' : 'bg-stone-700/60 text-gray-200 rounded-bl-none'}`}>
                                            {msg.text}
                                        </div>
                                        {msg.sender === 'user' && <i className="fa-solid fa-user-circle text-2xl text-blue-300/70 mt-1"></i>}
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t-2 border-amber-500/10 bg-black/20">
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="w-full bg-stone-800/80 border border-amber-500/30 rounded-l-md p-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-400 font-serif"
                                        placeholder={isAiResponding ? "对方正在输入..." : "输入传音内容..."}
                                        disabled={isAiResponding}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isAiResponding || !inputText.trim()}
                                        className="bg-amber-600 text-white px-5 py-3 rounded-r-md hover:bg-amber-500 transition-colors font-semibold disabled:bg-stone-600 disabled:cursor-not-allowed flex items-center justify-center w-20"
                                    >
                                        {isAiResponding ? <i className="fas fa-spinner fa-pulse"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <i className="fa-solid fa-comments text-4xl mb-4"></i>
                            <p>请先从左侧选择一位熟人开始传音</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TelepathyModal;