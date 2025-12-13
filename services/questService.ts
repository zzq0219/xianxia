import { PlayerProfile, Quest } from '../types';

/**
 * 将一个新任务添加到玩家的个人档案中。
 * 如果同ID的任务已存在，则不执行任何操作。
 * @param profile 玩家的个人档案。
 * @param newQuest 要添加的新任务。
 * @returns 更新后的玩家个人档案。
 */
export const addQuest = (profile: PlayerProfile, newQuest: Quest): PlayerProfile => {
    const questExists = profile.quests.some(q => q.id === newQuest.id);
    if (questExists) {
        return profile;
    }
    return {
        ...profile,
        quests: [...profile.quests, newQuest],
    };
};

/**
 * 更新指定任务的状态。
 * @param profile 玩家的个人档案。
 * @param questId 要更新的任务ID。
 * @param status 新的任务状态。
 * @returns 更新后的玩家个人档案。
 */
export const updateQuestStatus = (profile: PlayerProfile, questId: string, status: Quest['status']): PlayerProfile => {
    return {
        ...profile,
        quests: profile.quests.map(q =>
            q.id === questId ? { ...q, status } : q
        ),
    };
};

/**
 * 更新指定任务目标的进度。
 * @param profile 玩家的个人档案。
 * @param questId 任务ID。
 * @param objectiveId 目标ID。
 * @param currentCount 新的当前计数。
 * @returns 更新后的玩家个人档案。
 */
export const updateObjectiveProgress = (profile: PlayerProfile, questId: string, objectiveId: string, currentCount: number): PlayerProfile => {
    return {
        ...profile,
        quests: profile.quests.map(q => {
            if (q.id === questId) {
                const newObjectives = q.objectives.map(obj => {
                    if (obj.id === objectiveId) {
                        const isCompleted = obj.targetCount ? currentCount >= obj.targetCount : true;
                        return { ...obj, currentCount, isCompleted };
                    }
                    return obj;
                });
                return { ...q, objectives: newObjectives };
            }
            return q;
        }),
    };
};

/**
 * 检查任务是否完成所有目标
 * @param quest 要检查的任务
 * @returns 是否所有目标都已完成
 */
export const isQuestCompleted = (quest: Quest): boolean => {
    return quest.objectives.every(obj => obj.isCompleted);
};

/**
 * 将完成的任务标记为可领取状态
 * @param profile 玩家的个人档案
 * @param questId 要标记的任务ID
 * @returns 更新后的玩家个人档案
 */
export const markQuestClaimable = (profile: PlayerProfile, questId: string): PlayerProfile => {
    const quest = profile.quests.find(q => q.id === questId);
    if (!quest) return profile;
    
    // 检查所有目标是否完成
    if (!isQuestCompleted(quest)) {
        return profile;
    }
    
    return updateQuestStatus(profile, questId, 'Claimable');
};

/**
 * 领取任务奖励
 * @param profile 玩家的个人档案
 * @param questId 要领取的任务ID
 * @returns 更新后的玩家个人档案
 */
export const claimQuestRewards = (profile: PlayerProfile, questId: string): PlayerProfile => {
    const quest = profile.quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'Claimable') return profile;

    let newProfile = { ...profile };

    // 发放灵石奖励
    if (quest.rewards.spiritStones) {
        newProfile.spiritStones += quest.rewards.spiritStones;
    }
    
    // 发放声望奖励
    if (quest.rewards.reputation) {
        newProfile.reputation.score += quest.rewards.reputation;
    }
    
    // 发放物品奖励
    if (quest.rewards.items && quest.rewards.items.length > 0) {
        quest.rewards.items.forEach(item => {
            if ('stats' in item) {
                // 这是装备
                newProfile.equipmentInventory.push({ ...item, id: `${item.id}_${Date.now()}_${Math.random()}` });
            } else if ('cost' in item) {
                // 这是技能
                newProfile.universalSkills.push(item);
            }
        });
    }

    // 更新任务状态为已完成
    newProfile = updateQuestStatus(newProfile, questId, 'Completed');

    return newProfile;
};

/**
 * @deprecated 使用 markQuestClaimable 和 claimQuestRewards 代替
 * 完成一个任务，发放奖励，并更新任务状态。
 * @param profile 玩家的个人档案。
 * @param questId 要完成的任务ID。
 * @returns 更新后的玩家个人档案。
 */
export const completeQuest = (profile: PlayerProfile, questId: string): PlayerProfile => {
    // 向后兼容：直接标记为可领取状态
    return markQuestClaimable(profile, questId);
};