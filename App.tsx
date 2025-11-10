import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ModalType, BattleState, PlayerProfile, CharacterCard, RandomEvent, EventChoice, Attributes, BattleParticipant, CharacterRelationship, Announcement, ArenaRank, LeaderboardEntry, SaveSlot, Shop, Patient, MedicalRecord } from './types';
import { initialGameState, femaleChar, maleChar, CHARACTER_POOL, EQUIPMENT_POOL, examplePatient, exampleBountyTarget } from './constants';
// import { generateExplorationStep, processCombatTurn, generateRandomEvent, generateAnnouncements } from './services/geminiService';
import { generateExplorationStep, processCombatTurn, generateRandomEvent, generateAnnouncements, updateCharacterRelationship, generateReputationDetails, generateReputationStory, generateBusinessEvent, generatePatient, generateBountyTarget } from './services/tavernService';
import { storageService } from './services/storageService';
import * as questService from './services/questService';
import { calculateBusinessIncome } from './services/utils';
import TopStatusBar from './components/TopStatusBar';
import { BottomBar } from './components/BottomBar';
import StoryDisplay from './components/StoryDisplay';
import Modal from './components/Modal';
import Battlefield from './components/Battlefield';
import ActionNarrator from './components/ActionNarrator';
import CombatLog from './components/CombatLog';
import PreBattleModal from './components/PreBattleModal';
import MapModal from './components/MapModal';
import PersonalInfoPanel from './components/PersonalInfoPanel';
import CharacterDetail from './components/CharacterDetail';
import InteractionModal from './components/InteractionModal';
import RandomEventModal from './components/RandomEventModal';
import BattleActionPanel from './components/BattleActionPanel';
import BattleResultModal from './components/BattleResultModal';
import ChallengeModal from './components/ChallengeModal';
import AnnouncementTicker from './components/AnnouncementTicker';
import AnnouncementModal from './components/AnnouncementModal';
import TelepathyModal from './components/TelepathyModal';
import ReputationModal from './components/ReputationModal';
import SaveLoadModal from './components/SaveLoadModal';
import ArenaResultModal from './components/ArenaResultModal';
import QuestLogModal from './components/QuestLogModal';
import BusinessModal from './components/BusinessModal';
import SurveillanceModal from './components/SurveillanceModal';
import HospitalModal from './components/HospitalModal';
import ConsultationScreen from './components/ConsultationScreen';
import MedicalRecordModal from './components/MedicalRecordModal';
import BountyBoardModal from './components/BountyBoardModal';
import { calculateTotalAttributes } from './services/utils';

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
                className="ornate-border bg-stone-900 w-full max-w-2xl h-auto max-h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">人际关系</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700">
                    <button onClick={() => setActiveTab('熟人')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === '熟人' ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>熟人</button>
                    <button onClick={() => setActiveTab('陌生人')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === '陌生人' ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>陌生人</button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {filteredRelationships.length > 0 ? (
                        filteredRelationships.map(rel => (
                            <div key={rel.id} className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
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
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isGameReady, setIsGameReady] = useState(false); // 状态，用于标记游戏是否已从酒馆加载完毕
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
  const [viewingPatientRecord, setViewingPatientRecord] = useState<MedicalRecord | null>(null);
  const [arenaResult, setArenaResult] = useState<{ oldRank: ArenaRank; newRank: ArenaRank; pointsChange: number; victory: boolean; } | null>(null);

  const storyEndRef = useRef<HTMLDivElement>(null);

  // 游戏加载时，尝试从酒馆变量加载状态
  useEffect(() => {
    // We no longer load from autosave on startup.
    // The game will always start fresh.
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
                    log: [{ timestamp: '初始', message: '你获得了“七情六欲坊”的初始地契，并开设了第一家青楼。' }]
                }
            }
        }));
    }
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
            
            // Update time
            const currentTime = prevState.exploration.time;
            const dayMatch = currentTime.match(/第(\d+)天/);
            const currentDay = dayMatch ? parseInt(dayMatch[1], 10) : 1;
            const newTime = `第${currentDay + 1}天，清晨`;

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
        const newPatients = await Promise.all([
            generatePatient(),
            generatePatient(),
            generatePatient(),
        ]);
        setGameState(prevState => ({
            ...prevState,
            hospitalPatients: newPatients.map(record => ({
                id: record.patientId,
                medicalRecord: record,
                status: '待诊' as const,
            })),
        }));
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
        const initialStory = `你坐在问诊室内，面前的病人是【${patient.medicalRecord.name}】。你清了清嗓子，准备开始今天的问诊。`;
        setConsultationStory(initialStory);
        setConsultationChoices(['询问病症', '进行身体检查', '安抚情绪']);
        setIsHospitalModalOpen(false);
    }
  };

  const handleConsultationAction = async (action: string) => {
    if (!consultationPatient) return;
    
    setIsLoading(true);
    const fullStory = `${consultationStory}\n\n> ${action}`;
    const context = `你正在为【${consultationPatient.medicalRecord.name}】诊断【${consultationPatient.medicalRecord.illnessDescription}】。`;
    
    try {
        const result = await generateExplorationStep(`${context}\n${fullStory}`, action, gameState.playerProfile);
        setConsultationStory(`${fullStory}\n\n${result.story}`);
        setConsultationChoices(result.choices);
    } catch (err) {
        console.error(err);
        setError('AI响应错误，请稍后再试。');
    } finally {
        setIsLoading(false);
    }
  };

  const handleEndConsultation = () => {
    setConsultationPatient(null);
    setConsultationStory('');
    setConsultationChoices([]);
  };

  const handleViewPatientRecord = (record: MedicalRecord) => {
    setViewingPatientRecord(record);
  };
  // This high-frequency autosave is removed to improve performance.
  // We will replace it with a debounced autosave and strategic saves on key events.

  const fetchAnnouncements = useCallback(async (refreshType: 'all' | 'sect' | 'adventure' | 'world' = 'all') => {
    setIsAnnouncementsLoading(true);
    try {
        const categories: ('sect' | 'adventure' | 'world')[] = refreshType === 'all' ? ['sect', 'adventure', 'world'] : [refreshType];
        
        const newAnnouncementsState = { ...gameState.announcements };

        for (const category of categories) {
            const key = category;
            const result = await generateAnnouncements(key, 5);
            
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

    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setIsAnnouncementsLoading(false);
    }
  }, [gameState.announcements]);

  useEffect(() => {
    fetchAnnouncements('all');
  }, []);

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
                    const masterCard = 
                        prevState.playerProfile.maleParty.find(c => c.id === participant.card.id) ||
                        prevState.playerProfile.femaleParty.find(c => c.id === participant.card.id);

                    if (masterCard) {
                        const newCalculatedStats = calculateTotalAttributes(masterCard);
                        const oldMaxHp = participant.calculatedStats ? participant.calculatedStats.maxHp : masterCard.baseAttributes.maxHp;
                        const hpPercentage = oldMaxHp > 0 ? Math.min(1, participant.currentHp / oldMaxHp) : 1;

                        const oldMaxMp = participant.calculatedStats ? participant.calculatedStats.maxMp : masterCard.baseAttributes.maxMp;
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

                return {
                    ...prevState,
                    battle: {
                        ...prevState.battle,
                        playerParty: updatedPlayerParty,
                    }
                };
            });
        }
    }, [gameState.playerProfile, gameState.mode]);

  const handleExplorationAction = useCallback(async (action: string) => {
    setIsLoading(true);
    setError(null);

    const fullStoryHistory = gameState.exploration.story;

    try {
      const result = await generateExplorationStep(fullStoryHistory, action, gameState.playerProfile);
      
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
            opponentParty: result.opponentParty.map(p => ({ ...p, statusEffects: [] })),
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
            newProfile = questService.addQuest(newProfile, result.newQuest);
            // Optionally, add a toast notification for new quest
        }
        if (result.questUpdate) {
            const { questId, objectiveId, progress } = result.questUpdate;
            const quest = newProfile.quests.find(q => q.id === questId);
            const objective = quest?.objectives.find(o => o.id === objectiveId);
            if (objective) {
                const newProgress = (objective.currentCount || 0) + progress;
                newProfile = questService.updateObjectiveProgress(newProfile, questId, objectiveId, newProgress);
            }
        }
        if (result.reputationUpdate) {
            newProfile.reputation = {
                ...newProfile.reputation,
                score: newProfile.reputation.score + result.reputationUpdate.scoreChange,
            };
        }
        return {
            ...prevState,
            playerProfile: newProfile,
            exploration: {
                ...prevState.exploration,
                story: storyUpdate,
                location: result.location,
                time: result.time,
                choices: result.choices,
                pendingChallenge: newPendingChallenge,
            }
        };
      });

      if (battleTriggered && !newPendingChallenge) {
        setCurrentTurnDescriptions([]);
        setIsPreBattleModalOpen(true);
        setIsLoading(false); 
        return;
      }

      const shouldTriggerEvent = Math.random() < 0.25; 
      if (shouldTriggerEvent && !newPendingChallenge && !battleTriggered) {
          try {
              const eventData = await generateRandomEvent(result.location, gameState.playerProfile);
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
    if (!gameState.battle || gameState.battle.isBattleOver) return;

    setIsLoading(true);
    setError(null);
    setCurrentTurnDescriptions([]);

    const battleState = gameState.battle;
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
        const result = await processCombatTurn(playerCard, opponentCard, action);

        // 2. 播放玩家行动画
        setCurrentTurnDescriptions([result.playerActionDescription]);
        setCombatAnimation({ key: Date.now(), effect: getEffectType(action), attacker: 'player' });
        if (result.opponentHpChange < 0) setLastHit('opponent');
        await delay(1500);

        // 3. 播放对手行动画
        setCurrentTurnDescriptions(prev => [...prev, result.opponentActionDescription]);
        const opponentActionName = result.opponentTurnSummary.match(/\[(.*?)\]/)?.[1] || 'default';
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
            updatedPlayerParty[prevState.battle.activePlayerCardIndex] = {
                ...updatedPlayerParty[prevState.battle.activePlayerCardIndex],
                currentHp: Math.max(0, newPlayerHp),
                currentMp: Math.max(0, newPlayerMp),
                statusEffects: result.playerStatusEffects,
            };

            const updatedOpponentParty = [...prevState.battle.opponentParty];
            updatedOpponentParty[prevState.battle.activeOpponentCardIndex] = {
                ...updatedOpponentParty[prevState.battle.activeOpponentCardIndex],
                currentHp: Math.max(0, newOpponentHp),
                currentMp: Math.max(0, newOpponentMp),
                statusEffects: result.opponentStatusEffects,
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

        setLastHit(null);

    } catch (err) {
        console.error(err);
        setError('一股神秘的力量扰乱了战场。');
    } finally {
        setIsLoading(false);
    }
  }, [gameState.battle]);

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
  };

  const returnToExploration = () => {
    if (gameState.battle?.isArenaBattle) {
        handleArenaBattleEnd(gameState.battle.victory ?? false);
        return;
    }

    let storyUpdate = `\n\n 战斗的尘埃落定。`;
    let newBountyBoard = [...gameState.bountyBoard];
    let newCardCollection = [...gameState.playerProfile.cardCollection];

    if (gameState.battle?.victory) {
        const opponentCard = gameState.battle.opponentParty[0].card;
        const bountyIndex = newBountyBoard.findIndex(b => b.character.name === opponentCard.name && b.status === '悬赏中');

        if (bountyIndex !== -1) {
            const bounty = newBountyBoard[bountyIndex];
            newBountyBoard[bountyIndex] = { ...bounty, status: '已狩猎' };
            
            // Add character to collection if not already present
            if (!newCardCollection.some(c => c.name === bounty.character.name)) {
                newCardCollection.push(bounty.character);
            }

            storyUpdate += `\n\n**[红尘录]** 目标【${bounty.name}】已被你成功狩猎！你获得了ta的角色卡！`;
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
    setGameState(prevState => ({
        ...prevState,
        mode: 'exploration',
        battle: undefined,
        exploration: {
            ...prevState.exploration,
            story: prevState.exploration.story + `\n\n你选择了避其锋芒，从战斗中脱离。`,
            choices: ["继续你的旅程。", "检查你的状态。", "寻找一个安全的地方休息。"]
        }
    }));
  };

  const startFinalBattle = (playerGender: 'Male' | 'Female', opponentGender: 'Male' | 'Female') => {
    const playerPartyForBattle = playerGender === 'Male' 
      ? gameState.playerProfile.maleParty 
      : gameState.playerProfile.femaleParty;

    const opponentPartyForBattle = opponentGender === 'Male' 
      ? [maleChar] 
      : [femaleChar];

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

  const handleOpenReputationModal = async () => {
    setIsReputationModalOpen(true);
    setIsReputationLoading(true);
    try {
        const details = await generateReputationStory(gameState.playerProfile);
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
    };

    setTimeout(processOutcome, 2000); // 2s delay
};

  const renderMainView = () => {
    if (gameState.mode === 'exploration') {
        return <StoryDisplay story={gameState.exploration.story} storyEndRef={storyEndRef} />;
    }

    if (consultationPatient) {
        return (
            <ConsultationScreen
                patient={consultationPatient}
                story={consultationStory}
                choices={consultationChoices}
                isLoading={isLoading}
                error={error}
                onAction={handleConsultationAction}
                onViewRecord={() => setIsMedicalRecordOpen(true)}
                onEndConsultation={handleEndConsultation}
            />
        );
    }

    if (gameState.mode === 'battle' && gameState.battle) {
        const battle = gameState.battle;
        if (battle.activePlayerCardIndex >= battle.playerParty.length || battle.activeOpponentCardIndex >= battle.opponentParty.length) {
            return <div className="flex-1" />; // Return empty div if battle data is invalid
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

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-serif relative">
      <TopStatusBar
        playerProfile={gameState.playerProfile}
        location={gameState.exploration.location}
        onProfileClick={() => setIsPersonalInfoOpen(true)}
      />
      <AnnouncementTicker 
        announcements={[...gameState.announcements.world, ...gameState.announcements.adventure, ...gameState.announcements.sect]}
        onClick={() => setIsAnnouncementModalOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center h-full overflow-hidden pt-24">
        {renderMainView()}
      </main>

      {gameState.mode === 'battle' && gameState.battle && !gameState.battle.isBattleOver && (
        <div className="flex-shrink-0">
            <BattleActionPanel
                battleState={gameState.battle}
                isLoading={isLoading}
                onCombatAction={handleCombatAction}
                onFlee={handleFlee}
                onOpenCombatLog={() => setIsCombatLogVisible(true)}
            />
        </div>
      )}
      
      {gameState.mode === 'battle' && gameState.battle?.isBattleOver && (
        <BattleResultModal
            victory={gameState.battle.victory}
            onClose={returnToExploration}
        />
      )}

      {gameState.mode === 'exploration' && (
        <BottomBar
            gameState={gameState}
            isLoading={isLoading}
            error={error}
            onExplorationAction={handleExplorationAction}
            onNavClick={openModal}
            onMapClick={() => setIsMapOpen(true)}
            onInteractClick={() => setIsInteractionModalOpen(true)}
            onTelepathyClick={() => setIsTelepathyModalOpen(true)}
            onSystemClick={() => setIsSaveLoadModalOpen(true)}
            onQuestClick={() => setIsQuestLogModalOpen(true)}
            onBusinessClick={() => setIsBusinessModalOpen(true)}
            onHospitalClick={() => setIsHospitalModalOpen(true)}
            onBountyBoardClick={() => setIsBountyBoardOpen(true)}
            onNextDay={handleNextDay}
        />
      )}

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

      {activeModal && <Modal activeModal={activeModal} onClose={closeModal} playerProfile={gameState.playerProfile} setPlayerProfile={setPlayerProfile} leaderboards={gameState.leaderboards} onMatchFound={handleMatchFound} />}
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
                setGameState(prevState => ({...prevState, exploration: {...prevState.exploration, pendingChallenge: null}}))
            }}
        />
      )}
      {isMapOpen && (
        <MapModal
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
      />
      <SaveLoadModal
        isOpen={isSaveLoadModalOpen}
        onClose={() => setIsSaveLoadModalOpen(false)}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onImport={handleImport}
        getSaves={storageService.getAllSaves}
      />

      <QuestLogModal
        isOpen={isQuestLogModalOpen}
        onClose={() => setIsQuestLogModalOpen(false)}
        quests={gameState.playerProfile.quests}
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
        />
      )}
    </div>
  );
};

export default App;