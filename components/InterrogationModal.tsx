
import React, { useState } from 'react';
import { Prisoner, TortureMethod } from '../types';

interface InterrogationModalProps {
    isOpen: boolean;
    onClose: () => void;
    prisoner: Prisoner;
    availableTortureMethods: TortureMethod[];
    onExecuteTorture: (prisonerId: string, methodId: string, duration: number) => void;
    onEndInterrogation: () => void;
    interrogationLog: string;
    isLoading: boolean;
}

const InterrogationModal: React.FC<InterrogationModalProps> = ({
    isOpen,
    onClose,
    prisoner,
    availableTortureMethods,
    onExecuteTorture,
    onEndInterrogation,
    interrogationLog,
    isLoading
}) => {
    const [selectedMethod, setSelectedMethod] = useState<TortureMethod | null>(null);
    const [duration, setDuration] = useState<number>(30);
    const [showHistory, setShowHistory] = useState<boolean>(false);

    if (!isOpen) return null;

    // 按类别分组刑法
    const basicMethods = availableTortureMethods.filter(m => m.category === 'basic');
    const advancedMethods = availableTortureMethods.filter(m => m.category === 'advanced');
    const specialMethods = availableTortureMethods.filter(m => m.category === 'special');

    // 获取风险等级颜色
    const getRiskColor = (risk: number): string => {
        if (risk < 10) return 'text-green-400';
        if (risk < 30) return 'text-yellow-400';
        if (risk < 60) return 'text-orange-400';
        return 'text-red-400';
    };

    // 获取风险等级文本
    const getRiskLevel = (risk: number): string => {
        if (risk < 10) return '极低';
        if (risk < 30) return '低';
        if (risk < 60) return '中';
        if (risk < 80) return '高';
        return '极高';
    };

    // 渲染刑法卡片
    const renderMethodCard = (method: TortureMethod) => {
        const isSelected = selectedMethod?.id === method.id;
        const canUse = !method.requirements ||
            (!method.requirements.skill || prisoner.character.skills.some(s => s.name === method.requirements!.skill));

        return (
            <div
                key={method.id}
                onClick={() => canUse && setSelectedMethod(method)}
                className={`
          p-4 rounded-lg border-2 cursor-pointer transition-all
          ${isSelected
                        ? 'border-red-500 bg-red-900/30 shadow-lg shadow-red-500/50'
                        : canUse
                            ? 'border-stone-700 bg-black/30 hover:border-red-500/50 hover:bg-black/50'
                            : 'border-stone-800 bg-black/10 opacity-50 cursor-not-allowed'
                    }
        `}
            >
                <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-lg font-bold ${isSelected ? 'text-red-400' : 'text-white'}`}>
                        {method.name}
                    </h4>
                    {method.requirements?.cost && (
                        <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded">
                            {method.requirements.cost} 灵石
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-400 mb-3">{method.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                        <span className="text-gray-500">伤害:</span>
                        <span className="ml-1 text-red-400 font-bold">{method.damage}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">威慑:</span>
                        <span className="ml-1 text-orange-400 font-bold">{method.intimidation}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">成功率:</span>
                        <span className="ml-1 text-green-400 font-bold">{method.successRate}%</span>
                    </div>
                    <div>
                        <span className="text-gray-500">屈服度:</span>
                        <span className="ml-1 text-yellow-400 font-bold">+{method.submissionIncrease}</span>
                    </div>
                </div>

                <div className="border-t border-stone-700/50 pt-2 mt-2">
                    <div className="text-xs text-gray-500 mb-1">风险评估:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <span className="text-gray-600">死亡:</span>
                            <span className={`ml-1 font-bold ${getRiskColor(method.risks.death)}`}>
                                {getRiskLevel(method.risks.death)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">重伤:</span>
                            <span className={`ml-1 font-bold ${getRiskColor(method.risks.permanentInjury)}`}>
                                {getRiskLevel(method.risks.permanentInjury)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">疯狂:</span>
                            <span className={`ml-1 font-bold ${getRiskColor(method.risks.insanity)}`}>
                                {getRiskLevel(method.risks.insanity)}
                            </span>
                        </div>
                    </div>
                </div>

                {method.requirements && (
                    <div className="mt-2 pt-2 border-t border-stone-700/50">
                        <div className="text-xs text-gray-500">需求:</div>
                        {method.requirements.skill && (
                            <div className="text-xs text-cyan-400">技能: {method.requirements.skill}</div>
                        )}
                        {method.requirements.item && (
                            <div className="text-xs text-purple-400">道具: {method.requirements.item}</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // 渲染审讯历史
    const renderHistory = () => {
        if (prisoner.history.length === 0) {
            return (
                <div className="text-center text-gray-500 py-8">
                    <i className="fa-solid fa-file-lines text-4xl mb-4 opacity-50"></i>
                    <p>暂无审讯记录</p>
                </div>
            );
        }

        return (
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {prisoner.history.slice().reverse().map((record) => (
                    <div key={record.id} className="bg-black/30 p-3 rounded-lg border border-stone-700">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-red-400">{record.method.name}</span>
                                <span className="text-gray-500 text-sm ml-2">({record.duration}分钟)</span>
                            </div>
                            <span className="text-xs text-gray-500">{record.date}</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                            审讯者: {record.interrogator}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div>
                                <span className="text-gray-500">结果:</span>
                                <span className={`ml-1 font-bold ${record.result.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {record.result.success ? '成功' : '失败'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">屈服度:</span>
                                <span className="ml-1 text-yellow-400 font-bold">
                                    +{record.result.submissionIncrease}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">健康:</span>
                                <span className="ml-1 text-red-400 font-bold">
                                    -{record.result.healthDecrease}
                                </span>
                            </div>
                        </div>
                        {record.result.informationGained && (
                            <div className="mt-2 pt-2 border-t border-stone-700/50">
                                <div className="text-xs text-cyan-400 mb-1">获得情报:</div>
                                <div className="text-sm text-gray-300">{record.result.informationGained}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ornate-border bg-stone-900 w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/30 border-b border-red-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-red-400 font-serif flex items-center gap-2">
                            <i className="fa-solid fa-gavel"></i>
                            审讯室 - {prisoner.character.name}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {prisoner.character.realm} | {prisoner.crime}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="px-4 py-2 bg-cyan-600/80 text-white font-bold rounded-md hover:bg-cyan-500/80 transition-colors"
                        >
                            <i className="fa-solid fa-history mr-2"></i>
                            {showHistory ? '返回审讯' : '审讯历史'}
                        </button>
                        <button
                            onClick={onEndInterrogation}
                            className="px-4 py-2 bg-gray-600/80 text-white font-bold rounded-md hover:bg-gray-500/80 transition-colors"
                        >
                            结束审讯
                        </button>
                        <button
                            onClick={onClose}
                            className="text-red-400 hover:text-white transition-colors"
                        >
                            <i className="fa-solid fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Left Panel: Prisoner Info */}
                    <div className="w-80 bg-black/20 border-r border-stone-700 p-4 overflow-y-auto flex-shrink-0">
                        <div className="text-center mb-4">
                            <div className="w-32 h-32 mx-auto rounded-full bg-stone-700 mb-4 flex items-center justify-center border-4 border-red-900/50">
                                <i className="fa-solid fa-user-secret text-6xl text-gray-500"></i>
                            </div>
                            <h3 className="text-xl font-bold text-white">{prisoner.character.name}</h3>
                            <p className="text-gray-400">
                                {prisoner.character.gender === 'Male' ? '♂ 男性' : '♀ 女性'} | {prisoner.character.realm}
                            </p>
                        </div>

                        {/* 囚犯状态 */}
                        <div className="space-y-3 mb-4">
                            <div className="bg-black/30 p-3 rounded-lg">
                                <div className="text-sm text-gray-400 mb-2">健康状态</div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">健康</span>
                                    <span className={`text-sm font-bold ${prisoner.health > 70 ? 'text-green-400' :
                                        prisoner.health > 40 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {prisoner.health}%
                                    </span>
                                </div>
                                <div className="w-full bg-stone-700 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${prisoner.health > 70 ? 'bg-green-500' :
                                            prisoner.health > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${prisoner.health}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">神智</span>
                                    <span className={`text-sm font-bold ${prisoner.sanity > 70 ? 'text-green-400' :
                                        prisoner.sanity > 40 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {prisoner.sanity}%
                                    </span>
                                </div>
                                <div className="w-full bg-stone-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${prisoner.sanity > 70 ? 'bg-green-500' :
                                            prisoner.sanity > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${prisoner.sanity}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-black/30 p-3 rounded-lg">
                                <div className="text-sm text-gray-400 mb-2">意志状态</div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">屈服度</span>
                                    <span className="text-sm font-bold text-yellow-400">
                                        {prisoner.submissionLevel}%
                                    </span>
                                </div>
                                <div className="w-full bg-stone-700 rounded-full h-2 mb-2">
                                    <div
                                        className="h-2 bg-yellow-500 rounded-full transition-all"
                                        style={{ width: `${prisoner.submissionLevel}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">归顺度</span>
                                    <span className="text-sm font-bold text-green-400">
                                        {prisoner.loyaltyLevel}%
                                    </span>
                                </div>
                                <div className="w-full bg-stone-700 rounded-full h-2">
                                    <div
                                        className="h-2 bg-green-500 rounded-full transition-all"
                                        style={{ width: `${prisoner.loyaltyLevel}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 已知情报 */}
                        {prisoner.knownInformation.length > 0 && (
                            <div className="bg-black/30 p-3 rounded-lg">
                                <div className="text-sm text-gray-400 mb-2">已获情报</div>
                                <div className="space-y-1">
                                    {prisoner.knownInformation.map((info, index) => (
                                        <div key={index} className="text-xs text-cyan-400 flex items-start gap-1">
                                            <i className="fa-solid fa-check-circle mt-0.5"></i>
                                            <span>{info}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Methods or History */}
                    <div className="flex-grow flex flex-col overflow-hidden">
                        {showHistory ? (
                            <div className="p-6 overflow-y-auto">
                                <h3 className="text-xl font-bold text-white mb-4">审讯历史记录</h3>
                                {renderHistory()}
                            </div>
                        ) : (
                            <>
                                {/* Interrogation Log */}
                                {interrogationLog && (
                                    <div className="bg-black/30 p-4 border-b border-stone-700 max-h-48 overflow-y-auto flex-shrink-0">
                                        <h3 className="text-sm font-bold text-gray-400 mb-2">审讯记录</h3>
                                        <div className="prose prose-invert max-w-none">
                                            {interrogationLog.split('\n').map((line, index) => (
                                                <p key={index} className="text-gray-300 text-sm leading-relaxed mb-2">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Torture Methods */}
                                <div className="flex-grow overflow-y-auto p-6">
                                    {basicMethods.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                <i className="fa-solid fa-circle text-green-500 text-xs"></i>
                                                基础刑法
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {basicMethods.map(renderMethodCard)}
                                            </div>
                                        </div>
                                    )}

                                    {advancedMethods.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                <i className="fa-solid fa-circle text-orange-500 text-xs"></i>
                                                进阶刑法
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {advancedMethods.map(renderMethodCard)}
                                            </div>
                                        </div>
                                    )}

                                    {specialMethods.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                <i className="fa-solid fa-circle text-purple-500 text-xs"></i>
                                                特殊刑法
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {specialMethods.map(renderMethodCard)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Execute Panel */}
                                {selectedMethod && (
                                    <div className="flex-shrink-0 p-4 bg-black/40 border-t border-red-900/50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-grow">
                                                <div className="text-white font-bold mb-2">
                                                    已选择: <span className="text-red-400">{selectedMethod.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <label className="text-gray-400 text-sm">
                                                        持续时间(分钟):
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={duration}
                                                        onChange={(e) => setDuration(Number(e.target.value))}
                                                        min="5"
                                                        max="180"
                                                        step="5"
                                                        className="w-24 px-3 py-1 bg-stone-800 border border-stone-600 rounded text-white text-sm"
                                                    />
                                                    <span className="text-gray-500 text-sm">
                                                        ({Math.floor(duration / 60)}小时{duration % 60}分钟)
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onExecuteTorture(prisoner.character.id, selectedMethod.id, duration)}
                                                disabled={isLoading}
                                                className="px-6 py-3 bg-red-600/80 text-white font-bold rounded-md hover:bg-red-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                                        执行中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-gavel mr-2"></i>
                                                        执行刑罚
                                                    </>
                                                )}
                                            </button>
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

export default InterrogationModal;

