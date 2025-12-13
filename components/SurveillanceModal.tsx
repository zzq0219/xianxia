import { aiMessageCapture } from '@/services/aiMessageCapture';
import React, { useState } from 'react';
import { POSITIONS } from '../constants';
import { generateStaffInteraction, generateStaffSurveillanceReport } from '../services/tavernService';
import { CharacterCard, Shop } from '../types';

interface SurveillanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
  cardCollection: CharacterCard[];
}

const SurveillanceModal: React.FC<SurveillanceModalProps> = ({ isOpen, onClose, shop, cardCollection }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterCard | null>(null);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 互动相关状态
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [interactionInput, setInteractionInput] = useState<string>('');
  const [interactionHistory, setInteractionHistory] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);
  const [isGeneratingReply, setIsGeneratingReply] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartInteraction = () => {
    setIsInteracting(true);
    setInteractionHistory([]);
    setInteractionInput('');
  };

  const handleSendInteraction = async () => {
    if (!selectedCharacter || !interactionInput.trim()) return;

    // 添加用户消息到历史
    const newHistory = [...interactionHistory, { role: 'user' as const, content: interactionInput }];
    setInteractionHistory(newHistory);
    setIsGeneratingReply(true);

    try {
      // 构建上下文（保留最近3轮对话）
      const context = newHistory
        .slice(-6)
        .map(h => `${h.role === 'user' ? '玩家' : selectedCharacter.name}: ${h.content}`)
        .join('\n');

      // 找到角色的岗位名称
      const positionEntry = Object.entries(POSITIONS)
        .find(([posId]) => {
          const assignedStaff = shop.staff.find(s => s.positionId === posId);
          return assignedStaff?.characterId === selectedCharacter.id;
        });

      const positionName = positionEntry ? positionEntry[1].name : '未知岗位';

      // 生成AI回复
      const reply = await generateStaffInteraction(
        selectedCharacter,
        positionName,
        interactionInput,
        context
      );

      // 添加AI回复到历史
      setInteractionHistory([...newHistory, { role: 'ai', content: reply }]);
      setInteractionInput('');

      // 触发AI消息捕获，记录到"商业"类别
      aiMessageCapture.setCurrentScene('surveillance');
      aiMessageCapture.captureMessage(reply, 'surveillance');

    } catch (error) {
      console.error("互动生成失败:", error);
      alert("互动失败，请重试");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleCloseInteraction = () => {
    setIsInteracting(false);
    setInteractionHistory([]);
    setInteractionInput('');
  };

  const handleCharacterSelect = async (character: CharacterCard, positionName: string) => {
    setSelectedCharacter(character);
    setIsLoading(true);
    setReport('');
    try {
      const generatedReport = await generateStaffSurveillanceReport(character, positionName);
      setReport(generatedReport);
    } catch (error) {
      console.error("Failed to generate surveillance report:", error);
      setReport("监视水晶似乎被一股神秘的力量干扰了...");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-900 w-full max-w-3xl h-[70vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
          <h2 className="text-2xl font-bold text-amber-300 font-serif">监视 {shop.type}</h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div className="flex-grow p-6 flex gap-6 overflow-hidden">
          {/* Left Panel: Staff List */}
          <div className="w-1/3 flex-shrink-0 space-y-3 overflow-y-auto">
            {Object.entries(POSITIONS)
              .filter(([, posDetails]) => posDetails.shop === shop.type)
              .map(([posId, posDetails]) => {
                const assignedStaff = shop.staff.find(s => s.positionId === posId);
                const character = assignedStaff ? cardCollection.find(c => c.id === assignedStaff.characterId) : null;
                return (
                  <div key={posId}>
                    <h4 className="text-amber-400 font-semibold mb-1">{posDetails.name}</h4>
                    {character ? (
                      <button
                        onClick={() => handleCharacterSelect(character, posDetails.name)}
                        className={`w-full text-left p-2 rounded-md transition-colors ${selectedCharacter?.id === character.id ? 'bg-amber-600/50' : 'bg-stone-800/70 hover:bg-stone-700/90'}`}
                      >
                        {character.name}
                      </button>
                    ) : (
                      <div className="p-2 text-gray-500 italic text-sm">空缺</div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Right Panel: Report or Interaction */}
          <div className="w-2/3 bg-black/30 rounded-lg p-4 overflow-y-auto border border-stone-700">
            {isInteracting ? (
              // 互动模式
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-600">
                  <h3 className="text-amber-400 font-semibold">
                    与 {selectedCharacter?.name} 互动
                  </h3>
                  <button
                    onClick={handleCloseInteraction}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>

                {/* 对话历史 */}
                <div className="flex-1 overflow-y-auto mb-3 space-y-2">
                  {interactionHistory.length === 0 ? (
                    <p className="text-center text-gray-500 italic">
                      开始与{selectedCharacter?.name}交流...
                    </p>
                  ) : (
                    interactionHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${msg.role === 'user'
                            ? 'bg-blue-900/30 ml-8'
                            : 'bg-amber-900/20 mr-8'
                          }`}
                      >
                        <div className="text-xs text-gray-400 mb-1">
                          {msg.role === 'user' ? '你' : selectedCharacter?.name}
                        </div>
                        <div className="text-gray-200 text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isGeneratingReply && (
                    <div className="text-center text-amber-300 animate-pulse">
                      {selectedCharacter?.name} 正在回应...
                    </div>
                  )}
                </div>

                {/* 输入框 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interactionInput}
                    onChange={(e) => setInteractionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isGeneratingReply && handleSendInteraction()}
                    disabled={isGeneratingReply}
                    placeholder="输入你想说的话..."
                    className="flex-1 bg-stone-800 text-gray-200 px-3 py-2 rounded border border-stone-600 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendInteraction}
                    disabled={!interactionInput.trim() || isGeneratingReply}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                  >
                    {isGeneratingReply ? '生成中...' : '发送'}
                  </button>
                </div>
              </div>
            ) : (
              // 监视报告模式
              <>
                {isLoading ? (
                  <div className="text-center text-amber-300 animate-pulse">正在通过水晶窥探...</div>
                ) : report ? (
                  <>
                    <p className="text-gray-300 whitespace-pre-wrap font-serif leading-relaxed mb-4">{report}</p>
                    {selectedCharacter && (
                      <button
                        onClick={handleStartInteraction}
                        className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-comments"></i>
                        <span>参与互动</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 h-full flex items-center justify-center">
                    <p>选择一名员工进行监视。</p>
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

export default SurveillanceModal;