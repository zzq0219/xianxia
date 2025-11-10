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
 * 完成一个任务，发放奖励，并更新任务状态。
 * @param profile 玩家的个人档案。
 * @param questId 要完成的任务ID。
 * @returns 更新后的玩家个人档案。
 */
export const completeQuest = (profile: PlayerProfile, questId: string): PlayerProfile => {
    const quest = profile.quests.find(q => q.id === questId);
    if (!quest) return profile;

    let newProfile = { ...profile };

    // 发放奖励
    if (quest.rewards.spiritStones) {
        newProfile.spiritStones += quest.rewards.spiritStones;
    }
    if (quest.rewards.reputation) {
        newProfile.reputation.score += quest.rewards.reputation;
    }
    // 注意：物品奖励需要更复杂的逻辑来处理库存，此处暂不实现

    // 更新任务状态
    newProfile = updateQuestStatus(newProfile, questId, 'Completed');

    return newProfile;
};