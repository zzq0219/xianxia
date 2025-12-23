import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CharacterSelectionModal } from './components/CharacterSelectionModal';
import { CharacterStatusModal } from './components/CharacterStatusModal';
import EtiquetteHallModal from './components/EtiquetteHallModal';
import { StartScreen } from './components/StartScreen';
import { CARD_SELL_PRICES, CHARACTER_POOL, EQUIPMENT_POOL, exampleBountyTarget, examplePatient, femaleChar, initialGameState, maleChar, POSITIONS } from './constants';
import { Announcement, ArenaRank, BattleState, BountyTarget, CharacterCard, EventChoice, GameState, LaborWorker, MedicalRecord, MemoryCategory, MemoryEntry, ModalType, Patient, PetCard, PlayerProfile, PrisonArea, Prisoner, PrisonerStatus, RandomEvent, Rarity, SaveSlot, Shop, SummarySettings, SummaryType, ViewMode } from './types';
import { EtiquetteDesigner, EtiquetteSystem } from './types/etiquette';
// import { generateExplorationStep, processCombatTurn, generateRandomEvent, generateAnnouncements } from './services/geminiService';
import ActionNarrator from './components/ActionNarrator';
import ActionPanel from './components/ActionPanel';
import AnnouncementModal from './components/AnnouncementModal';
import AnnouncementTicker from './components/AnnouncementTicker';
import ArenaResultModal from './components/ArenaResultModal';
import BattleActionPanel from './components/BattleActionPanel';
import Battlefield from './components/Battlefield';
import BattleResultModal from './components/BattleResultModal';
import { HomeDashboard } from './components/HomeDashboard';
import Inventory from './components/Inventory';
import { NavigationDock } from './components/NavigationDock';
// import { BottomBar } from './components/BottomBar';
import BountyBoardModal from './components/BountyBoardModal';
import BountyResultModal from './components/BountyResultModal';
import BusinessModal from './components/BusinessModal';
import ChallengeModal from './components/ChallengeModal';
import CharacterDetail from './components/CharacterDetail';
import CombatLog from './components/CombatLog';
import { CultivationModal } from './components/CultivationModal';
import { GauntletAnnouncementModal } from './components/gauntlet/GauntletAnnouncementModal';
import { GauntletHallModal } from './components/gauntlet/GauntletHallModal';
import { GauntletLiveModal } from './components/gauntlet/GauntletLiveModal';
import { GauntletRegistrationModal } from './components/gauntlet/GauntletRegistrationModal';
import HospitalModal from './components/HospitalModal';
// 大闯关服务
import InteractionModal from './components/InteractionModal';
import InterrogationModal from './components/InterrogationModal';
import MapModalEnhanced from './components/MapModal.Enhanced';
import MedicalRecordModal from './components/MedicalRecordModal';
import MemoryModal from './components/MemoryModal';
import Modal from './components/Modal';
import PersonalInfoPanel from './components/PersonalInfoPanel';
import PetDetail from './components/PetDetail';
import PreBattleModal from './components/PreBattleModal';
import PrisonModal from './components/PrisonModal';
import QuestLogModal from './components/QuestLogModal';
import RandomEventModal from './components/RandomEventModal';
import ReputationModal from './components/ReputationModal';
import SaveLoadModal from './components/SaveLoadModal';
import StoryDisplay from './components/StoryDisplay';
import SurveillanceModal from './components/SurveillanceModal';
import TelepathyModal from './components/TelepathyModal';
import TopStatusBar from './components/TopStatusBar';
import { useIframeHeightSync } from './hooks/useIframeHeightSync';
import { aiMessageCapture } from './services/aiMessageCapture';
import {
    cancelPlayerRegistration,
    checkAndAdvanceEventStatus,
    createNewEvent,
    registerPlayerContestant,
    setChallengeDrafts,
    updateChallenge
} from './services/gauntlet';
import { gauntletAIService } from './services/gauntlet/gauntletAIService';
import * as questService from './services/questService';
import { rerankerService } from './services/rerankerService';
import { storageService } from './services/storageService';
import { generateAnnouncements, generateBountyLog, generateBountyTarget, generateBusinessEvent, generateCultivationMonitoringText, generateCultivationResult, generateExplorationStep, generateLaborResult, generateMemorySummary, generatePatient, generateRandomEvent, generateReputationStory, processCombatTurn, updateCharacterRelationship } from './services/tavernService';
import { calculateBusinessIncome, calculateTotalAttributes } from './services/utils';
import { vectorService } from './services/vectorService';
import { DialogueType } from './types';

// 囚犯对话默认响应
const getDefaultResponse = (dialogueType: DialogueType, submissionLevel: number): string => {
    const responses: Record<DialogueType, { low: string[]; mid: string[]; high: string[] }> = {
        '威胁': {
            low: ['哼，你以为这样就能让我屈服吗？', '我不会说的，你们这些人迟早会遭报应！', '有本事就杀了我！'],
            mid: ['我...我不会说的...', '你想怎样...', '别...别过来...'],
            high: ['求求你...不要...', '我说，我什么都说...', '饶命啊...']
        },
        '劝说': {
            low: ['少来这套！', '你的花言巧语骗不了我！', '哼，虚伪！'],
            mid: ['你说的...或许有些道理...', '我需要时间考虑...', '你真的能保证吗？'],
            high: ['好...我听你的...', '你说得对...', '我愿意配合...']
        },
        '交易': {
            low: ['你以为我会为了这点好处出卖自己？', '免谈！', '你太小看我了！'],
            mid: ['这个条件...让我想想...', '你能给我什么保证？', '也许我们可以谈谈...'],
            high: ['成交...', '我接受...', '只要你说话算数...']
        },
        '套话': {
            low: ['你想套我的话？做梦！', '我什么都不知道！', '别费心思了！'],
            mid: ['你想知道什么？', '我不太清楚...', '这个...我不能说...'],
            high: ['其实...我知道一些事...', '我告诉你...', '你想知道的是...']
        },
        '闲聊': {
            low: ['我没兴趣和你说话！', '滚！', '别烦我！'],
            mid: ['难得有人愿意和我说话...', '外面的世界...还好吗？', '你为什么要来这里？'],
            high: ['谢谢你愿意和我聊天...', '能和你说说话真好...', '你是个好人...']
        },
        '恩惠': {
            low: ['我不需要你的施舍！', '你想收买我？', '别以为这样我就会感激你！'],
            mid: ['你...为什么要帮我？', '谢谢你...', '我不知道该说什么...'],
            high: ['太感谢了...', '你真是太好了...', '我会记住你的恩情...']
        },
        '羞辱': {
            low: ['你！你会后悔的！', '我不会忘记这一切的！', '总有一天我会报仇！'],
            mid: ['...', '为什么...', '够了...'],
            high: ['是...我错了...', '请原谅我...', '我不敢了...']
        }
    };

    const typeResponses = responses[dialogueType] || responses['闲聊'];
    let levelResponses: string[];

    if (submissionLevel >= 70) {
        levelResponses = typeResponses.high;
    } else if (submissionLevel >= 40) {
        levelResponses = typeResponses.mid;
    } else {
        levelResponses = typeResponses.low;
    }

    return levelResponses[Math.floor(Math.random() * levelResponses.length)];
};

type CombatAnimation = {
    key: number;
    effect: 'slash' | 'fire' | 'heal' | 'shield' | 'default';
    attacker: 'player' | 'opponent';
}

