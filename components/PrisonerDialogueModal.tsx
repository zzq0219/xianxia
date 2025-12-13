import React, { useState } from 'react';
import {
    DEFAULT_DIALOGUE_OPTIONS,
    DialogueOption,
    DialogueRecord,
    DialogueResult,
    DialogueType,
    Prisoner
} from '../types';

interface PrisonerDialogueModalProps {
    isOpen: boolean;
    onClose: () => void;
    prisoner: Prisoner;
    playerSpiritStones: number;
    onDialogueComplete: (result: DialogueResult) => void;
    onGenerateResponse: (prisoner: Prisoner, option: DialogueOption) => Promise<string>;
    isLoading: boolean;
}

const PrisonerDialogueModal: React.FC<PrisonerDialogueModalProps> = ({
    isOpen,
    onClose,
    prisoner,
    playerSpiritStones,
    onDialogueComplete,
    onGenerateResponse,
    isLoading
}) => {
    const [selectedType, setSelectedType] = useState<DialogueType | null>(null);
    const [selectedOption, setSelectedOption] = useState<DialogueOption | null>(null);
    const [dialogueHistory, setDialogueHistory] = useState<DialogueRecord[]>([]);
    const [currentResponse, setCurrentResponse] = useState<string>('');
    const [showHistory, setShowHistory] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    const dialogueTypes: { type: DialogueType; icon: string; color: string; description: string }[] = [
        { type: '威胁', icon: 'fa-skull-crossbones', color: 'red', description: '以暴力或威胁迫使囚犯屈服' },
        { type: '劝说', icon: 'fa-hand-holding-heart', color: 'blue', description: '用道理和情感说服囚犯' },
        { type: '交易', icon: 'fa-handshake', color: 'amber', description: '用利益交换囚犯的配合' },
        { type: '套话', icon: 'fa-user-secret', color: 'purple', description: '巧妙地套取情报' },
        { type: '闲聊', icon: 'fa-comments', color: 'green', description: '轻松的日常交流' },
        { type: '恩惠', icon: 'fa-gift', color: 'cyan', description: '给予好处以获取好感' },
        { type: '羞辱', icon: 'fa-face-angry', color: 'orange', description: '打击囚犯的尊严和意志' }
    ];

    const getAvailableOptions = (type: DialogueType): DialogueOption[] => {
        return DEFAULT_DIALOGUE_OPTIONS.filter(opt => {
            if (opt.type !== type) return false;
            if (opt.requirements) {
                if (opt.requirements.spiritStones && playerSpiritStones < opt.requirements.spiritStones) return false;
                if (opt.requirements.minSubmission && prisoner.submissionLevel < opt.requirements.minSubmission) return false;
                if (opt.requirements.maxSubmission && prisoner.submissionLevel > opt.requirements.maxSubmission) return false;
            }
            return true;
        });
    };

    const isOptionAvailable = (option: DialogueOption): boolean => {
        if (!option.requirements) return true;
        if (option.requirements.spiritStones && playerSpiritStones < option.requirements.spiritStones) return false;
        if (option.requirements.minSubmission && prisoner.submissionLevel < option.requirements.minSubmission) return false;
        if (option.requirements.maxSubmission && prisoner.submissionLevel > option.requirements.maxSubmission) return false;
        return true;
    };

    const getPrisonerMood = (): string => {
        if (prisoner.submissionLevel >= 80) return '完全屈服';
        if (prisoner.submissionLevel >= 60) return '意志动摇';
        if (prisoner.submissionLevel >= 40) return '勉强配合';
        if (prisoner.submissionLevel >= 20) return '抗拒不从';
        return '顽固抵抗';
    };

    const getMoodColor = (): string => {
        if (prisoner.submissionLevel >= 80) return 'text-green-400';
        if (prisoner.submissionLevel >= 60) return 'text-yellow-400';
        if (prisoner.submissionLevel >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const executeDialogue = async () => {
        if (!selectedOption) return;
        setIsExecuting(true);

        try {
            const response = await onGenerateResponse(prisoner, selectedOption);
            setCurrentResponse(response);

            const randomFactor = 0.7 + Math.random() * 0.6;
            const effects = {
                submissionChange: Math.round(selectedOption.baseEffects.submissionChange * randomFactor),
                loyaltyChange: Math.round(selectedOption.baseEffects.loyaltyChange * randomFactor),
                healthChange: Math.round(selectedOption.baseEffects.healthChange * randomFactor),
                sanityChange: Math.round(selectedOption.baseEffects.sanityChange * randomFactor)
            };

            const gotInformation = Math.random() * 100 < selectedOption.baseEffects.informationChance;

            let specialEvent: string | undefined;
            if (selectedOption.riskFactors) {
                if (Math.random() * 100 < selectedOption.riskFactors.rebellion) {
                    specialEvent = '囚犯表现出强烈的反抗情绪';
                } else if (Math.random() * 100 < selectedOption.riskFactors.breakdown) {
                    specialEvent = '囚犯的精神状态出现异常';
                } else if (Math.random() * 100 < selectedOption.riskFactors.escapeAttempt) {
                    specialEvent = '囚犯似乎在暗中谋划什么';
                }
            }

            const record: DialogueRecord = {
                id: `dialogue-${Date.now()}`,
                prisonerId: prisoner.character.id,
                prisonerName: prisoner.character.name,
                timestamp: new Date().toLocaleString('zh-CN'),
                realTimestamp: Date.now(),
                dialogueType: selectedOption.type,
                playerChoice: selectedOption.text,
                prisonerResponse: response,
                attitude: prisoner.submissionLevel >= 60 ? '顺从' : prisoner.submissionLevel >= 30 ? '中立' : '敌对',
                effects: {
                    submissionChange: effects.submissionChange,
                    loyaltyChange: effects.loyaltyChange,
                    healthChange: effects.healthChange,
                    sanityChange: effects.sanityChange,
                    informationGained: gotInformation ? '获得了一些有价值的情报' : undefined,
                    specialEvent
                }
            };

            setDialogueHistory(prev => [...prev, record]);

            const result: DialogueResult = {
                success: true,
                dialogueRecord: record,
                prisonerReaction: response,
                narrativeText: response,
                stateChanges: {
                    submission: effects.submissionChange,
                    loyalty: effects.loyaltyChange,
                    health: effects.healthChange,
                    sanity: effects.sanityChange
                },
                rewards: gotInformation ? { information: '获得了一些有价值的情报' } : undefined,
                consequences: specialEvent ? { eventTriggered: specialEvent } : undefined
            };

            onDialogueComplete(result);
        } catch (error) {
            console.error('对话执行失败:', error);
            setCurrentResponse('（对话过程中出现了意外...）');
        } finally {
            setIsExecuting(false);
            setSelectedOption(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="ornate-border bg-stone-900 w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-gradient-to-r from-stone-800 to-stone-900 border-b border-amber-500/30">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-stone-700 flex items-center justify-center border-2 border-amber-500/50">
                            <i className="fa-solid fa-user text-3xl text-gray-400"></i>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-amber-300 font-serif flex items-center gap-2">
                                <i className="fa-solid fa-comments"></i>
                                与 {prisoner.character.name} 对话
                            </h2>
                            <div className="flex items-center gap-4 text-sm mt-1">
                                <span className="text-gray-400">{prisoner.character.gender === 'Male' ? '♂' : '♀'} {prisoner.character.realm}</span>
                                <span className={getMoodColor()}><i className="fa-solid fa-brain mr-1"></i>{getPrisonerMood()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowHistory(!showHistory)} className="px-4 py-2 bg-cyan-600/80 text-white font-bold rounded-md hover:bg-cyan-500/80 transition-colors">
                            <i className="fa-solid fa-history mr-2"></i>{showHistory ? '返回对话' : '对话记录'}
                        </button>
                        <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors p-2">
                            <i className="fa-solid fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Left Panel */}
                    <div className="w-72 bg-black/30 border-r border-stone-700 p-4 overflow-y-auto flex-shrink-0">
                        <div className="space-y-4 mb-6">
                            <div className="bg-black/40 p-3 rounded-lg">
                                <div className="text-sm text-gray-400 mb-2">身体状态</div>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">健康</span>
                                            <span className={prisoner.health > 70 ? 'text-green-400' : prisoner.health > 40 ? 'text-yellow-400' : 'text-red-400'}>{prisoner.health}%</span>
                                        </div>
                                        <div className="w-full bg-stone-700 rounded-full h-2">
                                            <div className={`h-2 rounded-full transition-all ${prisoner.health > 70 ? 'bg-green-500' : prisoner.health > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${prisoner.health}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">神智</span>
                                            <span className={prisoner.sanity > 70 ? 'text-green-400' : prisoner.sanity > 40 ? 'text-yellow-400' : 'text-red-400'}>{prisoner.sanity}%</span>
                                        </div>
                                        <div className="w-full bg-stone-700 rounded-full h-2">
                                            <div className={`h-2 rounded-full transition-all ${prisoner.sanity > 70 ? 'bg-green-500' : prisoner.sanity > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${prisoner.sanity}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg">
                                <div className="text-sm text-gray-400 mb-2">意志状态</div>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">屈服度</span>
                                            <span className="text-yellow-400">{prisoner.submissionLevel}%</span>
                                        </div>
                                        <div className="w-full bg-stone-700 rounded-full h-2">
                                            <div className="h-2 bg-yellow-500 rounded-full transition-all" style={{ width: `${prisoner.submissionLevel}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">归顺度</span>
                                            <span className="text-green-400">{prisoner.loyaltyLevel}%</span>
                                        </div>
                                        <div className="w-full bg-stone-700 rounded-full h-2">
                                            <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${prisoner.loyaltyLevel}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg mb-4">
                            <div className="text-sm text-gray-400 mb-2">囚犯信息</div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">罪行</span>
                                    <span className="text-red-300 text-right max-w-[150px] truncate" title={prisoner.crime}>{prisoner.crime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">剩余刑期</span>
                                    <span className="text-orange-400">{prisoner.remainingDays}天</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">关押位置</span>
                                    <span className="text-blue-400">{prisoner.location}</span>
                                </div>
                            </div>
                        </div>
                        {prisoner.status.length > 0 && (
                            <div className="bg-black/40 p-3 rounded-lg">
                                <div className="text-sm text-gray-400 mb-2">当前状态</div>
                                <div className="flex flex-wrap gap-1">
                                    {prisoner.status.map((status, idx) => (
                                        <span key={idx} className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded">{status}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel */}
                    <div className="flex-grow flex flex-col overflow-hidden">
                        {showHistory ? (
                            <div className="flex-grow overflow-y-auto p-6">
                                <h3 className="text-xl font-bold text-white mb-4">对话历史记录</h3>
                                {dialogueHistory.length === 0 ? (
                                    <div className="text-center text-gray-500 py-10">
                                        <i className="fa-solid fa-comments text-4xl mb-4 opacity-50"></i>
                                        <p>暂无对话记录</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dialogueHistory.map((record) => (
                                            <div key={record.id} className="bg-black/30 p-4 rounded-lg border border-stone-700">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded">{record.dialogueType}</span>
                                                        <span className="text-white font-bold">{record.playerChoice}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{record.timestamp}</span>
                                                </div>
                                                <div className="bg-black/20 p-3 rounded mb-3">
                                                    <p className="text-gray-300 text-sm italic">"{record.prisonerResponse}"</p>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 text-xs">
                                                    <div><span className="text-gray-500">屈服度:</span><span className={`ml-1 font-bold ${record.effects.submissionChange >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>{record.effects.submissionChange >= 0 ? '+' : ''}{record.effects.submissionChange}</span></div>
                                                    <div><span className="text-gray-500">归顺度:</span><span className={`ml-1 font-bold ${record.effects.loyaltyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{record.effects.loyaltyChange >= 0 ? '+' : ''}{record.effects.loyaltyChange}</span></div>
                                                    <div><span className="text-gray-500">健康:</span><span className={`ml-1 font-bold ${record.effects.healthChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{record.effects.healthChange >= 0 ? '+' : ''}{record.effects.healthChange}</span></div>
                                                    <div><span className="text-gray-500">神智:</span><span className={`ml-1 font-bold ${record.effects.sanityChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{record.effects.sanityChange >= 0 ? '+' : ''}{record.effects.sanityChange}</span></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {currentResponse && (
                                    <div className="bg-gradient-to-r from-stone-800/50 to-stone-900/50 p-4 border-b border-stone-700 flex-shrink-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
                                                <i className="fa-solid fa-user text-gray-400"></i>
                                            </div>
                                            <div>
                                                <div className="text-amber-300 font-bold mb-1">{prisoner.character.name}</div>
                                                <p className="text-gray-300 italic">"{currentResponse}"</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!selectedType && (
                                    <div className="flex-grow overflow-y-auto p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">选择对话方式</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {dialogueTypes.map(({ type, icon, color, description }) => {
                                                const availableCount = getAvailableOptions(type).length;
                                                const colorClasses = {
                                                    red: 'border-red-500/30 bg-red-900/20 hover:border-red-500/60 text-red-400',
                                                    blue: 'border-blue-500/30 bg-blue-900/20 hover:border-blue-500/60 text-blue-400',
                                                    amber: 'border-amber-500/30 bg-amber-900/20 hover:border-amber-500/60 text-amber-400',
                                                    purple: 'border-purple-500/30 bg-purple-900/20 hover:border-purple-500/60 text-purple-400',
                                                    green: 'border-green-500/30 bg-green-900/20 hover:border-green-500/60 text-green-400',
                                                    cyan: 'border-cyan-500/30 bg-cyan-900/20 hover:border-cyan-500/60 text-cyan-400',
                                                    orange: 'border-orange-500/30 bg-orange-900/20 hover:border-orange-500/60 text-orange-400'
                                                };
                                                return (
                                                    <button key={type} onClick={() => setSelectedType(type)} disabled={availableCount === 0}
                                                        className={`p-4 rounded-lg border-2 transition-all text-left ${availableCount > 0 ? colorClasses[color as keyof typeof colorClasses] : 'border-stone-700 bg-stone-800/50 opacity-50 cursor-not-allowed'}`}>
                                                        <div className="text-2xl mb-2"><i className={`fa-solid ${icon}`}></i></div>
                                                        <div className="font-bold mb-1">{type}</div>
                                                        <div className="text-xs text-gray-400 mb-2">{description}</div>
                                                        <div className="text-xs text-gray-500">{availableCount} 个可用选项</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {selectedType && !selectedOption && (
                                    <div className="flex-grow overflow-y-auto p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <button onClick={() => setSelectedType(null)} className="text-gray-400 hover:text-white transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                                            <h3 className="text-lg font-bold text-white">{selectedType} - 选择具体方式</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {DEFAULT_DIALOGUE_OPTIONS.filter(opt => opt.type === selectedType).map((option) => {
                                                const available = isOptionAvailable(option);
                                                return (
                                                    <button key={option.id} onClick={() => available && setSelectedOption(option)} disabled={!available}
                                                        className={`p-4 rounded-lg border-2 transition-all text-left ${available ? 'border-stone-600 bg-black/30 hover:border-amber-500/50' : 'border-stone-800 bg-black/10 opacity-50 cursor-not-allowed'}`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className="text-2xl text-amber-400"><i className={`fa-solid ${option.icon}`}></i></div>
                                                            <div className="flex-grow">
                                                                <div className="font-bold text-white mb-1">{option.text}</div>
                                                                <div className="text-xs text-gray-400 mb-2">{option.description}</div>
                                                                <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                                                                    <div><span className="text-gray-500">屈服:</span><span className={`ml-1 ${option.baseEffects.submissionChange >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>{option.baseEffects.submissionChange >= 0 ? '+' : ''}{option.baseEffects.submissionChange}</span></div>
                                                                    <div><span className="text-gray-500">归顺:</span><span className={`ml-1 ${option.baseEffects.loyaltyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{option.baseEffects.loyaltyChange >= 0 ? '+' : ''}{option.baseEffects.loyaltyChange}</span></div>
                                                                    <div><span className="text-gray-500">情报:</span><span className="ml-1 text-cyan-400">{option.baseEffects.informationChance}%</span></div>
                                                                    {option.riskFactors && option.riskFactors.rebellion > 10 && (<div><span className="text-gray-500">风险:</span><span className="ml-1 text-red-400">{option.riskFactors.rebellion > 30 ? '高' : '中'}</span></div>)}
                                                                </div>
                                                                {option.requirements?.spiritStones && (
                                                                    <span className={`px-2 py-0.5 text-xs rounded ${playerSpiritStones >= option.requirements.spiritStones ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>{option.requirements.spiritStones} 灵石</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {selectedOption && (
                                    <div className="flex-shrink-0 p-4 bg-black/40 border-t border-amber-500/30">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-white font-bold mb-1">已选择: <span className="text-amber-400">{selectedOption.text}</span></div>
                                                <div className="text-xs text-gray-400">{selectedOption.description}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setSelectedOption(null)} className="px-4 py-2 bg-gray-600/80 text-white rounded-md hover:bg-gray-500/80 transition-colors">取消</button>
                                                <button onClick={executeDialogue} disabled={isExecuting || isLoading} className="px-6 py-2 bg-amber-600/80 text-white font-bold rounded-md hover:bg-amber-500/80 disabled:opacity-50 transition-colors">
                                                    {isExecuting ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>对话中...</> : <><i className="fa-solid fa-comment mr-2"></i>开始对话</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrisonerDialogueModal;