import React, { useEffect, useState } from 'react';
import {
    DialogueOption,
    DialogueResult,
    LaborSite,
    PrisonArea,
    Prisoner,
    PrisonSystem,
    Rarity
} from '../types';
import CharacterDetail from './CharacterDetail';
import PrisonerDialogueModal from './PrisonerDialogueModal';

interface PrisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    prisonSystem: PrisonSystem;
    onInterrogatePrisoner: (prisoner: Prisoner) => void;
    onViewPrisonerDetail: (prisoner: Prisoner) => void;
    onTransferPrisoner: (prisoner: Prisoner, newArea: PrisonArea) => void;
    onReleasePrisoner: (prisoner: Prisoner) => void;
    onRecruitPrisoner: (prisoner: Prisoner) => void;
    onAssignLabor: (prisonerId: string, siteId: string, duration: number) => void;
    onClaimLaborResult?: (siteId: string, workerId: string) => void;
    onGenerateEvent: () => void;
    onDialogueComplete?: (prisoner: Prisoner, result: DialogueResult) => void;
    onGenerateDialogueResponse?: (prisoner: Prisoner, option: DialogueOption) => Promise<string>;
    isLoading: boolean;
    playerProfile: any; // 添加 playerProfile 用于 CharacterDetail
    setPlayerProfile: (profile: any) => void; // 添加 setPlayerProfile
    onViewPet: (pet: any) => void; // 添加 onViewPet
}

const PrisonModal: React.FC<PrisonModalProps> = ({
    isOpen,
    onClose,
    prisonSystem,
    onInterrogatePrisoner,
    onViewPrisonerDetail,
    onTransferPrisoner,
    onReleasePrisoner,
    onRecruitPrisoner,
    onAssignLabor,
    onClaimLaborResult,
    onGenerateEvent,
    onDialogueComplete,
    onGenerateDialogueResponse,
    isLoading,
    playerProfile,
    setPlayerProfile,
    onViewPet
}) => {
    const [selectedArea, setSelectedArea] = useState<PrisonArea>('管理区');
    const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDialogueModal, setShowDialogueModal] = useState(false);
    const [dialoguePrisoner, setDialoguePrisoner] = useState<Prisoner | null>(null);
    const [selectedLaborSite, setSelectedLaborSite] = useState<string | null>(null);
    const [laborDuration, setLaborDuration] = useState<number>(3600000); // 默认1小时
    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    // 更新当前时间，用于显示实时倒计时
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isOpen) return null;

    // 安全检查：确保prisonSystem存在
    if (!prisonSystem || !prisonSystem.stats) {
        return (
            <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={onClose}
            >
                <div className="bg-stone-900 p-8 rounded-xl text-center">
                    <i className="fa-solid fa-exclamation-triangle text-yellow-400 text-4xl mb-4"></i>
                    <h3 className="text-xl text-white mb-2">大牢系统数据缺失</h3>
                    <p className="text-gray-400 mb-4">请重新开始游戏或加载新存档</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-500"
                    >
                        关闭
                    </button>
                </div>
            </div>
        );
    }

    const areas: PrisonArea[] = ['居住区', '审讯区', '娱乐区', '劳役区', '管理区', '医疗区'];

    // 获取当前区域的囚犯
    const getPrisonersInArea = (area: PrisonArea): Prisoner[] => {
        return prisonSystem.prisoners.filter(p => p.location === area);
    };

    // 渲染区域图标
    const getAreaIcon = (area: PrisonArea): string => {
        const icons: Record<PrisonArea, string> = {
            '居住区': 'fa-bed',
            '审讯区': 'fa-gavel',
            '娱乐区': 'fa-gamepad',
            '劳役区': 'fa-hammer',
            '管理区': 'fa-chart-line',
            '医疗区': 'fa-hospital'
        };
        return icons[area];
    };

    // 渲染区域颜色
    const getAreaColor = (area: PrisonArea): string => {
        const colors: Record<PrisonArea, string> = {
            '居住区': 'blue',
            '审讯区': 'red',
            '娱乐区': 'green',
            '劳役区': 'orange',
            '管理区': 'purple',
            '医疗区': 'cyan'
        };
        return colors[area];
    };

    // 渲染管理区界面
    const renderManagementArea = () => {
        const stats = prisonSystem.stats;
        const recentEvents = prisonSystem.events.slice(-5).reverse();

        return (
            <div className="space-y-4">
                {/* 统计信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black/30 p-4 rounded-lg border border-stone-700">
                        <div className="text-gray-400 text-sm mb-1">囚犯总数</div>
                        <div className="text-2xl font-bold text-white">
                            {stats.totalPrisoners} / {prisonSystem.config.maxPrisoners}
                        </div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg border border-stone-700">
                        <div className="text-gray-400 text-sm mb-1">平均屈服度</div>
                        <div className="text-2xl font-bold text-yellow-400">
                            {stats.avgSubmission.toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg border border-stone-700">
                        <div className="text-gray-400 text-sm mb-1">平均归顺度</div>
                        <div className="text-2xl font-bold text-green-400">
                            {stats.avgLoyalty.toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg border border-stone-700">
                        <div className="text-gray-400 text-sm mb-1">狱卒数量</div>
                        <div className="text-2xl font-bold text-blue-400">
                            {stats.totalGuards}
                        </div>
                    </div>
                </div>

                {/* 财务统计 */}
                <div className="bg-black/30 p-4 rounded-lg border border-stone-700">
                    <h3 className="text-lg font-bold text-amber-300 mb-3">财务统计</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="text-gray-400 text-sm">总收入</div>
                            <div className="text-xl font-bold text-green-400">
                                {stats.totalRevenue} <span className="text-sm">灵石</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">总支出</div>
                            <div className="text-xl font-bold text-red-400">
                                {stats.totalExpenses} <span className="text-sm">灵石</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">净利润</div>
                            <div className={`text-xl font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.netProfit} <span className="text-sm">灵石</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 最近事件 */}
                <div className="bg-black/30 p-4 rounded-lg border border-stone-700">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-amber-300">最近事件</h3>
                        <button
                            onClick={onGenerateEvent}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm bg-purple-600/80 text-white rounded-md hover:bg-purple-500/80 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? '生成中...' : '触发随机事件'}
                        </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentEvents.length > 0 ? (
                            recentEvents.map(event => {
                                const severityColor =
                                    event.severity === 'critical' ? 'text-red-400' :
                                        event.severity === 'high' ? 'text-orange-400' :
                                            event.severity === 'medium' ? 'text-yellow-400' :
                                                'text-gray-400';

                                return (
                                    <div key={event.id} className="bg-black/20 p-3 rounded border border-stone-700/50">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-bold ${severityColor}`}>{event.title}</span>
                                            <span className="text-xs text-gray-500">{event.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-gray-300">{event.description}</p>
                                        {!event.resolved && (
                                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                                                未处理
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500 py-4">暂无事件记录</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // 渲染囚犯列表
    const renderPrisonerList = (area: PrisonArea) => {
        const prisoners = getPrisonersInArea(area);

        if (prisoners.length === 0) {
            return (
                <div className="text-center text-gray-500 py-10">
                    <i className={`fa-solid ${getAreaIcon(area)} text-4xl mb-4 opacity-50`}></i>
                    <p>此区域暂无囚犯</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {prisoners.map(prisoner => {
                    const submissionColor =
                        prisoner.submissionLevel > 70 ? 'text-green-400' :
                            prisoner.submissionLevel > 40 ? 'text-yellow-400' :
                                'text-red-400';

                    return (
                        <div
                            key={prisoner.character.id}
                            className="bg-black/30 p-4 rounded-lg border border-stone-700 hover:border-amber-500/50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-white">{prisoner.character.name}</h3>
                                        <span className="text-sm text-gray-400">
                                            {prisoner.character.gender === 'Male' ? '♂' : '♀'} Lv.{prisoner.character.realm}
                                        </span>
                                        <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                                            {prisoner.character.rarity}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-400 mb-2">
                                        <span className="text-red-300">罪行:</span> {prisoner.crime}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-400">屈服:</span>
                                            <span className={`ml-1 font-bold ${submissionColor}`}>{prisoner.submissionLevel}%</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">归顺:</span>
                                            <span className={`ml-1 font-bold ${prisoner.loyaltyLevel > 70 ? 'text-green-400' : 'text-gray-400'}`}>
                                                {prisoner.loyaltyLevel}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">剩余刑期:</span>
                                            <span className="ml-1 font-bold text-orange-400">{prisoner.remainingDays}天</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {prisoner.status.map(status => (
                                            <span key={status} className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded">
                                                {status}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPrisoner(prisoner);
                                            setShowDetailModal(true);
                                        }}
                                        className="px-3 py-1 text-sm bg-cyan-600/80 text-white rounded hover:bg-cyan-500/80 transition-colors"
                                    >
                                        详情
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDialoguePrisoner(prisoner);
                                            setShowDialogueModal(true);
                                        }}
                                        disabled={isLoading}
                                        className="px-3 py-1 text-sm bg-amber-600/80 text-white rounded hover:bg-amber-500/80 disabled:opacity-50 transition-colors"
                                    >
                                        <i className="fa-solid fa-comments mr-1"></i>
                                        对话
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onInterrogatePrisoner(prisoner);
                                        }}
                                        disabled={isLoading}
                                        className="px-3 py-1 text-sm bg-red-600/80 text-white rounded hover:bg-red-500/80 disabled:opacity-50 transition-colors"
                                    >
                                        审讯
                                    </button>
                                    {/* 区域转移下拉菜单 */}
                                    <select
                                        value={prisoner.location}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onTransferPrisoner(prisoner, e.target.value as PrisonArea);
                                        }}
                                        className="px-2 py-1 text-xs bg-stone-700 text-white rounded border border-stone-600"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="" disabled>转移到...</option>
                                        {areas.filter(a => a !== prisoner.location).map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                    {prisoner.loyaltyLevel >= 80 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRecruitPrisoner(prisoner);
                                            }}
                                            className="px-3 py-1 text-sm bg-green-600/80 text-white rounded hover:bg-green-500/80 transition-colors"
                                        >
                                            招募
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // 渲染劳役区界面
    const renderLaborArea = () => {
        const availablePrisoners = prisonSystem.prisoners.filter(
            p => !p.status.includes('劳役中') && p.health > 30
        );

        // 格式化时间显示
        const formatTime = (ms: number): string => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            if (hours > 0) {
                return `${hours}小时${minutes % 60}分钟`;
            } else if (minutes > 0) {
                return `${minutes}分钟${seconds % 60}秒`;
            } else {
                return `${seconds}秒`;
            }
        };

        // 获取稀有度颜色
        const getRarityColor = (rarity: Rarity): string => {
            const colors: Record<Rarity, string> = {
                '凡品': 'text-gray-400',
                '良品': 'text-green-400',
                '优品': 'text-blue-400',
                '珍品': 'text-purple-400',
                '绝品': 'text-orange-400',
                '仙品': 'text-red-400',
                '圣品': 'text-pink-400',
                '神品': 'text-yellow-400'
            };
            return colors[rarity] || 'text-gray-400';
        };

        // 渲染单个劳役位置
        const renderLaborSite = (site: LaborSite) => {
            const availableSlots = site.maxWorkers - site.workers.length;
            const siteColor = site.type === '矿山' ? 'orange' : 'green';

            return (
                <div key={site.id} className={`bg-black/30 p-4 rounded-lg border-2 border-${siteColor}-500/30 hover:border-${siteColor}-500/60 transition-colors`}>
                    {/* 位置标题 */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`text-xl font-bold text-${siteColor}-300 flex items-center gap-2`}>
                                <i className={`fa-solid ${site.type === '矿山' ? 'fa-mountain' : 'fa-leaf'}`}></i>
                                {site.name}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">{site.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${availableSlots > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {availableSlots}/{site.maxWorkers} 可用
                        </div>
                    </div>

                    {/* 工位列表 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {[0, 1].map(slotIndex => {
                            const worker = site.workers[slotIndex];

                            if (worker) {
                                const timeRemaining = Math.max(0, worker.endTime - currentTime);
                                const isCompleted = timeRemaining === 0;
                                const progress = ((worker.duration - timeRemaining) / worker.duration) * 100;

                                return (
                                    <div key={slotIndex} className={`bg-black/40 p-3 rounded-lg border ${isCompleted ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="text-white font-bold">{worker.prisonerName}</div>
                                                <div className="text-xs text-gray-400">工位 #{slotIndex + 1}</div>
                                            </div>
                                            {isCompleted ? (
                                                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded animate-pulse">
                                                    <i className="fa-solid fa-check mr-1"></i>
                                                    完成
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                                                    <i className="fa-solid fa-clock mr-1"></i>
                                                    劳役中
                                                </span>
                                            )}
                                        </div>

                                        {/* 进度条 */}
                                        <div className="mb-2">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>进度</span>
                                                <span>{isCompleted ? '已完成' : formatTime(timeRemaining)}</span>
                                            </div>
                                            <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* 操作按钮 */}
                                        {isCompleted && onClaimLaborResult && (
                                            <button
                                                onClick={() => onClaimLaborResult(site.id, worker.prisonerId)}
                                                className="w-full px-3 py-1.5 text-sm bg-green-600/80 text-white rounded hover:bg-green-500/80 transition-colors"
                                            >
                                                <i className="fa-solid fa-gift mr-2"></i>
                                                领取奖励
                                            </button>
                                        )}
                                    </div>
                                );
                            } else {
                                // 空工位
                                return (
                                    <div key={slotIndex} className="bg-black/20 p-3 rounded-lg border border-dashed border-stone-600">
                                        <div className="text-center text-gray-500 py-4">
                                            <i className="fa-solid fa-user-plus text-2xl mb-2 opacity-50"></i>
                                            <div className="text-sm">工位 #{slotIndex + 1}</div>
                                            <div className="text-xs">空闲中</div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {/* 分配囚犯区域 */}
                    {availableSlots > 0 && availablePrisoners.length > 0 && (
                        <div className="border-t border-stone-700 pt-3">
                            <div className="text-sm text-gray-400 mb-2">分配囚犯到此劳役点：</div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedLaborSite === site.id ? selectedLaborSite : ''}
                                    onChange={(e) => setSelectedLaborSite(e.target.value || null)}
                                    className="flex-grow px-3 py-2 bg-stone-700 text-white rounded border border-stone-600 text-sm"
                                >
                                    <option value="">选择囚犯...</option>
                                    {availablePrisoners.map(p => (
                                        <option key={p.character.id} value={p.character.id}>
                                            {p.character.name} (健康:{p.health}%)
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={laborDuration}
                                    onChange={(e) => setLaborDuration(Number(e.target.value))}
                                    className="px-3 py-2 bg-stone-700 text-white rounded border border-stone-600 text-sm"
                                >
                                    <option value={1800000}>30分钟</option>
                                    <option value={3600000}>1小时</option>
                                    <option value={7200000}>2小时</option>
                                    <option value={14400000}>4小时</option>
                                    <option value={28800000}>8小时</option>
                                </select>
                                <button
                                    onClick={() => {
                                        if (selectedLaborSite) {
                                            const prisoner = availablePrisoners.find(p => p.character.id === selectedLaborSite);
                                            if (prisoner) {
                                                onAssignLabor(prisoner.character.id, site.id, laborDuration);
                                                setSelectedLaborSite(null);
                                            }
                                        }
                                    }}
                                    disabled={!selectedLaborSite}
                                    className="px-4 py-2 bg-blue-600/80 text-white rounded hover:bg-blue-500/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    <i className="fa-solid fa-play mr-1"></i>
                                    开始劳役
                                </button>
                            </div>
                        </div>
                    )}

                    {availableSlots > 0 && availablePrisoners.length === 0 && (
                        <div className="border-t border-stone-700 pt-3 text-center text-gray-500 text-sm">
                            <i className="fa-solid fa-info-circle mr-1"></i>
                            暂无可分配的囚犯（需要健康值大于30%且未在劳役中）
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-4">
                {/* 材料库存 */}
                {prisonSystem.materialInventory && prisonSystem.materialInventory.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-900/20 to-purple-900/20 p-4 rounded-lg border border-amber-500/30">
                        <h3 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-box-open"></i>
                            材料库存
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {prisonSystem.materialInventory.map((inventoryItem, idx) => (
                                <div key={`${inventoryItem.material.id}-${idx}`} className="bg-black/40 p-3 rounded border border-stone-700/50">
                                    <div className={`font-bold ${getRarityColor(inventoryItem.material.rarity)}`}>
                                        {inventoryItem.material.name}
                                    </div>
                                    <div className="text-xs text-gray-400 mb-1">{inventoryItem.material.type === 'ore' ? '矿石' : '草药'}</div>
                                    <div className="text-sm text-white">
                                        数量: <span className="font-bold text-green-400">{inventoryItem.quantity}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        价值: {inventoryItem.material.value} 灵石/个
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 劳役位置列表 */}
                <div className="space-y-4">
                    {prisonSystem.laborSites.map(site => renderLaborSite(site))}
                </div>

                {/* 说明 */}
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                    <h4 className="text-sm font-bold text-blue-300 mb-2">
                        <i className="fa-solid fa-info-circle mr-1"></i>
                        劳役系统说明
                    </h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• 每个劳役点最多可同时安排2名囚犯工作</li>
                        <li>• 囚犯健康值必须大于30%才能参与劳役</li>
                        <li>• 劳役使用真实时间计时，可选择30分钟到8小时不等</li>
                        <li>• 完成后可获得2种随机材料（矿石或草药），每种25-50个</li>
                        <li>• 材料的名称、稀有度和描述由AI生成</li>
                        <li>• 劳役会消耗囚犯10-30点健康值，但会获得50-150经验</li>
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ornate-border bg-stone-900 w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-300 font-serif flex items-center gap-2">
                            <i className="fa-solid fa-dungeon"></i>
                            镇狱大牢
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            囚犯: {prisonSystem.stats.totalPrisoners}/{prisonSystem.config.maxPrisoners} |
                            安全等级: {prisonSystem.config.securityLevel}/10
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-amber-300 hover:text-white transition-colors"
                    >
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Left Sidebar: Areas */}
                    <div className="w-48 bg-black/20 border-r border-stone-700 flex-shrink-0">
                        <div className="p-4">
                            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">区域</h3>
                            <div className="space-y-1">
                                {areas.map(area => {
                                    const color = getAreaColor(area);
                                    const isActive = selectedArea === area;
                                    const prisonerCount = getPrisonersInArea(area).length;

                                    return (
                                        <button
                                            key={area}
                                            onClick={() => setSelectedArea(area)}
                                            className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${isActive
                                                ? `bg-${color}-500/20 text-${color}-300 border border-${color}-500/50`
                                                : 'text-gray-400 hover:bg-stone-700/50'
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <i className={`fa-solid ${getAreaIcon(area)}`}></i>
                                                {area}
                                            </span>
                                            {area !== '管理区' && (
                                                <span className="text-xs bg-black/30 px-2 py-1 rounded">
                                                    {prisonerCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Content */}
                    <div className="flex-grow overflow-y-auto p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <i className={`fa-solid ${getAreaIcon(selectedArea)}`}></i>
                                {selectedArea}
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {selectedArea === '居住区' && '囚犯的日常居住区域，按危险程度分配不同牢房'}
                                {selectedArea === '审讯区' && '对囚犯进行审讯和刑罚执行的地方'}
                                {selectedArea === '娱乐区' && '囚犯的休闲和思想改造区域'}
                                {selectedArea === '劳役区' && '囚犯进行强制劳动的区域'}
                                {selectedArea === '管理区' && '监狱管理和运营中心，查看整体统计'}
                                {selectedArea === '医疗区' && '治疗受伤和生病的囚犯'}
                            </p>
                        </div>

                        {selectedArea === '管理区' ? renderManagementArea() :
                            selectedArea === '劳役区' ? renderLaborArea() :
                                renderPrisonerList(selectedArea)}
                    </div>
                </div>
            </div>

            {/* 角色详情模态框 */}
            {showDetailModal && selectedPrisoner && (
                <CharacterDetail
                    card={selectedPrisoner.character}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedPrisoner(null);
                    }}
                    playerProfile={playerProfile}
                    setPlayerProfile={setPlayerProfile}
                    onViewPet={onViewPet}
                />
            )}

            {/* 囚犯对话模态框 */}
            {showDialogueModal && dialoguePrisoner && (
                <PrisonerDialogueModal
                    isOpen={showDialogueModal}
                    onClose={() => {
                        setShowDialogueModal(false);
                        setDialoguePrisoner(null);
                    }}
                    prisoner={dialoguePrisoner}
                    playerSpiritStones={playerProfile?.spiritStones || 0}
                    onDialogueComplete={(result) => {
                        if (onDialogueComplete && dialoguePrisoner) {
                            onDialogueComplete(dialoguePrisoner, result);
                        }
                    }}
                    onGenerateResponse={async (prisoner, option) => {
                        if (onGenerateDialogueResponse) {
                            return await onGenerateDialogueResponse(prisoner, option);
                        }
                        // 默认回应
                        const defaultResponses: Record<string, string[]> = {
                            '威胁': [
                                '哼，你以为这样就能让我屈服吗？',
                                '我...我不会说的...',
                                '你们这些人，迟早会遭报应的！'
                            ],
                            '劝说': [
                                '你说的...或许有些道理...',
                                '我需要时间考虑...',
                                '你真的能保证吗？'
                            ],
                            '交易': [
                                '这个条件...让我想想...',
                                '你能给我什么保证？',
                                '也许我们可以谈谈...'
                            ],
                            '套话': [
                                '你想知道什么？',
                                '我不知道你在说什么...',
                                '这个...我不太清楚...'
                            ],
                            '闲聊': [
                                '难得有人愿意和我说话...',
                                '外面的世界...还好吗？',
                                '你为什么要来这里？'
                            ],
                            '恩惠': [
                                '你...为什么要帮我？',
                                '谢谢你...',
                                '我不知道该说什么...'
                            ],
                            '羞辱': [
                                '你！你会后悔的！',
                                '...',
                                '我不会忘记这一切的...'
                            ]
                        };
                        const responses = defaultResponses[option.type] || ['...'];
                        return responses[Math.floor(Math.random() * responses.length)];
                    }}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default PrisonModal;