const FavorabilityBar: React.FC<{ favorability: number }> = ({ favorability }) => {
    const percentage = ((favorability + 100) / 200) * 100;
    const color = favorability > 50 ? 'bg-green-500' : favorability > -50 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="w-full bg-stone-700 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const RelationshipModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    playerProfile: PlayerProfile;
}> = ({ isOpen, onClose, playerProfile }) => {
    const [activeTab, setActiveTab] = useState<'熟人' | '陌生人'>('熟人');

    if (!isOpen) return null;

    const filteredRelationships = playerProfile.relationships.filter(
        rel => rel.relationshipStatus === activeTab
    );

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full max-w-2xl h-auto max-h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                    <h2 className="text-2xl font-bold text-gradient-gold text-shadow-glow font-serif">人际关系</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700">
                    <button onClick={() => setActiveTab('熟人')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === '熟人' ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>熟人</button>
                    <button onClick={() => setActiveTab('陌生人')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === '陌生人' ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>陌生人</button>
                </div>
                <div className="flex-grow overflow-y-auto scrollbar-xianxia p-6 space-y-4">
                    {filteredRelationships.length > 0 ? (
                        filteredRelationships.map(rel => (
                            <div key={rel.id} className="glass-morphism p-4 rounded-lg border border-stone-700/50 hover:border-xianxia-gold-500/50 transition-all duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white font-serif">{rel.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {rel.relationshipTags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-stone-700 text-xs text-gray-300 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">好感度</p>
                                        <p className="font-mono text-lg text-white">{rel.favorability}</p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <FavorabilityBar favorability={rel.favorability} />
                                </div>
                                <p className="text-sm text-gray-300 mt-3 italic">"{rel.description}"</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 pt-10">
                            <p className="text-4xl mb-4">🌪️</p>
                            <p>此分类下暂无人物。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    useIframeHeightSync(); // 激活 Iframe 高度同步
    const appRef = useRef<HTMLDivElement>(null);
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.HOME); // New ViewMode state
    const [isGameReady, setIsGameReady] = useState(false); // 状态，用于标记游戏是否已从酒馆加载完毕
    const [showStartScreen, setShowStartScreen] = useState(true); // 控制是否显示启动封面
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);
    const [isCombatLogVisible, setIsCombatLogVisible] = useState<boolean>(false);
    const [currentTurnDescriptions, setCurrentTurnDescriptions] = useState<string[]>([]);
    const [combatAnimation, setCombatAnimation] = useState<CombatAnimation | null>(null);
    const [lastHit, setLastHit] = useState<'player' | 'opponent' | null>(null);
    const [pendingBattle, setPendingBattle] = useState<BattleState | null>(null);
    const [isPreBattleModalOpen, setIsPreBattleModalOpen] = useState<boolean>(false);
    const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
    const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState<boolean>(false);
    const [isInteractionModalOpen, setIsInteractionModalOpen] = useState<boolean>(false);
    const [randomEvent, setRandomEvent] = useState<RandomEvent | null>(null);
    const [eventResultText, setEventResultText] = useState<string | null>(null);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
    const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState<boolean>(false);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState<boolean>(false);
    const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState<boolean>(false);
    const [isTelepathyModalOpen, setIsTelepathyModalOpen] = useState<boolean>(false);
    const [isReputationModalOpen, setIsReputationModalOpen] = useState<boolean>(false);
    const [isReputationLoading, setIsReputationLoading] = useState<boolean>(false);
    const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState<boolean>(false);
    const [isQuestLogModalOpen, setIsQuestLogModalOpen] = useState<boolean>(false);
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState<boolean>(false);
    const [surveillanceTarget, setSurveillanceTarget] = useState<Shop | null>(null);
    const [isHospitalModalOpen, setIsHospitalModalOpen] = useState<boolean>(false);
    const [consultationPatient, setConsultationPatient] = useState<Patient | null>(null);
    const [consultationStory, setConsultationStory] = useState<string>('');
    const [consultationChoices, setConsultationChoices] = useState<string[]>([]);
    const [isMedicalRecordOpen, setIsMedicalRecordOpen] = useState<boolean>(false);
    const [isBountyBoardOpen, setIsBountyBoardOpen] = useState<boolean>(false);
    const [viewingBountyTarget, setViewingBountyTarget] = useState<CharacterCard | null>(null);
    const [claimingBounty, setClaimingBounty] = useState<BountyTarget | null>(null);
    const [viewingPatientRecord, setViewingPatientRecord] = useState<MedicalRecord | null>(null);
    const [arenaResult, setArenaResult] = useState<{ oldRank: ArenaRank; newRank: ArenaRank; pointsChange: number; victory: boolean; } | null>(null);
    const [announcementsLoaded, setAnnouncementsLoaded] = useState<boolean>(false);
    const [isCultivationModalOpen, setIsCultivationModalOpen] = useState<boolean>(false);
    const [viewingPet, setViewingPet] = useState<PetCard | null>(null);
    const [isMemoryModalOpen, setIsMemoryModalOpen] = useState<boolean>(false);
    const [isCharacterStatusModalOpen, setIsCharacterStatusModalOpen] = useState<boolean>(false);
    const [isVectorSettingsOpen, setIsVectorSettingsOpen] = useState<boolean>(false);
    const [isSemanticSearchOpen, setIsSemanticSearchOpen] = useState<boolean>(false);
    const [isPrisonModalOpen, setIsPrisonModalOpen] = useState<boolean>(false);
    const [isInterrogationModalOpen, setIsInterrogationModalOpen] = useState<boolean>(false);
    const [selectedPrisonerForInterrogation, setSelectedPrisonerForInterrogation] = useState<Prisoner | null>(null);
    const [interrogationLog, setInterrogationLog] = useState<string>('');
    const [isEtiquetteHallOpen, setIsEtiquetteHallOpen] = useState<boolean>(false);
    const [isGauntletHallOpen, setIsGauntletHallOpen] = useState<boolean>(false);
    const [isGauntletAnnouncementOpen, setIsGauntletAnnouncementOpen] = useState<boolean>(false);
    const [isGauntletRegistrationOpen, setIsGauntletRegistrationOpen] = useState<boolean>(false);
    const [isGauntletLiveOpen, setIsGauntletLiveOpen] = useState<boolean>(false);
    const [characterSelection, setCharacterSelection] = useState<{
        isOpen: boolean;
        title: string;
        list: (CharacterCard | PetCard)[];
        onSelect: (card: CharacterCard | PetCard) => void;
    }>({ isOpen: false, title: '', list: [], onSelect: () => { } });

    const storyEndRef = useRef<HTMLDivElement>(null);

    // 初始化AI消息捕获服务
    useEffect(() => {
        console.log('[App] 初始化AI消息捕获服务...');

        // 设置消息接收回调，自动保存到记忆系统
        aiMessageCapture.setMessageCallback((message, category) => {
            console.log(`[App] 捕获到AI消息，类别: ${category}`, message);

            // 提取标题（使用内容的前30个字符）
            const title = message.content.length > 30
                ? message.content.substring(0, 30) + '...'
                : message.content;

            // 保存到记忆系统
            addMemory(
                category,
                `AI生成: ${title}`,
                message.content,
                [] // 可以从content中提取涉及的角色
            );
        });

        // 尝试注册SillyTavern事件监听器
        try {
            aiMessageCapture.registerEventListeners();
            console.log('[App] AI消息捕获服务初始化成功');
        } catch (error) {
            console.warn('[App] AI消息捕获服务初始化失败（可能不在SillyTavern环境中）:', error);
        }

        // 清理函数
        return () => {
            aiMessageCapture.cleanup();
        };
    }, []); // 只在组件挂载时执行一次

    // 游戏加载时初始化
    useEffect(() => {
        setIsGameReady(true);

        // Initialize business district if it doesn't exist
        if (!gameState.playerProfile.businessDistrict) {
            setGameState(prevState => ({
                ...prevState,
                playerProfile: {
                    ...prevState.playerProfile,
                    businessDistrict: {
                        name: '七情六欲坊',
                        level: 1,
                        shops: [{ id: 'shop_brothel_1', type: '青楼', level: 1, staff: [] }],
                        log: [{ timestamp: '初始', message: '你获得了"七情六欲坊"的初始地契，并开设了第一家青楼。' }]
                    }
                }
            }));
        }

        // Initialize prison system if it doesn't exist (for old saves)
        if (!gameState.prisonSystem) {
            setGameState(prevState => ({
                ...prevState,
                prisonSystem: {
                    prisoners: [],
                    guards: [],
                    facilities: [],

                    // 新劳役系统
                    laborSites: [
                        {
                            id: 'mine-01',
                            type: '矿山',
                            name: '青蛇矿脉',
                            description: '宗门后山的灵石矿脉',
                            maxWorkers: 2,
                            workers: []
                        },
                        {
                            id: 'herb-01',
                            type: '采药',
                            name: '灵药园',
                            description: '宗门的药材种植园',
                            maxWorkers: 2,
                            workers: []
                        }
                    ],
                    materialInventory: [],

                    // 保留旧系统
                    laborTasks: [],
                    laborRecords: [],

                    events: [],
                    ransomOffers: [],
                    stats: {
                        totalPrisoners: 0,
                        byArea: {
                            '居住区': 0,
                            '审讯区': 0,
                            '娱乐区': 0,
                            '劳役区': 0,
                            '管理区': 0,
                            '医疗区': 0
                        },
                        byCellType: {
                            '普通牢房': 0,
                            '重犯牢房': 0,
                            '单独囚室': 0
                        },
                        avgSubmission: 0,
                        avgLoyalty: 0,
                        avgHealth: 0,
                        totalGuards: 5,
                        escapeAttempts: 0,
                        successfulEscapes: 0,
                        totalRevenue: 0,
                        totalExpenses: 0,
                        netProfit: 0
                    },
                    config: {
                        maxPrisoners: 50,
                        dailyFoodCost: 10,
                        securityLevel: 5,
                        enableAutoInterrogation: false,
                        enableAutoLabor: false
                    }
                }
            }));
        }

        // Initialize prison memory category if it doesn't exist
        if (!gameState.memories['大牢']) {
            setGameState(prevState => ({
                ...prevState,
                memories: {
                    ...prevState.memories,
                    '大牢': []
                },
                memorySummaries: {
                    ...prevState.memorySummaries,
                    '大牢': { small: [], large: [] }
                }
            }));
        }
    }, []);

    // 定期检查育灵仓状态，将完成的培育自动标记为Ready
    useEffect(() => {
        const checkCultivationStatus = () => {
            setGameState(prevState => {
                const now = Date.now();
                let hasUpdate = false;
                const newPavilion = prevState.cultivationPavilion.map(slot => {
                    if (slot.status === 'Breeding' && slot.endTime > 0 && now >= slot.endTime) {
                        hasUpdate = true;
                        console.log(`[育灵仓] 培育仓 #${slot.slotId} 已完成，状态更新为 Ready`);
                        // 创建新对象，确保引用改变触发重渲染
                        return {
                            ...slot,
                            status: 'Ready' as const,
                            monitoringLog: [
                                { timestamp: '培育完成', message: '灵胎已成熟，可以开启查看结果。' },
                                ...slot.monitoringLog
                            ]
                        };
                    }
                    return slot;
                });

                if (hasUpdate) {
                    console.log('[育灵仓] 状态已更新，触发重渲染');
                    return { ...prevState, cultivationPavilion: newPavilion };
                }
                return prevState;
            });
        };

        // 每秒检查一次
        const interval = setInterval(checkCultivationStatus, 1000);

        // 立即执行一次检查
        checkCultivationStatus();

        return () => clearInterval(interval);
    }, []);

    // Generate initial patients and bounty
    useEffect(() => {
        if (gameState.hospitalPatients.length === 0) {
            setGameState(prevState => ({
                ...prevState,
                hospitalPatients: [{
                    id: examplePatient.patientId,
                    medicalRecord: examplePatient,
                    status: '待诊',
                }],
            }));
        }
        if (gameState.bountyBoard.length === 0) {
            setGameState(prevState => ({
                ...prevState,
                bountyBoard: [{
                    ...exampleBountyTarget,
                    id: `bounty-example-01`,
                    status: '悬赏中' as const,
                }],
            }));
        }
    }, []);

    const handleNextDay = async () => {
        // Business income and event logic
        if (gameState.playerProfile.businessDistrict) {
            const income = calculateBusinessIncome(gameState.playerProfile);
            let eventMessage = '';
            let incomeChange = 0;

            // Update time first
            const currentTime = gameState.exploration.time;
            const dayMatch = currentTime.match(/第(\d+)天/);
            const currentDay = dayMatch ? parseInt(dayMatch[1], 10) : 1;
            const newTime = `第${currentDay + 1}天，清晨`;

            // 30% chance to trigger an AI event
            if (Math.random() < 0.3) {
                try {
                    const event = await generateBusinessEvent(gameState.playerProfile.businessDistrict, gameState.playerProfile.cardCollection);
                    eventMessage = event.message;
                    incomeChange = event.incomeChange;
                } catch (e) {
                    console.error("Failed to generate business event:", e);
                    eventMessage = "今天风平浪静，无事发生。";
                }
            } else {
                eventMessage = "今天风平浪静，无事发生。";
            }

            const totalIncome = income + incomeChange;

            setGameState(prevState => {
                if (!prevState.playerProfile.businessDistrict) return prevState;

                const newLog = [
                    { timestamp: newTime, message: `结算日：总收入 ${totalIncome} 灵石。${eventMessage}` },
                    ...prevState.playerProfile.businessDistrict.log
                ].slice(0, 50); // Keep last 50 logs

                return {
                    ...prevState,
                    exploration: {
                        ...prevState.exploration,
                        time: newTime,
                    },
                    playerProfile: {
                        ...prevState.playerProfile,
                        spiritStones: prevState.playerProfile.spiritStones + totalIncome,
                        businessDistrict: {
                            ...prevState.playerProfile.businessDistrict,
                            log: newLog,
                        }
                    }
                };
            });

            // 记录商业活动记忆
            if (gameState.playerProfile.businessDistrict && (eventMessage || totalIncome > 0)) {
                addMemory(
                    '商业',
                    `${newTime}的经营日报`,
                    `总收入：${totalIncome} 灵石\n${eventMessage}`
                );
            }
        }

        // Bounty board refresh logic
        if (Math.random() < 0.5) { // 50% chance to generate a new bounty each day
            try {
                const newBounty = await generateBountyTarget();
                setGameState(prevState => ({
                    ...prevState,
                    bountyBoard: [
                        ...prevState.bountyBoard,
                        { ...newBounty, id: `bounty-${Date.now()}`, status: '悬赏中' as const }
                    ].slice(-10) // Keep last 10 bounties
                }));
            } catch (e) {
                console.error("Failed to generate bounty target:", e);
            }
        }
    };

    const handleRefreshPatients = async () => {
        setIsLoading(true);
        try {
            // 生成新病患：2男2女，确保性别均衡
            const newPatients = await Promise.all([
                generatePatient('Female'),
                generatePatient('Female'),
                generatePatient('Male'),
                generatePatient('Male'),
            ]);
            const patientsWithIds = newPatients.map(record => ({
                id: record.patientId,
                medicalRecord: record,
                status: '待诊' as const,
            }));

            setGameState(prevState => {
                // 保留"治疗中"的病患，替换其他状态的病患
                const patientsInTreatment = prevState.hospitalPatients.filter(p => p.status === '治疗中');
                return {
                    ...prevState,
                    hospitalPatients: [...patientsInTreatment, ...patientsWithIds],
                };
            });
        } catch (e) {
            console.error("Failed to refresh patients:", e);
            setError("刷新病人列表失败。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPatient = async (gender: 'Male' | 'Female') => {
        setIsLoading(true);
        try {
            const newPatient = await generatePatient(gender);
            setGameState(prevState => ({
                ...prevState,
                hospitalPatients: [
                    ...prevState.hospitalPatients,
                    {
                        id: newPatient.patientId,
                        medicalRecord: newPatient,
                        status: '待诊' as const,
                    }
                ].slice(-10) // Keep last 10 patients
            }));
        } catch (e) {
            console.error("Failed to add patient:", e);
            setError("添加病人失败。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshBountyBoard = async () => {
        setIsLoading(true);
        try {
            const newBounties = await Promise.all([
                generateBountyTarget(),
                generateBountyTarget(),
                generateBountyTarget(),
            ]);
            setGameState(prevState => ({
                ...prevState,
                bountyBoard: newBounties.map(bounty => ({
                    ...bounty,
                    id: `bounty-${Date.now()}-${Math.random()}`,
                    status: '悬赏中' as const,
                })).slice(-10)
            }));
        } catch (e) {
            console.error("Failed to refresh bounty board:", e);
            setError("刷新悬赏榜失败。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBountyTarget = async (gender: 'Male' | 'Female') => {
        setIsLoading(true);
        try {
            const newBounty = await generateBountyTarget(gender);
            setGameState(prevState => ({
                ...prevState,
                bountyBoard: [
                    ...prevState.bountyBoard,
                    { ...newBounty, id: `bounty-${Date.now()}`, status: '悬赏中' as const }
                ].slice(-10) // Keep last 10 bounties
            }));
        } catch (e) {
            console.error("Failed to add bounty target:", e);
            setError("添加悬赏目标失败。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartConsultation = (patientId: string) => {
        const patient = gameState.hospitalPatients.find(p => p.id === patientId);
        if (patient) {
            setConsultationPatient(patient);

            // 如果有保存的问诊进度，恢复它
            if (patient.consultationStory && patient.consultationChoices) {
                setConsultationStory(patient.consultationStory);
                setConsultationChoices(patient.consultationChoices);
            } else {
                // 首次开始问诊，初始化故事和选项
                const initialStory = `你坐在问诊室内，面前的病人是【${patient.medicalRecord.name}】。\n\n${patient.medicalRecord.background}\n\n你清了清嗓子，准备开始今天的问诊。`;
                setConsultationStory(initialStory);
                setConsultationChoices(['询问病症详情', '进行身体检查', '安抚病患情绪', '开具诊疗方案']);

                // 更新病患状态为"治疗中"并保存初始故事
                setGameState(prevState => ({
                    ...prevState,
                    hospitalPatients: prevState.hospitalPatients.map(p =>
                        p.id === patientId ? {
                            ...p,
                            status: '治疗中' as const,
                            consultationStory: initialStory,
                            consultationChoices: ['询问病症详情', '进行身体检查', '安抚病患情绪', '开具诊疗方案']
                        } : p
                    )
                }));
            }

            // 不关闭医馆模态框，让诊疗室在医馆内部显示
            // setIsHospitalModalOpen(false); // 已注释掉，保持医馆打开
        }
    };

    const handleConsultationAction = async (action: string) => {
        if (!consultationPatient) return;

        setIsLoading(true);
        const fullStory = `${consultationStory}\n\n> ${action}`;
        const context = `你正在为【${consultationPatient.medicalRecord.name}】诊断【${consultationPatient.medicalRecord.illnessDescription}】。`;

        try {
            const result = await generateExplorationStep(`${context}\n${fullStory}`, action, gameState.playerProfile, gameState);
            const newStory = `${fullStory}\n\n${result.story}`;
            // 确保 choices 始终是一个数组，如果 AI 返回 undefined 或 null，使用默认选项
            const newChoices = result.choices && Array.isArray(result.choices) && result.choices.length > 0
                ? result.choices
                : ['继续问诊', '检查病情', '开具处方', '结束诊疗'];

            setConsultationStory(newStory);
            setConsultationChoices(newChoices);

            // 保存问诊进度到患者记录
            setGameState(prevState => ({
                ...prevState,
                hospitalPatients: prevState.hospitalPatients.map(p =>
                    p.id === consultationPatient.id ? {
                        ...p,
                        consultationStory: newStory,
                        consultationChoices: newChoices
                    } : p
                )
            }));
        } catch (err) {
            console.error(err);
            setError('AI响应错误，请稍后再试。');
            // 即使出错也要确保 choices 是一个有效数组
            setConsultationChoices(['继续问诊', '检查病情', '开具处方', '结束诊疗']);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndConsultation = () => {
        // 记录问诊记忆
        if (consultationPatient) {
            addMemory(
                '医馆',
                `为${consultationPatient.medicalRecord.name}问诊`,
                consultationStory,
                [consultationPatient.medicalRecord.name]
            );

            // 将病患状态更新为"已治愈"，清除问诊进度
            setGameState(prevState => ({
                ...prevState,
                hospitalPatients: prevState.hospitalPatients.map(p =>
                    p.id === consultationPatient.id ? {
                        ...p,
                        status: '已治愈' as const,
                        consultationStory: undefined,
                        consultationChoices: undefined
                    } : p
                )
            }));
        }
        // 清除问诊状态，返回医馆病患列表
        setConsultationPatient(null);
        setConsultationStory('');
        setConsultationChoices([]);
        // 医馆模态框保持打开状态，会自动显示病患列表
    };

    const handleReturnToHospitalList = () => {
        // 返回医馆列表，保持病患状态为"治疗中"，不清除问诊进度
        setConsultationPatient(null);
        setConsultationStory('');
        setConsultationChoices([]);
        // 医馆模态框保持打开状态，会自动显示病患列表
    };

    const handleViewPatientRecord = (record: MedicalRecord) => {
        setViewingPatientRecord(record);
    };

    const fetchAnnouncements = useCallback(async (refreshType: 'all' | 'sect' | 'adventure' | 'world' = 'all') => {
        setIsAnnouncementsLoading(true);
        try {
            const categories: ('sect' | 'adventure' | 'world')[] = refreshType === 'all' ? ['sect', 'adventure', 'world'] : [refreshType];

            const newAnnouncementsState = { ...gameState.announcements };

            for (const category of categories) {
                const key = category;
                const result = await generateAnnouncements(key, 5, gameState);

                const categoryMap: Record<typeof key, '宗门' | '奇遇' | '世界'> = { sect: '宗门', adventure: '奇遇', world: '世界' };

                const finalResult: Announcement[] = result.map((item, index) => ({
                    ...item,
                    id: `${key}-${Date.now()}-${index}`,
                    category: categoryMap[key],
                }));

                newAnnouncementsState[key] = finalResult;
            }

            setGameState(prevState => ({
                ...prevState,
                announcements: newAnnouncementsState
            }));

            setAnnouncementsLoaded(true); // 标记公告已加载
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        } finally {
            setIsAnnouncementsLoading(false);
        }
    }, [gameState.announcements]);

    // useEffect(() => {
    //     fetchAnnouncements('all');
    // }, []);

    // 更新AI消息捕获的当前场景
    useEffect(() => {
        if (gameState.mode === 'exploration') {
            aiMessageCapture.setCurrentScene('exploration');
            storyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (gameState.mode === 'battle') {
            aiMessageCapture.setCurrentScene('battle');
        }
    }, [gameState.mode]);

    // 根据打开的模态框更新场景
    useEffect(() => {
        if (consultationPatient) {
            aiMessageCapture.setCurrentScene('consultation');
        } else if (isHospitalModalOpen) {
            aiMessageCapture.setCurrentScene('hospital');
        } else if (surveillanceTarget) {
            aiMessageCapture.setCurrentScene('surveillance');
        } else if (isBusinessModalOpen) {
            aiMessageCapture.setCurrentScene('business');
        } else if (isBountyBoardOpen) {
            aiMessageCapture.setCurrentScene('bounty');
        } else if (isCultivationModalOpen) {
            aiMessageCapture.setCurrentScene('cultivation');
        } else if (isMapOpen) {
            aiMessageCapture.setCurrentScene('map');
        } else if (isInteractionModalOpen) {
            aiMessageCapture.setCurrentScene('interaction');
        } else if (isTelepathyModalOpen) {
            aiMessageCapture.setCurrentScene('telepathy');
        } else if (isReputationModalOpen) {
            aiMessageCapture.setCurrentScene('reputation');
        } else if (isAnnouncementModalOpen) {
            aiMessageCapture.setCurrentScene('announcement');
        } else if (activeModal === '竞技场') {
            aiMessageCapture.setCurrentScene('arena');
        } else if (activeModal === '商城') {
            aiMessageCapture.setCurrentScene('shop');
        } else if (gameState.mode === 'exploration') {
            aiMessageCapture.setCurrentScene('exploration');
        }
    }, [
        consultationPatient,
        isHospitalModalOpen,
        isBusinessModalOpen,
        isBountyBoardOpen,
        isCultivationModalOpen,
        isMapOpen,
        isInteractionModalOpen,
        activeModal,
        gameState.mode
    ]);

    useEffect(() => {
        if (gameState.mode === 'exploration') {
            storyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [gameState.exploration.story, gameState.mode]);


    useEffect(() => {
        if (gameState.exploration.pendingChallenge) {
            setIsChallengeModalOpen(true);
        }
    }, [gameState.exploration.pendingChallenge]);

    // Synchronize player party in battle with the master profile
    useEffect(() => {
        if (gameState.mode === 'battle' && gameState.battle) {
            setGameState(prevState => {
                if (!prevState.battle) return prevState;

                const updatedPlayerParty = prevState.battle.playerParty.map(participant => {
                    // FIX: Look in cardCollection for the authoritative card data.
                    const masterCard = prevState.playerProfile.cardCollection.find(c => c.id === participant.card.id);

                    if (masterCard) {
                        const newCalculatedStats = calculateTotalAttributes(masterCard);
                        // The participant might have taken damage, so we preserve the HP percentage.
                        const oldMaxHp = participant.calculatedStats.maxHp;
                        const hpPercentage = oldMaxHp > 0 ? Math.min(1, participant.currentHp / oldMaxHp) : 1;

                        const oldMaxMp = participant.calculatedStats.maxMp;
                        const mpPercentage = oldMaxMp > 0 ? Math.min(1, participant.currentMp / oldMaxMp) : 1;

                        return {
                            ...participant,
                            card: masterCard,
                            calculatedStats: newCalculatedStats,
                            currentHp: Math.max(1, Math.round(newCalculatedStats.maxHp * hpPercentage)),
                            currentMp: Math.round(newCalculatedStats.maxMp * mpPercentage)
                        };
                    }
                    return participant;
                });

                // Avoid unnecessary re-renders if nothing changed.
                if (JSON.stringify(prevState.battle.playerParty) === JSON.stringify(updatedPlayerParty)) {
                    return prevState;
                }

                return {
                    ...prevState,
                    battle: {
                        ...prevState.battle,
                        playerParty: updatedPlayerParty,
                    }
                };
            });
        }
    }, [gameState.playerProfile.cardCollection, gameState.mode]);

    const handleExplorationAction = useCallback(async (action: string) => {
        setIsLoading(true);
        setError(null);

        const fullStoryHistory = gameState.exploration.story;

        try {
            const result = await generateExplorationStep(fullStoryHistory, action, gameState.playerProfile, gameState);

            let storyUpdate = `${gameState.exploration.story}\n\n> ${action}\n\n${result.story}`;
            let battleTriggered = false;
            let newPendingChallenge = null;

            // Check for bounty target encounter
            const activeBounties = gameState.bountyBoard.filter(b => b.status === '悬赏中');
            for (const bounty of activeBounties) {
                // A simple check if the location name is mentioned in the hint
                if (bounty.locationHint.includes(result.location) && Math.random() < 0.25) { // 25% encounter chance
                    storyUpdate += `\n\n**[红尘录]** 你似乎在【${result.location}】感受到了特殊的气息... 一个名号为【${bounty.name}】的悬赏目标出现了！`;

                    const totalAttrs = calculateTotalAttributes(bounty.character);
                    const newBattle: BattleState = {
                        playerParty: [], // Placeholder
                        opponentParty: [{
                            card: bounty.character,
                            currentHp: totalAttrs.maxHp,
                            currentMp: totalAttrs.maxMp,
                            statusEffects: [],
                            calculatedStats: totalAttrs,
                            pet: bounty.character.pet,
                        }],
                        activePlayerCardIndex: 0,
                        activeOpponentCardIndex: 0,
                        turn: 'pre-battle',
                        combatLog: [`遭遇了红尘录目标：${bounty.name}！`],
                        isBattleOver: false,
                        victory: null,
                    };
                    setPendingBattle(newBattle);
                    battleTriggered = true;
                    break; // Only encounter one bounty at a time
                }
            }

            if (result.event?.type === 'battle' && result.opponentParty) {
                const newBattle: BattleState = {
                    playerParty: [], // Placeholder
                    opponentParty: result.opponentParty.map(p => ({ ...p, statusEffects: [], pet: p.card.pet })),
                    activePlayerCardIndex: 0,
                    activeOpponentCardIndex: 0,
                    turn: 'pre-battle',
                    combatLog: [`与 ${result.event.opponentName} 的战斗即将开始！`],
                    isBattleOver: false,
                    victory: null,
                };
                setPendingBattle(newBattle);
                battleTriggered = true;
            }

            if (result.pendingChallenge && result.pendingChallenge.challengerName) {
                newPendingChallenge = result.pendingChallenge;
                storyUpdate += `\n\n[你收到了来自 ${newPendingChallenge.challengerName} 的挑战！]`;
            }

            setGameState(prevState => {
                let newProfile = { ...prevState.playerProfile };
                if (result.relationshipUpdate) {
                    newProfile = updateCharacterRelationship(newProfile, result.relationshipUpdate);
                }
                if (result.newQuest) {
                    // 任务生成频率控制
                    const now = Date.now();
                    const lastTime = newProfile.lastQuestGenerationTime || 0;
                    const cooldownTime = 5 * 60 * 1000; // 5分钟冷却时间
                    const generationProbability = 0.2; // 20% 概率生成任务

                    // 检查冷却时间和随机概率
                    if (now - lastTime >= cooldownTime && Math.random() < generationProbability) {
                        newProfile = questService.addQuest(newProfile, result.newQuest);
                        newProfile.lastQuestGenerationTime = now;
                        console.log('[任务系统] 生成新任务:', result.newQuest.title);
                    } else {
                        console.log('[任务系统] 任务生成被限制 (冷却中或概率未命中)');
                    }
                }
                if (result.questUpdate) {
                    const { questId, objectiveId, progress } = result.questUpdate;
                    const quest = newProfile.quests.find(q => q.id === questId);
                    const objective = quest?.objectives.find(o => o.id === objectiveId);
                    if (objective) {
                        const newProgress = (objective.currentCount || 0) + progress;
                        newProfile = questService.updateObjectiveProgress(newProfile, questId, objectiveId, newProgress);

                        // 检查任务是否所有目标都完成了
                        const updatedQuest = newProfile.quests.find(q => q.id === questId);
                        if (updatedQuest && questService.isQuestCompleted(updatedQuest) && updatedQuest.status === 'In Progress') {
                            newProfile = questService.markQuestClaimable(newProfile, questId);
                            console.log('[任务系统] 任务可领取:', updatedQuest.title);
                        }
                    }
                }
                if (result.reputationUpdate) {
                    newProfile.reputation = {
                        ...newProfile.reputation,
                        score: newProfile.reputation.score + result.reputationUpdate.scoreChange,
                        history: [
                            ...newProfile.reputation.history,
                            {
                                id: `rep-${Date.now()}`,
                                timestamp: result.time || prevState.exploration.time,
                                description: result.reputationUpdate.description,
                                scoreChange: result.reputationUpdate.scoreChange,
                            }
                        ].slice(-20) // Keep last 20 history items
                    };
                }
                return {
                    ...prevState,
                    playerProfile: newProfile,
                    exploration: {
                        ...prevState.exploration,
                        story: storyUpdate,
                        location: result.location || prevState.exploration.location,
                        time: result.time || prevState.exploration.time,
                        choices: result.choices || [],
                        pendingChallenge: newPendingChallenge,
                    }
                };
            });

            // 注释掉手动保存，因为AI消息捕获服务已经自动保存了
            // 记录探索记忆
            // if (!battleTriggered && !newPendingChallenge) {
            //     addMemory('探索', `${result.location}的经历`, result.story);
            // }

            if (battleTriggered && !newPendingChallenge) {
                setCurrentTurnDescriptions([]);
                setIsPreBattleModalOpen(true);
                setIsLoading(false);
                return;
            }

            const shouldTriggerEvent = Math.random() < 0.25;
            if (shouldTriggerEvent && !newPendingChallenge && !battleTriggered) {
                try {
                    const eventData = await generateRandomEvent(result.location, gameState.playerProfile, gameState);
                    setRandomEvent(eventData);
                } catch (err) {
                    console.error("Failed to generate random event:", err);
                }
            }
            setIsLoading(false);

        } catch (err) {
            console.error(err);
            setError('仙界似乎有些不稳定，灵气无法正确响应你的请求。');
            setIsLoading(false);
        }
    }, [gameState.playerProfile, gameState.exploration.story]);

    const handleCombatAction = useCallback(async (action: string) => {
        // 安全检查：确保战斗状态有效
        if (!gameState.battle || gameState.battle.isBattleOver) {
            console.warn('[战斗] 战斗已结束或不存在，无法执行行动');
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentTurnDescriptions([]);

        const battleState = gameState.battle;

        // 安全检查：确保索引有效
        if (!battleState.playerParty || !battleState.opponentParty ||
            battleState.activePlayerCardIndex >= battleState.playerParty.length ||
            battleState.activeOpponentCardIndex >= battleState.opponentParty.length) {
            console.error('[战斗] 战斗数据无效，索引越界');
            setError('战斗数据异常，请重新开始战斗');
            setIsLoading(false);
            return;
        }

        const playerCard = battleState.playerParty[battleState.activePlayerCardIndex];
        const opponentCard = battleState.opponentParty[battleState.activeOpponentCardIndex];

        const getEffectType = (actionName: string): CombatAnimation['effect'] => {
            if (actionName.includes('剑') || actionName.includes('斩')) return 'slash';
            if (actionName.includes('火') || actionName.includes('焰')) return 'fire';
            if (actionName.includes('疗') || actionName.includes('愈')) return 'heal';
            if (actionName.includes('盾') || actionName.includes('御')) return 'shield';
            return 'default';
        };

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        try {
            // 1. AI处理回合，返回结果
            console.log('[战斗] 开始处理AI回合，玩家行动:', action);
            const result = await processCombatTurn(playerCard, opponentCard, action, gameState);

            // 安全检查：确保AI返回了有效结果
            if (!result || typeof result !== 'object') {
                throw new Error('AI返回结果无效');
            }

            // 确保statusEffects字段存在且为数组
            if (!result.playerStatusEffects || !Array.isArray(result.playerStatusEffects)) {
                console.warn('[战斗] AI未返回playerStatusEffects，使用空数组');
                result.playerStatusEffects = [];
            }
            if (!result.opponentStatusEffects || !Array.isArray(result.opponentStatusEffects)) {
                console.warn('[战斗] AI未返回opponentStatusEffects，使用空数组');
                result.opponentStatusEffects = [];
            }

            // 确保数值字段存在且为正确的数字类型
            result.playerHpChange = typeof result.playerHpChange === 'number' ? result.playerHpChange : 0;
            result.opponentHpChange = typeof result.opponentHpChange === 'number' ? result.opponentHpChange : 0;
            result.playerMpChange = typeof result.playerMpChange === 'number' ? result.playerMpChange : 0;
            result.opponentMpChange = typeof result.opponentMpChange === 'number' ? result.opponentMpChange : 0;

            // 确保描述字段存在
            result.playerActionDescription = result.playerActionDescription || '玩家使用了技能进行攻击。';
            result.opponentActionDescription = result.opponentActionDescription || '对手进行了反击。';
            result.playerTurnSummary = result.playerTurnSummary || `【${action.split('_')[0]}】对对手造成了伤害`;
            result.opponentTurnSummary = result.opponentTurnSummary || '【反击】对玩家造成了伤害';

            console.log('[战斗] AI回合处理完成', result);

            // 2. 同时设置两段描述，让ActionNarrator组件逐个显示
            setCurrentTurnDescriptions([result.playerActionDescription, result.opponentActionDescription]);

            // 3. 播放玩家行动画
            setCombatAnimation({ key: Date.now(), effect: getEffectType(action), attacker: 'player' });
            if (result.opponentHpChange < 0) setLastHit('opponent');
            await delay(2000);  // 等待玩家动画和描述显示完成

            // 4. 播放对手行动画
            // 使用可选链操作符防止undefined错误
            const opponentActionName = result.opponentTurnSummary?.match(/\[(.*?)\]/)?.[1] || 'default';
            setCombatAnimation({ key: Date.now() + 1, effect: getEffectType(opponentActionName), attacker: 'opponent' });
            setLastHit(null);
            if (result.playerHpChange < 0) setLastHit('player');
            await delay(1500);

            // 4. 结算最终状态
            const newPlayerHp = playerCard.currentHp + result.playerHpChange;
            const newOpponentHp = opponentCard.currentHp + result.opponentHpChange;
            const newPlayerMp = playerCard.currentMp + result.playerMpChange;
            const newOpponentMp = opponentCard.currentMp + result.opponentMpChange;

            const newLog = [
                ...battleState.combatLog,
                `> ${result.playerTurnSummary}`,
                `> ${result.opponentTurnSummary}`
            ];

            const isPlayerDefeated = newPlayerHp <= 0;
            const isOpponentDefeated = newOpponentHp <= 0;

            let nextPlayerIndex = battleState.activePlayerCardIndex;
            let nextOpponentIndex = battleState.activeOpponentCardIndex;
            let isBattleOver = false;
            let victory: boolean | null = null;

            if (isOpponentDefeated) {
                newLog.push(`${opponentCard.card.name} 已被击败！`);
                if (battleState.activeOpponentCardIndex + 1 >= battleState.opponentParty.length) {
                    isBattleOver = true;
                    victory = true;
                    newLog.push("你获得了胜利！");
                } else {
                    nextOpponentIndex++;
                    newLog.push(`对手派出了 ${battleState.opponentParty[nextOpponentIndex].card.name}！`);
                }
            }

            if (isPlayerDefeated) {
                newLog.push(`${playerCard.card.name} 已被击败！`);
                if (battleState.activePlayerCardIndex + 1 >= battleState.playerParty.length) {
                    isBattleOver = true;
                    victory = false;
                    newLog.push("你被击败了！");
                } else {
                    nextPlayerIndex++;
                    newLog.push(`你派出了 ${battleState.playerParty[nextPlayerIndex].card.name}！`);
                }
            }

            setGameState(prevState => {
                if (!prevState.battle) return prevState;
                const updatedPlayerParty = [...prevState.battle.playerParty];
                const currentPlayerParticipant = updatedPlayerParty[prevState.battle.activePlayerCardIndex];

                // 合并状态效果：保留旧的，追加新的，然后更新持续时间
                const mergedPlayerEffects = [
                    ...currentPlayerParticipant.statusEffects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0),
                    ...result.playerStatusEffects
                ];

                updatedPlayerParty[prevState.battle.activePlayerCardIndex] = {
                    ...currentPlayerParticipant,
                    currentHp: Math.max(0, newPlayerHp),
                    currentMp: Math.max(0, newPlayerMp),
                    statusEffects: mergedPlayerEffects,
                };

                const updatedOpponentParty = [...prevState.battle.opponentParty];
                const currentOpponentParticipant = updatedOpponentParty[prevState.battle.activeOpponentCardIndex];

                // 合并状态效果：保留旧的，追加新的，然后更新持续时间
                const mergedOpponentEffects = [
                    ...currentOpponentParticipant.statusEffects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0),
                    ...result.opponentStatusEffects
                ];

                updatedOpponentParty[prevState.battle.activeOpponentCardIndex] = {
                    ...currentOpponentParticipant,
                    currentHp: Math.max(0, newOpponentHp),
                    currentMp: Math.max(0, newOpponentMp),
                    statusEffects: mergedOpponentEffects,
                };

                return {
                    ...prevState,
                    battle: {
                        ...prevState.battle,
                        playerParty: updatedPlayerParty,
                        opponentParty: updatedOpponentParty,
                        combatLog: newLog,
                        activePlayerCardIndex: nextPlayerIndex,
                        activeOpponentCardIndex: nextOpponentIndex,
                        isBattleOver,
                        victory,
                    }
                };
            });

            // 记录战斗回合记忆
            if (isBattleOver) {
                try {
                    const battleSummary = newLog.slice(-10).join('\n');
                    addMemory(
                        '战斗',
                        victory ? '战斗胜利' : '战斗失败',
                        battleSummary,
                        [playerCard.card.name, opponentCard.card.name]
                    );
                    console.log('[战斗] 战斗记忆已保存');
                } catch (memoryError) {
                    console.error('[战斗] 保存战斗记忆失败:', memoryError);
                    // 不阻断战斗流程，继续执行
                }
            }

            setLastHit(null);

        } catch (err) {
            console.error('[战斗] 处理战斗回合时出错:', err);
            setError('一股神秘的力量扰乱了战场。请稍后重试。');

            // 尝试捕获错误详情
            if (err instanceof Error) {
                console.error('[战斗] 错误详情:', err.message, err.stack);
            }

            // 如果是AI调用失败，尝试记录到aiMessageCapture
            try {
                aiMessageCapture.captureMessage(
                    `战斗出错: ${err instanceof Error ? err.message : '未知错误'}`,
                    'battle'
                );
            } catch (captureError) {
                console.error('[战斗] 捕获错误消息失败:', captureError);
            }
        } finally {
            setIsLoading(false);
        }
    }, [gameState.battle, gameState.exploration.time, gameState.exploration.location]);

    const handleArenaBattleEnd = (victory: boolean) => {
        const oldRank = gameState.playerProfile.arenaRank;
        const pointsChange = victory ? 25 : -15;
        const newPoints = Math.max(0, oldRank.points + pointsChange);

        // This is a simplified tier calculation. A real system would be more complex.
        const getTierFromPoints = (points: number): ArenaRank => {
            if (points >= 5000) return { tier: '王者', division: '', points, tierIcon: '👑' };
            if (points >= 4000) return { tier: '钻石', division: String(5 - Math.floor((points - 4000) / 200)), points, tierIcon: '💎' };
            if (points >= 3000) return { tier: '白金', division: String(5 - Math.floor((points - 3000) / 200)), points, tierIcon: '🛡️' };
            if (points >= 2000) return { tier: '黄金', division: String(5 - Math.floor((points - 2000) / 200)), points, tierIcon: '🌟' };
            if (points >= 1000) return { tier: '白银', division: String(5 - Math.floor((points - 1000) / 200)), points, tierIcon: '🥈' };
            return { tier: '黄铜', division: String(5 - Math.floor(points / 200)), points, tierIcon: '🥉' };
        };

        const newRank = getTierFromPoints(newPoints);

        setArenaResult({ oldRank, newRank, pointsChange, victory });

        setGameState(prevState => {
            const newProfile: PlayerProfile = {
                ...prevState.playerProfile,
                arenaRank: newRank,
            };

            // Update leaderboards
            const newLeaderboards = { ...prevState.leaderboards };
            const totalBoard = newLeaderboards['宗门排行榜']['总榜'];

            const playerEntryIndex = totalBoard.findIndex(e => e.name === newProfile.name);

            if (playerEntryIndex !== -1) {
                totalBoard[playerEntryIndex].points = newRank.points;
            } else {
                // Add player to the board if they have enough points and are not on it
                if (totalBoard.length < 20 || newRank.points > totalBoard[totalBoard.length - 1].points) {
                    totalBoard.push({
                        rank: 0, // temp rank
                        name: newProfile.name,
                        faction: '青蛇宗', // Assuming player's faction
                        points: newRank.points,
                        characterId: 'player', // Special ID for player
                    });
                }
            }

            // Re-sort and re-rank the leaderboard
            totalBoard
                .sort((a, b) => b.points - a.points)
                .forEach((entry, index) => {
                    entry.rank = index + 1;
                });

            // Keep only top 20
            newLeaderboards['宗门排行榜']['总榜'] = totalBoard.slice(0, 20);

            return {
                ...prevState,
                playerProfile: newProfile,
                leaderboards: newLeaderboards,
                mode: 'exploration',
                battle: undefined,
            };
        });

        // 记录竞技场战斗记忆
        if (gameState.battle) {
            const opponent = gameState.battle.opponentParty[0]?.card;
            if (opponent) {
                addMemory(
                    '战斗',
                    `竞技场对战：${victory ? '胜利' : '失败'}`,
                    `在竞技场与【${opponent.name}】展开了激烈的战斗，最终${victory ? '取得了胜利' : '遗憾落败'}。段位积分${pointsChange >= 0 ? '增加' : '减少'}了${Math.abs(pointsChange)}点。`,
                    [opponent.name]
                );
            }
        }
    };

    const returnToExploration = () => {
        if (gameState.battle?.isArenaBattle) {
            handleArenaBattleEnd(gameState.battle.victory ?? false);
            return;
        }

        // 保存战斗数据的引用，避免状态更新后访问undefined
        const battleData = gameState.battle;
        if (!battleData) {
            // 如果战斗数据不存在，直接返回探索模式
            setGameState(prevState => ({
                ...prevState,
                mode: 'exploration',
                battle: undefined,
            }));
            return;
        }

        let storyUpdate = `\n\n 战斗的尘埃落定。`;
        let newBountyBoard = [...gameState.bountyBoard];
        let newCardCollection = [...gameState.playerProfile.cardCollection];

        if (battleData.victory && battleData.opponentParty.length > 0) {
            const opponentCard = battleData.opponentParty[0].card;
            const bountyIndex = newBountyBoard.findIndex(b => b.character.name === opponentCard.name && b.status === '悬赏中');

            if (bountyIndex !== -1) {
                const bounty = newBountyBoard[bountyIndex];
                newBountyBoard[bountyIndex] = { ...bounty, status: '已完成' }; // Changed from '已结束' to '已完成'

                // Add character to collection if not already present
                if (!newCardCollection.some(c => c.name === bounty.character.name)) {
                    newCardCollection.push(bounty.character);
                }

                storyUpdate += `\n\n**[红尘录]** 目标【${bounty.name}】已被你成功狩猎！请前往红尘录查看结果。`;
            }
        }

        setGameState(prevState => ({
            ...prevState,
            mode: 'exploration',
            battle: undefined,
            bountyBoard: newBountyBoard,
            playerProfile: {
                ...prevState.playerProfile,
                cardCollection: newCardCollection,
            },
            exploration: {
                ...prevState.exploration,
                story: prevState.exploration.story + storyUpdate,
                choices: ["继续你的旅程。", "调息疗伤。", "搜查四周。"]
            }
        }));
    };

    const handleFlee = () => {
        // 逃命判定为失败
        if (!gameState.battle) return;

        setGameState(prevState => {
            if (!prevState.battle) return prevState;

            return {
                ...prevState,
                battle: {
                    ...prevState.battle,
                    isBattleOver: true,
                    victory: false,
                    isFled: true, // 标记为逃命
                }
            };
        });

        // 记录逃命记忆
        if (gameState.battle) {
            const opponent = gameState.battle.opponentParty[0]?.card;
            if (opponent) {
                addMemory(
                    '战斗',
                    `逃离战斗`,
                    `面对【${opponent.name}】，你选择了避其锋芒，成功逃离了战斗。`,
                    [opponent.name]
                );
            }
        }
    };

    const startFinalBattle = (playerGender: 'Male' | 'Female', opponentGender: 'Male' | 'Female') => {
        const playerPartySource = playerGender === 'Male'
            ? gameState.playerProfile.maleParty
            : gameState.playerProfile.femaleParty;

        // FIX: Re-fetch cards from cardCollection to ensure they are fresh, in case party arrays have stale data.
        const playerPartyForBattle = playerPartySource.map(partyCard =>
            gameState.playerProfile.cardCollection.find(collectionCard => collectionCard.id === partyCard.id) || partyCard
        );

        // FIX: 修复敌方编队性别问题 - 无论是否有pendingBattle，都要根据opponentGender重新生成敌方编队
        // 从CHARACTER_POOL中筛选对应性别的角色
        const availableOpponentChars = CHARACTER_POOL.filter(c => c.gender === opponentGender);

        // 生成与玩家编队数量相同的敌方角色，全部为指定性别
        const opponentCount = playerPartyForBattle.length;
        const opponentPartyForBattle: CharacterCard[] = [];

        for (let i = 0; i < opponentCount; i++) {
            if (availableOpponentChars.length > 0) {
                // 随机选择一个符合性别的角色
                const randomChar = availableOpponentChars[Math.floor(Math.random() * availableOpponentChars.length)];
                opponentPartyForBattle.push(randomChar);
            } else {
                // 后备方案：使用默认角色
                opponentPartyForBattle.push(opponentGender === 'Male' ? maleChar : femaleChar);
            }
        }

        const opponentName = pendingBattle
            ? (pendingBattle.combatLog[0].match(/与 (.*) 的战斗/)?.[1] || "挑战者")
            : opponentPartyForBattle[0].name;

        const finalOpponentParty = pendingBattle ? pendingBattle.opponentParty : opponentPartyForBattle.map(card => {
            const totalAttrs = calculateTotalAttributes(card);
            return {
                card,
                currentHp: totalAttrs.maxHp,
                currentMp: totalAttrs.maxMp,
                statusEffects: [],
                calculatedStats: totalAttrs,
                pet: card.pet,
            };
        });

        const newBattle: BattleState = {
            playerParty: playerPartyForBattle.map(card => {
                const totalAttrs = calculateTotalAttributes(card);
                return {
                    card,
                    currentHp: totalAttrs.maxHp,
                    currentMp: totalAttrs.maxMp,
                    statusEffects: [],
                    calculatedStats: totalAttrs,
                    pet: card.pet,
                };
            }),
            opponentParty: finalOpponentParty,
            activePlayerCardIndex: 0,
            activeOpponentCardIndex: 0,
            turn: 'player',
            combatLog: [`与 ${opponentName} 的战斗即将开始！`],
            isBattleOver: false,
            victory: null,
        };

        setGameState(prevState => ({
            ...prevState,
            mode: 'battle',
            battle: newBattle,
            exploration: {
                ...prevState.exploration,
                pendingChallenge: null,
            }
        }));
        setPendingBattle(null);
        setIsPreBattleModalOpen(false);
    };

    const handleAcceptChallenge = useCallback(() => {
        setIsChallengeModalOpen(false);
        if (gameState.playerProfile.maleParty.length === 0 && gameState.playerProfile.femaleParty.length === 0) {
            setError("队伍中至少需要一名角色才能进入战斗！");
            setTimeout(() => setError(null), 3000);
            return;
        }
        if (pendingBattle) {
            setCurrentTurnDescriptions([]);
            setIsPreBattleModalOpen(true);
        } else {
            setError("战斗信息丢失，无法开始。");
            setGameState(prevState => ({ ...prevState, exploration: { ...prevState.exploration, pendingChallenge: null } }));
        }
    }, [gameState.playerProfile, pendingBattle]);

    const handleDeclineChallenge = useCallback(() => {
        setIsChallengeModalOpen(false);
        const challengerName = gameState.exploration.pendingChallenge?.challengerName || "对方";
        setGameState(prevState => ({
            ...prevState,
            exploration: {
                ...prevState.exploration,
                story: prevState.exploration.story + `\n\n你思虑再三，决定拒绝 ${challengerName} 的挑战。`,
                choices: ["继续你的旅程。", "检查你的状态。", "寻找一个安全的地方休息。"],
                pendingChallenge: null,
            }
        }));
        setPendingBattle(null);
    }, [gameState.exploration.pendingChallenge, gameState.exploration.story]);

    const openModal = (modal: ModalType) => setActiveModal(modal);
    const closeModal = () => setActiveModal(null);

    const setPlayerProfile = (newProfile: PlayerProfile) => {
        setGameState(prevState => ({
            ...prevState,
            playerProfile: newProfile,
        }));
    };

    const handleTravel = (destination: string) => {
        setIsMapOpen(false);
        handleExplorationAction(`前往 ${destination}。`);
    };

    const handleInitiateInteraction = (action: string) => {
        setIsInteractionModalOpen(false);
        handleExplorationAction(action);
    };

    const handleSave = async (slotId: number, name: string) => {
        const newSaveSlot = {
            name: name,
            timestamp: Date.now(),
            gameState: gameState,
        };
        await storageService.saveToSlot(slotId, newSaveSlot);
        // You might want to refresh the saves list in the modal here
        // For simplicity, we can just close and reopen the modal, or add a refresh button.
    };

    const handleExport = async (slotId: number) => {
        const allSaves = await storageService.getAllSaves();
        const saveData = allSaves[slotId];

        if (!saveData) {
            alert("没有可导出的存档！");
            return;
        }

        const jsonString = JSON.stringify(saveData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${saveData.name.replace(/\s/g, '_')}_${new Date(saveData.timestamp).toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = async (saveSlot: SaveSlot) => {
        const slotIdStr = prompt("请选择要导入到的存档槽位 (1-5):");
        if (!slotIdStr) return;

        const slotId = parseInt(slotIdStr, 10);
        if (isNaN(slotId) || slotId < 1 || slotId > 5) {
            alert("无效的槽位！请输入1到5之间的数字。");
            return;
        }

        try {
            await storageService.saveToSlot(slotId, saveSlot);
            alert(`存档 "${saveSlot.name}" 已成功导入到槽位 ${slotId}！请重新打开菜单查看。`);
            // Close and reopen modal to refresh the list
            setIsSaveLoadModalOpen(false);
        } catch (error) {
            console.error("导入存档时保存失败:", error);
            alert("保存导入的存档时发生错误。");
        }
    };

    const handleLoad = async (slotId: number) => {
        const loadedState = await storageService.loadFromSlot(slotId);
        if (loadedState) {
            setGameState(loadedState);
        }
        setIsSaveLoadModalOpen(false);
    };

    const handleDelete = async (slotId: number) => {
        await storageService.deleteSlot(slotId);
        // The modal will refresh itself after this.
    };

    const handleOpenReputationModal = () => {
        setIsReputationModalOpen(true);
        // No longer automatically refreshing
    };

    const handleRefreshReputation = async () => {
        setIsReputationLoading(true);
        try {
            const details = await generateReputationStory(gameState.playerProfile, gameState);
            setGameState(prevState => ({
                ...prevState,
                playerProfile: {
                    ...prevState.playerProfile,
                    reputation: {
                        ...prevState.playerProfile.reputation,
                        title: details.title,
                        goodDeeds: details.goodDeeds,
                        badDeeds: details.badDeeds,
                        lewdDeeds: details.lewdDeeds,
                    }
                }
            }));
        } catch (err) {
            console.error("Failed to generate reputation details:", err);
        } finally {
            setIsReputationLoading(false);
        }
    };

    const handleAcceptBounty = (bountyId: string, characterId: string) => {
        const bounty = gameState.bountyBoard.find(b => b.id === bountyId);
        if (!bounty) return;

        const rarityTimeMap: Record<Rarity, number> = {
            '凡品': 0.5 * 60 * 60 * 1000, // 30 mins
            '良品': 1 * 60 * 60 * 1000,   // 1 hour
            '优品': 2 * 60 * 60 * 1000,   // 2 hours
            '珍品': 4 * 60 * 60 * 1000,   // 4 hours
            '绝品': 8 * 60 * 60 * 1000,   // 8 hours
            '仙品': 12 * 60 * 60 * 1000,  // 12 hours
            '圣品': 24 * 60 * 60 * 1000,  // 24 hours
            '神品': 48 * 60 * 60 * 1000,  // 48 hours
        };

        const trackingTime = rarityTimeMap[bounty.character.rarity] || rarityTimeMap['凡品'];
        const startTime = Date.now();
        const endTime = startTime + trackingTime;

        setGameState(prevState => ({
            ...prevState,
            bountyBoard: prevState.bountyBoard.map(b =>
                b.id === bountyId
                    ? { ...b, status: '追踪中', trackerId: characterId, startTime, endTime }
                    : b
            ),
        }));
    };

    const handleClaimBounty = async (bountyId: string) => {
        const bounty = gameState.bountyBoard.find(b => b.id === bountyId);
        const tracker = gameState.playerProfile.cardCollection.find(c => c.id === bounty?.trackerId);

        if (!bounty || !tracker) {
            setError("无法找到悬赏或追踪者信息。");
            return;
        }

        setIsLoading(true);
        try {
            const log = await generateBountyLog(tracker, bounty.character, gameState);

            // 创建包含追捕日志的完整悬赏对象
            const updatedBounty = { ...bounty, trackingLog: log };

            setGameState(prevState => ({
                ...prevState,
                bountyBoard: prevState.bountyBoard.map(b =>
                    b.id === bountyId ? updatedBounty : b
                ),
            }));

            // 使用包含日志的完整对象
            setClaimingBounty(updatedBounty);
        } catch (error) {
            console.error("生成悬赏日志失败:", error);
            setError("天机阁传讯失败，无法获取任务报告。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBountyOutcome = (bountyId: string, outcome: 'killed' | 'imprisoned') => {
        setGameState(prevState => {
            const bounty = prevState.bountyBoard.find(b => b.id === bountyId);
            if (!bounty) return prevState;

            // Simple reward logic, can be expanded
            const spiritStoneReward = CARD_SELL_PRICES[bounty.character.rarity] * 10;
            const reputationReward = outcome === 'imprisoned' ? 20 : 5;

            let newPrisonSystem = prevState.prisonSystem;

            // 如果选择押入大牢，创建新囚犯
            if (outcome === 'imprisoned') {
                const newPrisoner: Prisoner = {
                    character: bounty.character,
                    crime: `红尘录悬赏目标 - ${bounty.specialTrait}`,
                    sentence: 365, // 一年刑期
                    remainingDays: 365,
                    submissionLevel: 0,
                    loyaltyLevel: 0,
                    health: 70, // 被捕时可能受伤
                    sanity: 80,
                    location: '居住区',
                    cellType: '重犯牢房',
                    value: {
                        ransom: CARD_SELL_PRICES[bounty.character.rarity] * 5,
                        labor: CARD_SELL_PRICES[bounty.character.rarity] * 2,
                        intelligence: CARD_SELL_PRICES[bounty.character.rarity] * 3,
                    },
                    status: ['受伤'],
                    history: [{
                        id: `interrogation-${Date.now()}`,
                        date: prevState.exploration.time,
                        realTimestamp: Date.now(),
                        method: {
                            id: 'captured',
                            name: '被捕',
                            category: 'basic',
                            description: `从红尘录悬赏任务中被捕获`,
                            damage: 30,
                            intimidation: 50,
                            successRate: 100,
                            submissionIncrease: 0,
                            risks: { death: 0, permanentInjury: 0, insanity: 0 }
                        },
                        duration: 0,
                        result: {
                            success: true,
                            informationGained: `身份：${bounty.character.name}，罪行：${bounty.specialTrait}`,
                            submissionIncrease: 0,
                            healthDecrease: 30,
                        },
                        interrogator: bounty.trackerId ? gameState.playerProfile.cardCollection.find(c => c.id === bounty.trackerId)?.name || '追踪者' : '追踪者',
                    }],
                    knownInformation: [
                        `真实姓名：${bounty.character.name}`,
                        `境界：${bounty.character.realm}`,
                        `悬赏特征：${bounty.specialTrait}`,
                    ],
                    potentialInformation: [
                        '背景势力',
                        '隐藏身份',
                        '同伙信息',
                        '藏匿地点',
                    ],
                    imprisonedDate: prevState.exploration.time,
                    realImprisonedTime: Date.now(),
                };

                // 更新大牢系统
                newPrisonSystem = {
                    ...prevState.prisonSystem,
                    prisoners: [...prevState.prisonSystem.prisoners, newPrisoner],
                    stats: {
                        ...prevState.prisonSystem.stats,
                        totalPrisoners: prevState.prisonSystem.stats.totalPrisoners + 1,
                        byArea: {
                            ...prevState.prisonSystem.stats.byArea,
                            '居住区': prevState.prisonSystem.stats.byArea['居住区'] + 1,
                        },
                        byCellType: {
                            ...prevState.prisonSystem.stats.byCellType,
                            '重犯牢房': prevState.prisonSystem.stats.byCellType['重犯牢房'] + 1,
                        }
                    }
                };
            }

            return {
                ...prevState,
                playerProfile: {
                    ...prevState.playerProfile,
                    spiritStones: prevState.playerProfile.spiritStones + spiritStoneReward,
                    reputation: {
                        ...prevState.playerProfile.reputation,
                        score: prevState.playerProfile.reputation.score + reputationReward,
                    },
                },
                bountyBoard: prevState.bountyBoard.map(b =>
                    b.id === bountyId ? { ...b, status: '已结束', finalOutcome: outcome } : b
                ),
                prisonSystem: newPrisonSystem,
            };
        });

        // 记录悬赏完成记忆
        const bounty = gameState.bountyBoard.find(b => b.id === bountyId);
        if (bounty) {
            const outcomeText = outcome === 'imprisoned'
                ? `成功捕获【${bounty.name}】并押入大牢，可前往大牢进行审讯和管理。`
                : `成功完成对【${bounty.name}】的悬赏任务。`;

            addMemory(
                outcome === 'imprisoned' ? '大牢' : '悬赏',
                `完成悬赏：${bounty.name}`,
                bounty.trackingLog ? `${bounty.trackingLog}\n\n${outcomeText}` : outcomeText,
                [bounty.name]
            );
        }

        setClaimingBounty(null);
    };

    const handleMatchFound = (opponent: CharacterCard) => {
        const totalAttrs = calculateTotalAttributes(opponent);
        const newBattle: BattleState = {
            playerParty: [], // Placeholder
            opponentParty: [{
                card: opponent,
                currentHp: totalAttrs.maxHp,
                currentMp: totalAttrs.maxMp,
                statusEffects: [],
                calculatedStats: totalAttrs,
                pet: opponent.pet,
            }],
            activePlayerCardIndex: 0,
            activeOpponentCardIndex: 0,
            turn: 'pre-battle',
            combatLog: [`与 ${opponent.name} 的竞技场对决即将开始！`],
            isBattleOver: false,
            victory: null,
            isArenaBattle: true,
        };
        setPendingBattle(newBattle);
        setActiveModal(null); // Close the arena modal
        setIsPreBattleModalOpen(true); // Open the pre-battle modal
    };

    const handleRandomEventChoice = (choice: EventChoice) => {
        const { outcome } = choice;
        setEventResultText(outcome.description);

        const processOutcome = () => {
            setGameState(prevState => {
                const newProfile = JSON.parse(JSON.stringify(prevState.playerProfile));
                let storyUpdate = `\n\n[奇遇] ${outcome.description}`;

                switch (outcome.type) {
                    case 'reward_stones':
                        newProfile.spiritStones += outcome.amount;
                        break;
                    case 'lose_stones':
                        newProfile.spiritStones = Math.max(0, newProfile.spiritStones - outcome.amount);
                        break;
                    case 'battle':
                        // FIX: Replaced '上品' with '优品' to match the Rarity type definition.
                        const opponentPool = CHARACTER_POOL.filter(c => c.rarity === '优品' || c.rarity === '珍品');
                        const randomOpponentTemplate = opponentPool[Math.floor(Math.random() * opponentPool.length)];
                        const battleOpponent: CharacterCard = {
                            ...randomOpponentTemplate,
                            id: `rand-${Date.now()}`,
                            name: outcome.opponentName,
                            origin: outcome.opponentDescription,
                        };
                        const totalAttrs = calculateTotalAttributes(battleOpponent);
                        const newBattle: BattleState = {
                            playerParty: [], // Placeholder
                            opponentParty: [{
                                card: battleOpponent,
                                currentHp: totalAttrs.maxHp,
                                currentMp: totalAttrs.maxMp,
                                statusEffects: [],
                                calculatedStats: totalAttrs,
                                pet: battleOpponent.pet,
                            }],
                            activePlayerCardIndex: 0,
                            activeOpponentCardIndex: 0,
                            turn: 'pre-battle',
                            combatLog: [`遭遇了 ${outcome.opponentName}！`],
                            isBattleOver: false,
                            victory: null,
                        };
                        setPendingBattle(newBattle);
                        storyUpdate += `\n\n你遭遇了 ${outcome.opponentName}！`;
                        break;
                    case 'reward_item':
                        const foundItem = EQUIPMENT_POOL.find(e => e.name === outcome.itemName);
                        if (foundItem) {
                            const newItemInstance = { ...foundItem, id: `${foundItem.id}_${Date.now()}_${Math.random()}` };
                            newProfile.equipmentInventory.push(newItemInstance);
                        } else {
                            storyUpdate += "\n但它似乎只是个普通的物件，你随手丢弃了。";
                        }
                        break;
                    case 'nothing':
                        break;
                }

                return {
                    ...prevState,
                    playerProfile: newProfile,
                    exploration: {
                        ...prevState.exploration,
                        story: prevState.exploration.story + storyUpdate,
                    }
                };
            });

            setRandomEvent(null);
            setEventResultText(null);
            if (outcome.type === 'battle') {
                setIsPreBattleModalOpen(true);
            }

            // 记录奇遇记忆
            addMemory('其他', randomEvent.title, `${randomEvent.story}\n\n选择：${choice.text}\n\n${outcome.description}`);
        };

        setTimeout(processOutcome, 2000); // 2s delay
    };

    const handleStartCultivation = (slotId: number, parentAId: string, parentBId: string) => {
        const { cardCollection, petCollection } = gameState.playerProfile;
        const allCards = [...cardCollection, ...petCollection];

        const parentA = allCards.find(c => c.id === parentAId);
        const parentB = allCards.find(c => c.id === parentBId);

        if (!parentA || !parentB) {
            setError("选择的父母卡牌无效。");
            return;
        }

        const rarityTimeMap: Record<Rarity, number> = {
            '凡品': 1 * 60 * 60 * 1000, // 1 hour
            '良品': 2 * 60 * 60 * 1000, // 2 hours
            '优品': 4 * 60 * 60 * 1000, // 4 hours
            '珍品': 8 * 60 * 60 * 1000, // 8 hours
            '绝品': 12 * 60 * 60 * 1000, // 12 hours
            '仙品': 18 * 60 * 60 * 1000, // 18 hours
            '圣品': 24 * 60 * 60 * 1000, // 24 hours
            '神品': 48 * 60 * 60 * 1000, // 48 hours
        };

        const timeA = rarityTimeMap[parentA.rarity];
        const timeB = rarityTimeMap[parentB.rarity];
        const cultivationTime = (timeA + timeB) / 2;

        const startTime = Date.now();
        const endTime = startTime + cultivationTime;

        setGameState(prevState => {
            const newPavilion = prevState.cultivationPavilion.map(slot => {
                if (slot.slotId === slotId) {
                    return {
                        ...slot,
                        parentA: parentA,
                        parentB: parentB,
                        startTime,
                        endTime,
                        status: 'Breeding' as const,
                        monitoringLog: [{ timestamp: '培育开始', message: `能量已注入，${parentA.name} 与 ${parentB.name} 的生命精华开始融合。` }]
                    };
                }
                return slot;
            });
            return { ...prevState, cultivationPavilion: newPavilion };
        });
    };

    const handleClaimCultivation = async (slotId: number) => {
        const slot = gameState.cultivationPavilion.find(s => s.slotId === slotId);
        if (!slot || slot.status !== 'Ready' || !slot.parentA || !slot.parentB) {
            setError("无法领取，培育尚未完成或数据异常。");
            return;
        }

        setIsLoading(true);
        try {
            const newCard = await generateCultivationResult(slot.parentA, slot.parentB);

            setGameState(prevState => {
                const newProfile = { ...prevState.playerProfile };
                if ('skills' in newCard) { // It's a CharacterCard
                    newProfile.cardCollection.push(newCard as CharacterCard);
                } else { // It's a PetCard
                    newProfile.petCollection.push(newCard as PetCard);
                }

                const newPavilion = prevState.cultivationPavilion.map(s => {
                    if (s.slotId === slotId) {
                        return { ...s, parentA: null, parentB: null, startTime: 0, endTime: 0, status: 'Empty' as const, monitoringLog: [] };
                    }
                    return s;
                });

                return { ...prevState, playerProfile: newProfile, cultivationPavilion: newPavilion };
            });

            // Optional: Show a modal with the new card
            alert(`恭喜！你获得了新的卡牌：【${newCard.name}】！`);

            // 记录培育完成记忆
            if (slot.parentA && slot.parentB) {
                addMemory(
                    '培育',
                    `育灵轩培育成功`,
                    `【${slot.parentA.name}】与【${slot.parentB.name}】的灵胎已成熟，诞生了新的生命：【${newCard.name}】！`,
                    [slot.parentA.name, slot.parentB.name, newCard.name]
                );
            }

        } catch (error) {
            console.error("生成后代失败:", error);
            setError("开启灵胎失败，似乎有一股神秘力量阻止了新生命的诞生。");
        } finally {
            setIsLoading(false);
        }
    };

    // 劳役系统处理函数
    const handleAssignLabor = useCallback((prisonerId: string, siteId: string, duration: number) => {
        const prisoner = gameState.prisonSystem.prisoners.find(p => p.character.id === prisonerId);
        const site = gameState.prisonSystem.laborSites.find(s => s.id === siteId);

        if (!prisoner || !site) {
            setError('找不到囚犯或劳役地点');
            return;
        }

        // 检查工位是否已满
        if (site.workers.length >= site.maxWorkers) {
            setError(`${site.name}的工位已满（${site.maxWorkers}/${site.maxWorkers}）`);
            return;
        }

        // 检查囚犯状态
        if (prisoner.status.includes('劳役中')) {
            setError(`${prisoner.character.name}已经在劳役中`);
            return;
        }

        const startTime = Date.now();
        const endTime = startTime + duration * 3600000; // 转换小时到毫秒

        setGameState(prevState => {
            const newWorker: LaborWorker = {
                prisonerId: prisoner.character.id,
                prisonerName: prisoner.character.name,
                startTime,
                endTime,
                duration,
                status: 'working'
            };

            return {
                ...prevState,
                prisonSystem: {
                    ...prevState.prisonSystem,
                    laborSites: prevState.prisonSystem.laborSites.map(s =>
                        s.id === siteId
                            ? { ...s, workers: [...s.workers, newWorker] }
                            : s
                    ),
                    prisoners: prevState.prisonSystem.prisoners.map(p =>
                        p.character.id === prisonerId
                            ? { ...p, status: [...p.status.filter(s => s !== '劳役中'), '劳役中'] as PrisonerStatus[], location: '劳役区' as PrisonArea }
                            : p
                    )
                }
            };
        });

        // 记录劳役分配
        addMemory(
            '大牢',
            `劳役分配：${prisoner.character.name}`,
            `将囚犯【${prisoner.character.name}】分配到${site.name}进行${duration}小时的劳役。`,
            [prisoner.character.name]
        );
    }, [gameState.prisonSystem]);

    const handleClaimLaborResult = useCallback(async (siteId: string, workerId: string) => {
        const site = gameState.prisonSystem.laborSites.find(s => s.id === siteId);
        const worker = site?.workers.find(w => w.prisonerId === workerId);
        const prisoner = gameState.prisonSystem.prisoners.find(p => p.character.id === workerId);

        if (!site || !worker || !prisoner) {
            setError('找不到劳役信息');
            return;
        }

        // 检查是否已完成
        if (Date.now() < worker.endTime) {
            setError('劳役尚未完成');
            return;
        }

        setIsLoading(true);
        try {
            // 调用AI生成劳役结果
            const result = await generateLaborResult(
                prisoner,
                site.type,
                worker.duration,
                gameState
            );

            setGameState(prevState => {
                // 移除worker
                const updatedSite = prevState.prisonSystem.laborSites.find(s => s.id === siteId);
                const updatedWorkers = updatedSite?.workers.filter(w => w.prisonerId !== workerId) || [];

                // 添加材料到库存（保持完整的 {material, quantity} 结构）
                const updatedInventory = [...prevState.prisonSystem.materialInventory, ...result.materials];

                // 更新囚犯状态
                const updatedPrisoners = prevState.prisonSystem.prisoners.map(p => {
                    if (p.character.id === workerId) {
                        return {
                            ...p,
                            status: p.status.filter(s => s !== '劳役中') as PrisonerStatus[],
                            health: Math.max(0, p.health - result.healthCost),
                            location: '居住区' as PrisonArea
                        };
                    }
                    return p;
                });

                return {
                    ...prevState,
                    prisonSystem: {
                        ...prevState.prisonSystem,
                        laborSites: prevState.prisonSystem.laborSites.map(s =>
                            s.id === siteId ? { ...s, workers: updatedWorkers } : s
                        ),
                        materialInventory: updatedInventory,
                        prisoners: updatedPrisoners
                    }
                };
            });

            // 记录劳役完成
            const materialsText = result.materials
                .map(m => `${m.material.name}(${m.material.rarity}) x${m.quantity}`)
                .join('、');

            addMemory(
                '大牢',
                `劳役完成：${prisoner.character.name}`,
                `${prisoner.character.name}完成了在${site.name}的劳役。\n\n${result.story}\n\n获得材料：${materialsText}\n经验+${result.experience}，健康-${result.healthCost}`,
                [prisoner.character.name]
            );

            alert(`劳役完成！\n\n${result.story}\n\n获得材料：${materialsText}`);
        } catch (error) {
            console.error('生成劳役结果失败:', error);
            setError('生成劳役结果失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    }, [gameState]);

    // 记忆管理函数
    const addMemory = useCallback((category: MemoryCategory, title: string, content: string, involvedCharacters?: string[]) => {
        const newMemory: MemoryEntry = {
            id: `memory-${Date.now()}-${Math.random()}`,
            category,
            title,
            content,
            timestamp: gameState.exploration.time,
            realTimestamp: Date.now(),
            location: gameState.exploration.location,
            involvedCharacters,
        };

        setGameState(prevState => {
            const newMemories = [newMemory, ...prevState.memories[category]].slice(0, 100);
            const newState = {
                ...prevState,
                memories: {
                    ...prevState.memories,
                    [category]: newMemories,
                }
            };

            // 自动总结触发检查
            if (prevState.summarySettings.autoSummaryEnabled) {
                const { smallSummaryInterval, largeSummaryInterval } = prevState.summarySettings;
                const memoryCount = newMemories.length;
                const smallSummaryCount = prevState.memorySummaries[category].small.length;

                // 检查是否需要生成小总结
                if (memoryCount > 0 && memoryCount % smallSummaryInterval === 0) {
                    // 异步生成小总结
                    const startIndex = Math.max(0, memoryCount - smallSummaryInterval);
                    const endIndex = memoryCount - 1;
                    const memoriesToSummarize = newMemories.slice(startIndex, endIndex + 1);

                    generateMemorySummary(memoriesToSummarize, 'small', category, prevState.summarySettings.summaryPrompts.small)
                        .then(summary => {
                            setGameState(prev => {
                                const newSummaries = [summary, ...prev.memorySummaries[category].small].slice(0, 50);
                                return {
                                    ...prev,
                                    memorySummaries: {
                                        ...prev.memorySummaries,
                                        [category]: {
                                            ...prev.memorySummaries[category],
                                            small: newSummaries,
                                        }
                                    }
                                };
                            });
                        })
                        .catch(err => console.error('自动生成小总结失败:', err));
                }

                // 检查是否需要生成大总结
                if (smallSummaryCount > 0 && smallSummaryCount % largeSummaryInterval === 0) {
                    // 获取最近的小总结
                    const recentSmallSummaries = prevState.memorySummaries[category].small.slice(0, largeSummaryInterval);

                    // 将小总结的内容合并为记忆条目用于生成大总结
                    const summariesAsMemories: MemoryEntry[] = recentSmallSummaries.map(summary => ({
                        id: summary.id,
                        category: summary.category,
                        title: summary.title,
                        content: summary.content,
                        timestamp: summary.timestamp,
                        realTimestamp: summary.realTimestamp,
                        location: undefined,
                        involvedCharacters: undefined,
                    }));

                    generateMemorySummary(summariesAsMemories, 'large', category, prevState.summarySettings.summaryPrompts.large)
                        .then(summary => {
                            setGameState(prev => {
                                const newSummaries = [summary, ...prev.memorySummaries[category].large].slice(0, 50);
                                return {
                                    ...prev,
                                    memorySummaries: {
                                        ...prev.memorySummaries,
                                        [category]: {
                                            ...prev.memorySummaries[category],
                                            large: newSummaries,
                                        }
                                    }
                                };
                            });
                        })
                        .catch(err => console.error('自动生成大总结失败:', err));
                }
            }

            return newState;
        });
    }, [gameState.exploration.time, gameState.exploration.location]);

    const handleClearMemoryCategory = useCallback((category: MemoryCategory) => {
        setGameState(prevState => ({
            ...prevState,
            memories: {
                ...prevState.memories,
                [category]: [],
            }
        }));
    }, []);

    const handleDeleteMemoryEntry = useCallback((category: MemoryCategory, entryId: string) => {
        setGameState(prevState => ({
            ...prevState,
            memories: {
                ...prevState.memories,
                [category]: prevState.memories[category].filter(entry => entry.id !== entryId),
            }
        }));
    }, []);

    const handleDeleteSummary = useCallback((category: MemoryCategory, summaryId: string, summaryType: SummaryType) => {
        setGameState(prevState => ({
            ...prevState,
            memorySummaries: {
                ...prevState.memorySummaries,
                [category]: {
                    ...prevState.memorySummaries[category],
                    [summaryType]: prevState.memorySummaries[category][summaryType].filter(s => s.id !== summaryId),
                }
            }
        }));
    }, []);

    const handleManualSummary = useCallback(async (
        category: MemoryCategory,
        startIndex: number,
        endIndex: number,
        summaryType: SummaryType
    ) => {
        const memories = gameState.memories[category];
        const selectedMemories = memories.slice(startIndex, endIndex + 1);

        if (selectedMemories.length === 0) {
            setError('没有选择任何记忆进行总结。');
            return;
        }

        setIsLoading(true);
        try {
            const promptTemplate = summaryType === 'small'
                ? gameState.summarySettings.summaryPrompts.small
                : gameState.summarySettings.summaryPrompts.large;
            const summary = await generateMemorySummary(selectedMemories, summaryType, category, promptTemplate);

            setGameState(prevState => {
                const newSummaries = [summary, ...prevState.memorySummaries[category][summaryType]].slice(0, 50);
                return {
                    ...prevState,
                    memorySummaries: {
                        ...prevState.memorySummaries,
                        [category]: {
                            ...prevState.memorySummaries[category],
                            [summaryType]: newSummaries,
                        }
                    }
                };
            });
        } catch (err) {
            console.error('生成总结失败:', err);
            setError('AI生成总结失败，请稍后再试。');
        } finally {
            setIsLoading(false);
        }
    }, [gameState.memories]);

    const handleUpdateSummarySettings = useCallback((newSettings: SummarySettings) => {
        setGameState(prevState => ({
            ...prevState,
            summarySettings: newSettings,
        }));
    }, []);

    // 向量设置和语义搜索处理函数
    const handleVectorSettingsSave = useCallback((config) => {
        // 更新游戏状态中的向量配置
        setGameState(prevState => ({
            ...prevState,
            vectorConfig: config,
        }));

        // 同步更新vectorService和rerankerService的配置
        vectorService.updateConfig(config);
        rerankerService.updateConfig(config);

        console.log('[App] 向量配置已更新，Reranker状态:', config.rerankerEnabled ? '启用' : '禁用');
    }, []);

    const renderMainView = () => {
        if (gameState.mode === 'exploration') {
            return <StoryDisplay story={gameState.exploration.story} storyEndRef={storyEndRef} />;
        }

        if (gameState.mode === 'battle' && gameState.battle) {
            const battle = gameState.battle;
            // 安全检查：确保战斗数据完整
            if (!battle.playerParty || !battle.opponentParty ||
                battle.playerParty.length === 0 || battle.opponentParty.length === 0 ||
                battle.activePlayerCardIndex >= battle.playerParty.length ||
                battle.activeOpponentCardIndex >= battle.opponentParty.length) {
                console.error('[渲染] 战斗数据无效，返回空视图', {
                    playerPartyLength: battle.playerParty?.length,
                    opponentPartyLength: battle.opponentParty?.length,
                    activePlayerIndex: battle.activePlayerCardIndex,
                    activeOpponentIndex: battle.activeOpponentCardIndex
                });
                // 显示错误提示而不是空白
                return (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-red-400 bg-black/60 p-8 rounded-lg">
                            <p className="text-2xl mb-4">⚠️ 战斗数据异常</p>
                            <p className="mb-4">战斗状态出现错误，请返回探索模式</p>
                            <button
                                onClick={() => {
                                    setGameState(prev => ({ ...prev, mode: 'exploration', battle: undefined }));
                                }}
                                className="bg-amber-600 px-6 py-2 rounded hover:bg-amber-500"
                            >
                                返回探索
                            </button>
                        </div>
                    </div>
                );
            }
            const playerCard = battle.playerParty[battle.activePlayerCardIndex];
            const opponentCard = battle.opponentParty[battle.activeOpponentCardIndex];

            return (
                <div className="w-full h-full flex flex-col">
                    {/* Top Section: Character Display */}
                    <div className="flex-grow">
                        <Battlefield
                            player={playerCard}
                            opponent={opponentCard}
                            animation={combatAnimation}
                            lastHit={lastHit}
                        />
                    </div>
                    {/* Middle Section: Narrator */}
                    <div className="flex-shrink-0 h-48 p-4">
                        <ActionNarrator
                            descriptions={currentTurnDescriptions}
                            isLoading={isLoading}
                            isPlayerTurn={battle.turn === 'player'}
                        />
                    </div>
                </div>
            );
        }

        return null; // Should not happen
    }

    const busyCharacterDetails = useMemo(() => {
        const details = new Map<string, string>();

        // 正在追踪悬赏的角色
        gameState.bountyBoard.forEach(bounty => {
            if (bounty.status === '追踪中' && bounty.trackerId) {
                details.set(bounty.trackerId, `红尘录: ${bounty.name}`);
            }
        });

        // 正在培育的角色
        gameState.cultivationPavilion.forEach(slot => {
            if (slot.status === 'Breeding') {
                if (slot.parentA) details.set(slot.parentA.id, '育灵轩: 培育中');
                if (slot.parentB) details.set(slot.parentB.id, '育灵轩: 培育中');
            }
        });

        // 在商区工作的角色
        gameState.playerProfile.businessDistrict?.shops.forEach(shop => {
            shop.staff.forEach(s => {
                const position = POSITIONS[s.positionId]?.name || '工作';
                details.set(s.characterId, `${shop.type}: ${position}`);
            });
        });

        // 礼仪设计馆的设计师
        if (gameState.etiquetteSystem?.designer) {
            details.set(gameState.etiquetteSystem.designer.characterId, '礼仪设计馆: 设计师');
        }

        return details;
    }, [gameState.bountyBoard, gameState.cultivationPavilion, gameState.playerProfile.businessDistrict, gameState.etiquetteSystem]);

    const busyCharacterIds = useMemo(() => new Set(busyCharacterDetails.keys()), [busyCharacterDetails]);

    // 处理开始新游戏
    const handleStartNewGame = () => {
        setShowStartScreen(false);
        setIsGameReady(true);
    };

    // 处理加载游戏
    const handleLoadGameFromStart = async (slotId: number) => {
        const loadedState = await storageService.loadFromSlot(slotId);
        if (loadedState) {
            setGameState(loadedState);
            setShowStartScreen(false);
            setIsGameReady(true);
        } else {
            alert('加载存档失败，存档可能已损坏。');
        }
    };

    // 如果显示启动封面，只渲染启动界面
    if (showStartScreen) {
        return (
            <StartScreen
                onStartNewGame={handleStartNewGame}
                onLoadGame={handleLoadGameFromStart}
            />
        );
    }

    return (
        <div
            ref={appRef}
            className="flex flex-col font-serif relative w-full h-full max-w-lg mx-auto shadow-2xl overflow-hidden"
            style={{
                backgroundImage: `url('https://github.com/zzq0219/sillytavern/blob/main/%E3%80%90%E5%93%B2%E9%A3%8E%E5%A3%81%E7%BA%B8%E3%80%91%E4%BA%91%E9%9B%BE-%E4%BB%99%E4%BE%A0.png?raw=true')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'scroll'
            }}
        >
            <TopStatusBar
                playerProfile={gameState.playerProfile}
                location={gameState.exploration.location}
                onProfileClick={() => setIsPersonalInfoOpen(true)}
                appRef={appRef}
            />
            {announcementsLoaded && (
                <AnnouncementTicker
                    announcements={[...gameState.announcements.world, ...gameState.announcements.adventure, ...gameState.announcements.sect]}
                    onClick={() => setIsAnnouncementModalOpen(true)}
                />
            )}

            <main className="flex-grow flex flex-col w-full overflow-hidden relative">
                {/* VIEW: HOME (Cave Abode) */}
                <div className={`absolute inset-0 pt-16 flex flex-col transition-opacity duration-300 ${viewMode === ViewMode.HOME ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <HomeDashboard
                        isVisible={viewMode === ViewMode.HOME}
                        gameState={gameState}
                        onNavClick={openModal}
                        onQuestClick={() => setIsQuestLogModalOpen(true)}
                        onBusinessClick={() => setIsBusinessModalOpen(true)}
                        onCultivationClick={() => setIsCultivationModalOpen(true)}
                        onMemoryClick={() => setIsMemoryModalOpen(true)}
                        onCharacterStatusClick={() => setIsCharacterStatusModalOpen(true)}
                        onPrisonClick={() => setIsPrisonModalOpen(true)}
                        onEtiquetteHallClick={() => setIsEtiquetteHallOpen(true)}
                        onGauntletClick={() => setIsGauntletHallOpen(true)}
                        onAnnouncementsClick={() => setIsAnnouncementModalOpen(true)}
                        onSystemClick={() => setIsSaveLoadModalOpen(true)}
                        onHospitalClick={() => setIsHospitalModalOpen(true)}
                    />
                </div>

                {/* VIEW: ADVENTURE */}
                <div className={`absolute inset-0 pt-16 flex flex-col transition-opacity duration-300 ${viewMode === ViewMode.ADVENTURE ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className="flex-grow overflow-hidden px-2 sm:px-4 pb-2">
                        <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
                            {renderMainView()}
                        </div>
                    </div>
                </div>

                {/* VIEW: INVENTORY (Storage Bag) */}
                <div className={`absolute inset-0 pt-16 flex flex-col transition-opacity duration-300 ${viewMode === ViewMode.INVENTORY ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className="h-full overflow-y-auto px-2 pt-2 pb-32">
                        <Inventory
                            playerProfile={gameState.playerProfile}
                            setPlayerProfile={(newProfile) => setGameState(prev => ({ ...prev, playerProfile: newProfile }))}
                            onViewPet={setViewingPet}
                        />
                    </div>
                </div>

            </main>

            {gameState.mode === 'battle' && gameState.battle?.isBattleOver && viewMode === ViewMode.ADVENTURE && (
                <BattleResultModal
                    victory={gameState.battle.victory}
                    isFled={gameState.battle.isFled}
                    onClose={returnToExploration}
                />
            )}

            {/* Bottom Section: Actions & Navigation */}
            <div className="flex-shrink-0 z-50 bg-[#050505] flex flex-col border-t border-white/5 shadow-2xl relative">

                {/* Adventure Actions (Exploration) */}
                {viewMode === ViewMode.ADVENTURE && gameState.mode === 'exploration' && (
                    <div className="w-full px-4 pt-3 pb-2 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                        <div className="max-w-3xl mx-auto relative">
                            <ActionPanel
                                choices={gameState.exploration.choices}
                                onAction={handleExplorationAction}
                                isLoading={isLoading}
                                error={error}
                            />

                            <div className="grid grid-cols-2 gap-3 mt-3">
                                {/* Map Button */}
                                <button
                                    onClick={() => setIsMapOpen(true)}
                                    className="relative overflow-hidden py-2.5 bg-gradient-to-r from-[#1c1c1c] to-[#151515] border border-stone-700/50 rounded-lg flex items-center justify-center gap-2 text-stone-400 hover:text-amber-200 hover:border-amber-500/30 hover:bg-white/5 transition-all duration-300 group shadow-lg"
                                    title="世界地图"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <i className="fa-solid fa-map-location-dot text-amber-700/50 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-300"></i>
                                    <span className="text-sm font-serif font-medium tracking-wide">世界地图</span>
                                </button>

                                {/* Cultivate Button */}
                                <button
                                    onClick={handleNextDay}
                                    disabled={isLoading}
                                    className="relative overflow-hidden py-2.5 bg-gradient-to-r from-[#1c1c1c] to-[#151515] border border-stone-700/50 rounded-lg flex items-center justify-center gap-2 text-stone-400 hover:text-amber-200 hover:border-amber-500/30 hover:bg-white/5 transition-all duration-300 group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="修炼一日"
                                >
                                    {isLoading ? (
                                        <i className="fa-solid fa-spinner fa-spin text-amber-500"></i>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <i className="fa-solid fa-moon text-amber-700/50 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-300"></i>
                                            <span className="text-sm font-serif font-medium tracking-wide">修炼一日</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Battle Actions */}
                {viewMode === ViewMode.ADVENTURE && gameState.mode === 'battle' && gameState.battle && !gameState.battle.isBattleOver && (
                    <div className="w-full px-2 pt-2 pb-1 bg-[#080808]">
                        <BattleActionPanel
                            battleState={gameState.battle}
                            isLoading={isLoading}
                            onCombatAction={handleCombatAction}
                            onFlee={handleFlee}
                            onOpenCombatLog={() => setIsCombatLogVisible(true)}
                        />
                    </div>
                )}

                {/* Navigation Dock */}
                <NavigationDock currentView={viewMode} onChangeView={setViewMode} />
            </div>

            <PersonalInfoPanel
                isOpen={isPersonalInfoOpen}
                onClose={() => setIsPersonalInfoOpen(false)}
                playerProfile={gameState.playerProfile}
                hasPendingChallenge={!!gameState.exploration.pendingChallenge}
                onBattleClick={() => {
                    if (gameState.exploration.pendingChallenge) {
                        setIsPersonalInfoOpen(false);
                        setIsChallengeModalOpen(true);
                    }
                }}
                onRelationshipsClick={() => setIsRelationshipModalOpen(true)}
                onReputationClick={() => handleOpenReputationModal()}
            />

            {activeModal && <Modal activeModal={activeModal} onClose={closeModal} playerProfile={gameState.playerProfile} setPlayerProfile={setPlayerProfile} leaderboards={gameState.leaderboards} onMatchFound={handleMatchFound} onViewPet={setViewingPet} gameState={gameState} onLeaderboardsUpdate={(newLeaderboards) => {
                setGameState(prevState => ({
                    ...prevState,
                    leaderboards: newLeaderboards
                }));
            }} />}
            {isCombatLogVisible && gameState.battle && (
                <CombatLog
                    log={gameState.battle.combatLog}
                    onClose={() => setIsCombatLogVisible(false)}
                />
            )}

            {isPreBattleModalOpen && pendingBattle && (
                <PreBattleModal
                    playerProfile={gameState.playerProfile}
                    opponentName={pendingBattle.opponentParty[0].card.name}
                    onBattleStart={startFinalBattle}
                    onClose={() => {
                        setIsPreBattleModalOpen(false);
                        setPendingBattle(null);
                        setGameState(prevState => ({ ...prevState, exploration: { ...prevState.exploration, pendingChallenge: null } }))
                    }}
                />
            )}
            {isMapOpen && (
                <MapModalEnhanced
                    currentLocationName={gameState.exploration.location}
                    onClose={() => setIsMapOpen(false)}
                    onTravel={handleTravel}
                />
            )}
            {isInteractionModalOpen && (
                <InteractionModal
                    isOpen={isInteractionModalOpen}
                    onClose={() => setIsInteractionModalOpen(false)}
                    onInteract={handleInitiateInteraction}
                    storyContext={gameState.exploration.story}
                />
            )}
            {randomEvent && (
                <RandomEventModal
                    event={randomEvent}
                    onChoice={handleRandomEventChoice}
                    resultText={eventResultText}
                />
            )}
            {gameState.exploration.pendingChallenge && (
                <ChallengeModal
                    isOpen={isChallengeModalOpen}
                    onClose={handleDeclineChallenge}
                    challenge={gameState.exploration.pendingChallenge}
                    onAccept={handleAcceptChallenge}
                    onDecline={handleDeclineChallenge}
                />
            )}
            {isRelationshipModalOpen && (
                <RelationshipModal
                    isOpen={isRelationshipModalOpen}
                    onClose={() => setIsRelationshipModalOpen(false)}
                    playerProfile={gameState.playerProfile}
                />
            )}
            <AnnouncementModal
                isOpen={isAnnouncementModalOpen}
                onClose={() => setIsAnnouncementModalOpen(false)}
                announcements={gameState.announcements}
                onRefresh={() => fetchAnnouncements('all')}
                isLoading={isAnnouncementsLoading}
            />
            <TelepathyModal
                isOpen={isTelepathyModalOpen}
                onClose={() => setIsTelepathyModalOpen(false)}
                playerProfile={gameState.playerProfile}
            />
            <ReputationModal
                isOpen={isReputationModalOpen}
                onClose={() => setIsReputationModalOpen(false)}
                reputation={gameState.playerProfile.reputation}
                isLoading={isReputationLoading}
                onRefresh={handleRefreshReputation}
            />
            <SaveLoadModal
                isOpen={isSaveLoadModalOpen}
                onClose={() => setIsSaveLoadModalOpen(false)}
                onSave={handleSave}
                onLoad={handleLoad}
                onExport={handleExport}
                onImport={handleImport}
                onDelete={handleDelete}
                getSaves={storageService.getAllSaves}
            />

            <QuestLogModal
                isOpen={isQuestLogModalOpen}
                onClose={() => setIsQuestLogModalOpen(false)}
                quests={gameState.playerProfile.quests}
                playerProfile={gameState.playerProfile}
                onClaimReward={(questId: string) => {
                    const quest = gameState.playerProfile.quests.find(q => q.id === questId);
                    if (quest && quest.status === 'Claimable') {
                        setGameState(prevState => ({
                            ...prevState,
                            playerProfile: questService.claimQuestRewards(prevState.playerProfile, questId)
                        }));

                        // 记录任务完成记忆
                        if (quest) {
                            const rewardText = [
                                quest.rewards.spiritStones ? `灵石 +${quest.rewards.spiritStones}` : '',
                                quest.rewards.reputation ? `声望 +${quest.rewards.reputation}` : '',
                                quest.rewards.items?.map(i => i.name).join('、') || ''
                            ].filter(Boolean).join('，');

                            addMemory(
                                '其他',
                                `完成任务：${quest.title}`,
                                `${quest.description}\n\n获得奖励：${rewardText}`,
                                []
                            );
                        }

                        console.log('[任务系统] 领取奖励:', quest.title);
                    }
                }}
            />

            {arenaResult && (
                <ArenaResultModal
                    {...arenaResult}
                    onClose={() => setArenaResult(null)}
                />
            )}
            <BusinessModal
                isOpen={isBusinessModalOpen}
                onClose={() => setIsBusinessModalOpen(false)}
                playerProfile={gameState.playerProfile}
                onUpdateProfile={setPlayerProfile}
                onOpenSurveillance={(shop) => setSurveillanceTarget(shop)}
                busyCharacterIds={busyCharacterIds}
                onOpenSelector={(title, list, onSelect) => setCharacterSelection({ isOpen: true, title, list, onSelect })}
                etiquetteSystem={gameState.etiquetteSystem}
            />
            {surveillanceTarget && (
                <SurveillanceModal
                    isOpen={!!surveillanceTarget}
                    onClose={() => setSurveillanceTarget(null)}
                    shop={surveillanceTarget}
                    cardCollection={gameState.playerProfile.cardCollection}
                />
            )}
            <HospitalModal
                isOpen={isHospitalModalOpen}
                onClose={() => setIsHospitalModalOpen(false)}
                patients={gameState.hospitalPatients}
                onStartConsultation={handleStartConsultation}
                onRefresh={handleRefreshPatients}
                onAddPatient={handleAddPatient}
                isLoading={isLoading}
                onViewRecord={handleViewPatientRecord}
                consultationPatient={consultationPatient}
                consultationStory={consultationStory}
                consultationChoices={consultationChoices}
                onConsultationAction={handleConsultationAction}
                onEndConsultation={handleEndConsultation}
                onReturnToList={handleReturnToHospitalList}
            />
            {viewingPatientRecord && (
                <MedicalRecordModal
                    isOpen={!!viewingPatientRecord}
                    onClose={() => setViewingPatientRecord(null)}
                    record={viewingPatientRecord}
                />
            )}
            <BountyBoardModal
                isOpen={isBountyBoardOpen}
                onClose={() => setIsBountyBoardOpen(false)}
                bountyBoard={gameState.bountyBoard}
                onViewTarget={(target) => setViewingBountyTarget(target.character)}
                onAccept={(targetId) => {
                    const bounty = gameState.bountyBoard.find(b => b.id === targetId);
                    if (!bounty) return;
                    const availableCharacters = gameState.playerProfile.cardCollection.filter(
                        c => !busyCharacterIds.has(c.id)
                    );
                    setCharacterSelection({
                        isOpen: true,
                        title: `为悬赏【${bounty.name}】派遣角色`,
                        list: availableCharacters,
                        onSelect: (card) => {
                            handleAcceptBounty(bounty.id, card.id);
                        }
                    });
                }}
                onClaim={handleClaimBounty}
                onRefresh={handleRefreshBountyBoard}
                onAddTarget={handleAddBountyTarget}
                isLoading={isLoading}
            />
            {viewingBountyTarget && (
                <CharacterDetail
                    card={viewingBountyTarget}
                    onClose={() => setViewingBountyTarget(null)}
                    playerProfile={gameState.playerProfile}
                    setPlayerProfile={setPlayerProfile}
                    onViewPet={setViewingPet}
                />
            )}

            {viewingPet && (
                <PetDetail
                    pet={viewingPet}
                    onClose={() => setViewingPet(null)}
                />
            )}


            {claimingBounty && (
                <BountyResultModal
                    isOpen={!!claimingBounty}
                    onClose={() => setClaimingBounty(null)}
                    bounty={claimingBounty}
                    onOutcome={(outcome) => handleBountyOutcome(claimingBounty.id, outcome)}
                />
            )}

            <CultivationModal
                isOpen={isCultivationModalOpen}
                onClose={() => setIsCultivationModalOpen(false)}
                playerProfile={gameState.playerProfile}
                cultivationSlots={gameState.cultivationPavilion}
                onStartCultivation={handleStartCultivation}
                onClaimCultivation={handleClaimCultivation}
                busyCharacterIds={busyCharacterIds}
                onOpenSelector={(title, list, onSelect) => setCharacterSelection({ isOpen: true, title, list, onSelect })}
                onGetLiveMonitoring={async (slotId: number) => {
                    const slot = gameState.cultivationPavilion.find(s => s.slotId === slotId);
                    if (!slot || !slot.parentA || !slot.parentB) {
                        return "监视目标丢失...";
                    }
                    try {
                        const report = await generateCultivationMonitoringText(slot.parentA, slot.parentB);
                        return report;
                    } catch (error) {
                        console.error("生成监视报告失败:", error);
                        return "监视水晶受到干扰，无法看清内部情况...";
                    }
                }}
            />

            <MemoryModal
                isOpen={isMemoryModalOpen}
                onClose={() => setIsMemoryModalOpen(false)}
                memories={gameState.memories}
                memorySummaries={gameState.memorySummaries}
                summarySettings={gameState.summarySettings}
                onClearCategory={handleClearMemoryCategory}
                onDeleteEntry={handleDeleteMemoryEntry}
                onDeleteSummary={handleDeleteSummary}
                onManualSummary={handleManualSummary}
                onUpdateSettings={handleUpdateSummarySettings}
                gameState={gameState}
                onVectorConfigSave={handleVectorSettingsSave}
            />

            <CharacterStatusModal
                isOpen={isCharacterStatusModalOpen}
                onClose={() => setIsCharacterStatusModalOpen(false)}
                cardCollection={gameState.playerProfile.cardCollection}
                petCollection={gameState.playerProfile.petCollection}
                busyCharacterDetails={busyCharacterDetails}
            />

            <CharacterSelectionModal
                isOpen={characterSelection.isOpen}
                onClose={() => setCharacterSelection(prev => ({ ...prev, isOpen: false }))}
                onSelect={characterSelection.onSelect}
                characterList={characterSelection.list}
                title={characterSelection.title}
            />

            <PrisonModal
                isOpen={isPrisonModalOpen}
                onClose={() => setIsPrisonModalOpen(false)}
                prisonSystem={gameState.prisonSystem}
                playerProfile={gameState.playerProfile}
                setPlayerProfile={setPlayerProfile}
                onViewPet={setViewingPet}
                onInterrogatePrisoner={(prisoner) => {
                    setSelectedPrisonerForInterrogation(prisoner);
                    setIsInterrogationModalOpen(true);
                    setInterrogationLog('');
                }}
                onViewPrisonerDetail={(prisoner) => {
                    alert(`查看囚犯详情：${prisoner.character.name}\n\n罪行：${prisoner.crime}\n屈服度：${prisoner.submissionLevel}%\n归顺度：${prisoner.loyaltyLevel}%\n健康度：${prisoner.health}%\n神智：${prisoner.sanity}%`);
                }}
                onTransferPrisoner={(prisoner, newArea) => {
                    setGameState(prev => ({
                        ...prev,
                        prisonSystem: {
                            ...prev.prisonSystem,
                            prisoners: prev.prisonSystem.prisoners.map(p =>
                                p.character.id === prisoner.character.id ? { ...p, location: newArea } : p
                            )
                        }
                    }));

                    // 记录转移记忆
                    addMemory(
                        '大牢',
                        `囚犯转移：${prisoner.character.name}`,
                        `将囚犯【${prisoner.character.name}】从${prisoner.location}转移到${newArea}。`,
                        [prisoner.character.name]
                    );
                }}
                onReleasePrisoner={(prisoner) => {
                    setGameState(prev => ({
                        ...prev,
                        prisonSystem: {
                            ...prev.prisonSystem,
                            prisoners: prev.prisonSystem.prisoners.filter(p => p.character.id !== prisoner.character.id)
                        }
                    }));

                    // 记录释放记忆
                    addMemory(
                        '大牢',
                        `释放囚犯：${prisoner.character.name}`,
                        `释放了囚犯【${prisoner.character.name}】。罪行：${prisoner.crime}`,
                        [prisoner.character.name]
                    );
                }}
                onRecruitPrisoner={(prisoner) => {
                    // 检查归顺度和屈服度是否达标
                    if (prisoner.loyaltyLevel < 80 || prisoner.submissionLevel < 60) {
                        alert(`招募失败：【${prisoner.character.name}】的归顺度或屈服度不足！\n\n当前归顺度：${prisoner.loyaltyLevel}% (需要≥80%)\n当前屈服度：${prisoner.submissionLevel}% (需要≥60%)`);
                        return;
                    }

                    // 将囚犯的角色卡添加到卡牌收藏
                    setGameState(prev => ({
                        ...prev,
                        playerProfile: {
                            ...prev.playerProfile,
                            cardCollection: [...prev.playerProfile.cardCollection, prisoner.character]
                        },
                        prisonSystem: {
                            ...prev.prisonSystem,
                            prisoners: prev.prisonSystem.prisoners.filter(p => p.character.id !== prisoner.character.id)
                        }
                    }));

                    // 记录招募记忆
                    addMemory(
                        '大牢',
                        `成功招募：${prisoner.character.name}`,
                        `成功招募了囚犯【${prisoner.character.name}】加入队伍。归顺度：${prisoner.loyaltyLevel}%，屈服度：${prisoner.submissionLevel}%`,
                        [prisoner.character.name]
                    );

                    alert(`成功招募【${prisoner.character.name}】！\n\n该角色已加入你的卡牌收藏。`);
                }}
                onAssignLabor={handleAssignLabor}
                onClaimLaborResult={handleClaimLaborResult}
                onGenerateEvent={() => {
                    alert('随机事件功能开发中');
                }}
                onDialogueComplete={(prisoner, result) => {
                    // 更新囚犯状态
                    setGameState(prev => ({
                        ...prev,
                        prisonSystem: {
                            ...prev.prisonSystem,
                            prisoners: prev.prisonSystem.prisoners.map(p => {
                                if (p.character.id === prisoner.character.id) {
                                    return {
                                        ...p,
                                        submissionLevel: Math.max(0, Math.min(100, p.submissionLevel + result.stateChanges.submission)),
                                        loyaltyLevel: Math.max(0, Math.min(100, p.loyaltyLevel + result.stateChanges.loyalty)),
                                        health: Math.max(0, Math.min(100, p.health + result.stateChanges.health)),
                                        sanity: Math.max(0, Math.min(100, p.sanity + result.stateChanges.sanity)),
                                        knownInformation: result.rewards?.information
                                            ? [...(p.knownInformation || []), result.rewards.information]
                                            : p.knownInformation
                                    };
                                }
                                return p;
                            }),
                            stats: {
                                ...prev.prisonSystem.stats,
                                avgSubmission: prev.prisonSystem.prisoners.length > 0
                                    ? prev.prisonSystem.prisoners.reduce((sum, p) => sum + p.submissionLevel, 0) / prev.prisonSystem.prisoners.length
                                    : 0,
                                avgLoyalty: prev.prisonSystem.prisoners.length > 0
                                    ? prev.prisonSystem.prisoners.reduce((sum, p) => sum + p.loyaltyLevel, 0) / prev.prisonSystem.prisoners.length
                                    : 0
                            }
                        },
                        playerProfile: result.rewards?.spiritStones
                            ? {
                                ...prev.playerProfile,
                                spiritStones: prev.playerProfile.spiritStones - (result.rewards.spiritStones || 0)
                            }
                            : prev.playerProfile
                    }));

                    // 记录对话记忆
                    addMemory(
                        '大牢',
                        `与囚犯对话：${prisoner.character.name}`,
                        `与囚犯【${prisoner.character.name}】进行了${result.dialogueRecord.dialogueType}对话。\n` +
                        `选择：${result.dialogueRecord.playerChoice}\n` +
                        `囚犯回应："${result.dialogueRecord.prisonerResponse}"\n` +
                        `效果：屈服度${result.stateChanges.submission >= 0 ? '+' : ''}${result.stateChanges.submission}，` +
                        `归顺度${result.stateChanges.loyalty >= 0 ? '+' : ''}${result.stateChanges.loyalty}` +
                        (result.rewards?.information ? `\n获得情报：${result.rewards.information}` : '') +
                        (result.consequences?.eventTriggered ? `\n触发事件：${result.consequences.eventTriggered}` : ''),
                        [prisoner.character.name]
                    );

                    // 如果触发了特殊事件，显示提示
                    if (result.consequences?.eventTriggered) {
                        setTimeout(() => {
                            alert(`⚠️ 特殊事件：${result.consequences?.eventTriggered}`);
                        }, 500);
                    }
                }}
                onGenerateDialogueResponse={async (prisoner, option) => {
                    // 使用 AI 生成对话响应
                    try {
                        const prompt = `你是一个修仙世界的囚犯，名叫${prisoner.character.name}，${prisoner.character.gender === 'Male' ? '男性' : '女性'}，修为${prisoner.character.realm}。
你因为"${prisoner.crime}"被关押在大牢中。
当前状态：
- 屈服度：${prisoner.submissionLevel}%（${prisoner.submissionLevel >= 80 ? '完全屈服' : prisoner.submissionLevel >= 60 ? '意志动摇' : prisoner.submissionLevel >= 40 ? '勉强配合' : '顽固抵抗'}）
- 归顺度：${prisoner.loyaltyLevel}%
- 健康：${prisoner.health}%
- 神智：${prisoner.sanity}%

狱卒对你使用了"${option.type}"的方式：${option.text}（${option.description}）

请以囚犯的身份，用第一人称回应这个对话。回应要符合你当前的屈服度和心理状态：
- 如果屈服度低，应该表现出抗拒、愤怒或不屑
- 如果屈服度高，应该表现出顺从、恐惧或配合
- 回应要简短有力，1-3句话即可
- 要符合修仙世界的语言风格`;

                        // 尝试调用 AI 生成
                        if (typeof window !== 'undefined' && (window as any).SillyTavern?.generateText) {
                            const response = await (window as any).SillyTavern.generateText(prompt);
                            return response || getDefaultResponse(option.type, prisoner.submissionLevel);
                        }

                        // 如果没有 AI，使用默认响应
                        return getDefaultResponse(option.type, prisoner.submissionLevel);
                    } catch (error) {
                        console.error('生成对话响应失败:', error);
                        return getDefaultResponse(option.type, prisoner.submissionLevel);
                    }
                }}
                isLoading={isLoading}
            />

            {/* 礼仪设计馆 */}
            <EtiquetteHallModal
                isOpen={isEtiquetteHallOpen}
                onClose={() => setIsEtiquetteHallOpen(false)}
                etiquetteSystem={gameState.etiquetteSystem}
                onUpdateEtiquetteSystem={(newSystem: EtiquetteSystem) => {
                    setGameState(prev => ({
                        ...prev,
                        etiquetteSystem: newSystem,
                    }));
                }}
                cardCollection={gameState.playerProfile.cardCollection}
                gameState={gameState}
                onOpenDesignerSelection={() => {
                    const availableCharacters = gameState.playerProfile.cardCollection.filter(
                        c => !busyCharacterIds.has(c.id)
                    );
                    setCharacterSelection({
                        isOpen: true,
                        title: '选择礼仪设计师',
                        list: availableCharacters,
                        onSelect: (card) => {
                            const newDesigner: EtiquetteDesigner = {
                                characterId: card.id,
                                assignedAt: Date.now(),
                                designCount: 0,
                                designStyle: ['极致服从', '羞耻强化'],
                                qualityScore: 80,
                            };
                            setGameState(prev => ({
                                ...prev,
                                etiquetteSystem: {
                                    ...prev.etiquetteSystem,
                                    designer: newDesigner,
                                    logs: [{
                                        id: `log-${Date.now()}`,
                                        timestamp: Date.now(),
                                        action: 'designer_assign' as const,
                                        details: `指派了新设计师：${card.name}`,
                                        designerId: card.id,
                                    }, ...prev.etiquetteSystem.logs].slice(0, 100),
                                },
                            }));
                            setCharacterSelection(prev => ({ ...prev, isOpen: false }));
                        },
                    });
                }}
            />

            {/* 大闯关大厅 */}
            <GauntletHallModal
                isOpen={isGauntletHallOpen}
                onClose={() => setIsGauntletHallOpen(false)}
                gameState={gameState}
                setGameState={setGameState}
                onOpenAnnouncement={() => {
                    setIsGauntletAnnouncementOpen(true);
                }}
                onOpenRegistration={() => {
                    setIsGauntletRegistrationOpen(true);
                }}
                onOpenLive={() => {
                    setIsGauntletLiveOpen(true);
                }}
            />

            {/* 大闯关直播间 */}
            <GauntletLiveModal
                isOpen={isGauntletLiveOpen}
                onClose={() => setIsGauntletLiveOpen(false)}
                gameState={gameState}
                setGameState={setGameState}
            />

            {/* 大闯关公告栏 */}
            <GauntletAnnouncementModal
                isOpen={isGauntletAnnouncementOpen}
                onClose={() => setIsGauntletAnnouncementOpen(false)}
                gameState={gameState}
                onGenerateAllDrafts={async () => {
                    console.log('[大闯关] 生成全部草稿');

                    const currentEvent = gameState.gauntletSystem.currentEvent;
                    if (!currentEvent) {
                        alert('当前没有进行中的赛事');
                        return;
                    }

                    if (currentEvent.challengesGenerated) {
                        alert('关卡草稿已生成，无需重复生成');
                        return;
                    }

                    try {
                        alert('开始生成6轮关卡草稿，请稍候...');

                        // 调用AI服务生成关卡草稿
                        const challenges = await gauntletAIService.generateAllChallengeDrafts(gameState);

                        // 使用setChallengeDrafts更新赛事
                        const updatedEvent = setChallengeDrafts(currentEvent, challenges);

                        // 更新游戏状态
                        setGameState(prev => ({
                            ...prev,
                            gauntletSystem: {
                                ...prev.gauntletSystem,
                                currentEvent: updatedEvent
                            }
                        }));

                        console.log('[大闯关] 关卡草稿生成完成');
                        alert(`关卡草稿生成成功！\n\n已生成${challenges.length}轮关卡`);
                    } catch (error) {
                        console.error('[大闯关] 生成关卡草稿失败:', error);
                        alert('生成关卡草稿失败，请重试');
                    }
                }}
                onStartAllOptimization={async () => {
                    console.log('[大闯关] 开始全部优化');

                    const currentEvent = gameState.gauntletSystem.currentEvent;
                    if (!currentEvent) {
                        alert('当前没有进行中的赛事');
                        return;
                    }

                    if (!currentEvent.challengesGenerated) {
                        alert('请先生成关卡草稿');
                        return;
                    }

                    if (currentEvent.allOptimizationsComplete) {
                        alert('所有关卡已完成优化');
                        return;
                    }

                    try {
                        alert('开始优化所有关卡（共18次优化），这可能需要一些时间...');

                        let updatedEvent = { ...currentEvent };
                        const totalOptimizations = 6 * 3; // 6轮 × 3次优化
                        let completedOptimizations = 0;

                        // 逐个优化每轮关卡
                        for (let round = 1; round <= 6; round++) {
                            const challenge = updatedEvent.rounds[round - 1]?.challenge;
                            if (!challenge) continue;

                            let updatedChallenge = { ...challenge };

                            for (let optRound = 1; optRound <= 3; optRound++) {
                                // 跳过已完成的优化
                                if (updatedChallenge.optimizationProgress >= optRound) {
                                    completedOptimizations++;
                                    continue;
                                }

                                console.log(`[大闯关] 优化第${round}轮关卡 (${optRound}/3)`);

                                const optimization = await gauntletAIService.optimizeChallenge(
                                    updatedChallenge,
                                    optRound as 1 | 2 | 3,
                                    gameState
                                );

                                // 更新关卡
                                updatedChallenge = {
                                    ...updatedChallenge,
                                    [`optimization${optRound}`]: optimization,
                                    optimizationProgress: optRound as 0 | 1 | 2 | 3
                                };

                                // 如果是最后一轮优化,设置最终版本
                                if (optRound === 3) {
                                    updatedChallenge.finalVersion = optimization.optimizedDesign;
                                }

                                completedOptimizations++;

                                // 添加小延迟避免API限流
                                await new Promise(resolve => setTimeout(resolve, 300));
                            }

                            updatedEvent = updateChallenge(updatedEvent, round, updatedChallenge);
                        }

                        // 更新游戏状态
                        setGameState(prev => ({
                            ...prev,
                            gauntletSystem: {
                                ...prev.gauntletSystem,
                                currentEvent: updatedEvent
                            }
                        }));

                        console.log('[大闯关] 全部优化完成');
                        alert('所有关卡优化完成！');
                    } catch (error) {
                        console.error('[大闯关] 优化失败:', error);
                        alert('优化过程中出错，请重试');
                    }
                }}
                onOptimizeChallenge={async (roundNumber, optimizationRound) => {
                    console.log(`[大闯关] 优化第${roundNumber}轮关卡，第${optimizationRound}次优化`);

                    const currentEvent = gameState.gauntletSystem.currentEvent;
                    if (!currentEvent) {
                        alert('当前没有进行中的赛事');
                        return;
                    }

                    const challenge = currentEvent.rounds[roundNumber - 1]?.challenge;
                    if (!challenge) {
                        alert(`第${roundNumber}轮关卡不存在`);
                        return;
                    }

                    if (challenge.optimizationProgress >= optimizationRound) {
                        alert(`第${roundNumber}轮关卡的第${optimizationRound}次优化已完成`);
                        return;
                    }

                    try {
                        alert(`正在优化第${roundNumber}轮关卡（第${optimizationRound}次）...`);

                        const optimization = await gauntletAIService.optimizeChallenge(
                            challenge,
                            optimizationRound as 1 | 2 | 3,
                            gameState
                        );

                        // 更新关卡
                        let updatedChallenge = {
                            ...challenge,
                            [`optimization${optimizationRound}`]: optimization,
                            optimizationProgress: optimizationRound as 0 | 1 | 2 | 3
                        };

                        // 如果是最后一轮优化,设置最终版本
                        if (optimizationRound === 3) {
                            updatedChallenge.finalVersion = optimization.optimizedDesign;
                        }

                        const updatedEvent = updateChallenge(currentEvent, roundNumber, updatedChallenge);

                        // 更新游戏状态
                        setGameState(prev => ({
                            ...prev,
                            gauntletSystem: {
                                ...prev.gauntletSystem,
                                currentEvent: updatedEvent
                            }
                        }));

                        console.log(`[大闯关] 第${roundNumber}轮关卡第${optimizationRound}次优化完成`);
                        alert(`优化完成！\n\n第${roundNumber}轮关卡已完成第${optimizationRound}次优化`);
                    } catch (error) {
                        console.error('[大闯关] 优化失败:', error);
                        alert('优化失败，请重试');
                    }
                }}
            />

            {/* 大闯关报名弹窗 */}
            <GauntletRegistrationModal
                isOpen={isGauntletRegistrationOpen}
                onClose={() => setIsGauntletRegistrationOpen(false)}
                gameState={gameState}
                onRegister={async (characterCard: CharacterCard) => {
                    console.log('[大闯关] 报名参赛者:', characterCard.name);

                    // 获取当前赛事，如果不存在则创建新赛事
                    let currentEvent = gameState.gauntletSystem.currentEvent;
                    let updatedSystem = gameState.gauntletSystem;

                    if (!currentEvent) {
                        // 创建新赛事
                        currentEvent = createNewEvent(gameState.gauntletSystem);
                        updatedSystem = {
                            ...gameState.gauntletSystem,
                            currentEvent,
                            totalEditions: currentEvent.edition
                        };
                    }

                    // 检查并推进赛事状态（可能从countdown到registration）
                    currentEvent = checkAndAdvanceEventStatus(currentEvent);

                    // 检查是否在报名阶段
                    if (currentEvent.status !== 'registration') {
                        alert(`当前不在报名阶段\n\n赛事状态: ${currentEvent.status}`);
                        return;
                    }

                    // 注册玩家参赛者
                    const updatedEvent = registerPlayerContestant(currentEvent, {
                        name: characterCard.name,
                        realm: characterCard.realm,
                        appearance: characterCard.appearance,
                        charm: characterCard.charm,
                        skillfulness: characterCard.skillfulness,
                        characterCardId: characterCard.id
                    });

                    // 更新游戏状态
                    setGameState(prev => ({
                        ...prev,
                        gauntletSystem: {
                            ...updatedSystem,
                            currentEvent: updatedEvent
                        }
                    }));

                    console.log('[大闯关] 报名成功:', characterCard.name);
                    alert(`报名成功！\n\n参赛者: ${characterCard.name}\n当前已报名人数: ${updatedEvent.contestants.length}/64`);
                }}
                onCancelRegistration={async () => {
                    console.log('[大闯关] 取消报名');

                    const currentEvent = gameState.gauntletSystem.currentEvent;
                    if (!currentEvent) {
                        alert('当前没有进行中的赛事');
                        return;
                    }

                    if (currentEvent.status !== 'registration') {
                        alert('当前不在报名阶段，无法取消报名');
                        return;
                    }

                    if (!currentEvent.playerContestantId) {
                        alert('您尚未报名');
                        return;
                    }

                    // 取消报名
                    const updatedEvent = cancelPlayerRegistration(currentEvent);

                    // 更新游戏状态
                    setGameState(prev => ({
                        ...prev,
                        gauntletSystem: {
                            ...prev.gauntletSystem,
                            currentEvent: updatedEvent
                        }
                    }));

                    console.log('[大闯关] 取消报名成功');
                    alert('已成功取消报名');
                }}
                onGenerateContestants={async (count: number) => {
                    const currentEvent = gameState.gauntletSystem.currentEvent;
                    if (!currentEvent) {
                        console.error('[大闯关] 当前没有活跃赛事');
                        alert('当前没有进行中的赛事');
                        return;
                    }

                    try {
                        setIsLoading(true);

                        // 1. 调用AI服务生成参赛者
                        console.log(`[大闯关] 开始生成${count}名AI参赛者...`);
                        const newContestants = await gauntletAIService.generateContestants(count, gameState);
                        console.log(`[大闯关] 成功生成${newContestants.length}名参赛者`);

                        // 2. 将参赛者添加到当前赛事
                        const updatedEvent = {
                            ...currentEvent,
                            contestants: [...currentEvent.contestants, ...newContestants]
                        };

                        // 3. 更新游戏状态
                        setGameState(prevState => ({
                            ...prevState,
                            gauntletSystem: {
                                ...prevState.gauntletSystem,
                                currentEvent: updatedEvent
                            }
                        }));

                        console.log(`[大闯关] 参赛者已添加到赛事，当前人数：${updatedEvent.contestants.length}`);
                        alert(`成功生成${newContestants.length}名参赛者！\n\n当前报名人数：${updatedEvent.contestants.length}/64`);
                    } catch (error) {
                        console.error('[大闯关] 生成参赛者失败:', error);
                        alert('生成参赛者失败，请稍后重试。');
                    } finally {
                        setIsLoading(false);
                    }
                }}
            />

            {isInterrogationModalOpen && selectedPrisonerForInterrogation && (
                <InterrogationModal
                    isOpen={isInterrogationModalOpen}
                    onClose={() => setIsInterrogationModalOpen(false)}
                    prisoner={selectedPrisonerForInterrogation}
                    availableTortureMethods={[
                        {
                            id: 'whipping',
                            name: '鞭刑',
                            category: 'basic',
                            description: '用鞭子抽打囚犯，造成皮肉之苦',
                            damage: 20,
                            intimidation: 40,
                            successRate: 30,
                            submissionIncrease: 10,
                            risks: { death: 2, permanentInjury: 5, insanity: 3 }
                        },
                        {
                            id: 'caning',
                            name: '杖刑',
                            category: 'basic',
                            description: '用木杖击打囚犯',
                            damage: 30,
                            intimidation: 50,
                            successRate: 40,
                            submissionIncrease: 15,
                            risks: { death: 5, permanentInjury: 10, insanity: 5 }
                        }
                    ]}
                    onExecuteTorture={(prisonerId, methodId, duration) => {
                        alert(`执行刑罚：囚犯 ${prisonerId}, 方法 ${methodId}, 时长 ${duration}分钟\n\n此功能需要AI集成才能生成审讯结果。`);
                        setInterrogationLog(`正在执行刑罚...\n持续时间：${duration}分钟\n\n[此处将显示AI生成的审讯过程]`);
                    }}
                    onEndInterrogation={() => {
                        setIsInterrogationModalOpen(false);
                        setSelectedPrisonerForInterrogation(null);
                        setInterrogationLog('');
                    }}
                    interrogationLog={interrogationLog}
                    isLoading={isLoading}
                />
            )}

        </div>
    );
};

export default App;