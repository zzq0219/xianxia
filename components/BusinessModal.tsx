import React, { useState, useMemo } from 'react';
import { PlayerProfile, CharacterCard, Shop, Staff } from '../types';
import { POSITIONS } from '../constants';
import { calculateBusinessIncome } from '../services/utils';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onUpdateProfile: (newProfile: PlayerProfile) => void;
  onOpenSurveillance: (shop: Shop) => void;
}

const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose, playerProfile, onUpdateProfile, onOpenSurveillance }) => {
  const [activeTab, setActiveTab] = useState<string>('青楼');
  const { businessDistrict, cardCollection } = playerProfile;

  const dailyIncomeByShop = useMemo(() => {
    if (!businessDistrict) return {};
    const incomeMap: Record<string, number> = {};
    businessDistrict.shops.forEach(shop => {
        incomeMap[shop.id] = calculateBusinessIncome(playerProfile, shop.id);
    });
    return incomeMap;
  }, [playerProfile, businessDistrict]);

  if (!isOpen) return null;

  const getAvailableStaff = (): CharacterCard[] => {
    if (!businessDistrict) return cardCollection;
    const assignedIds = new Set(businessDistrict.shops.flatMap(s => s.staff.map(st => st.characterId)));
    return cardCollection.filter(c => !assignedIds.has(c.id));
  };

  const handleAssignStaff = (shopId: string, positionId: string, characterId: string) => {
    if (!businessDistrict) return;

    const newDistrict = JSON.parse(JSON.stringify(businessDistrict));
    const shop = newDistrict.shops.find((s: Shop) => s.id === shopId);
    if (shop) {
      // Remove from other positions first if already assigned
      newDistrict.shops.forEach((s: Shop) => {
        s.staff = s.staff.filter((st: Staff) => st.characterId !== characterId);
      });
      // Add to the new position
      shop.staff.push({ characterId, positionId });
      onUpdateProfile({ ...playerProfile, businessDistrict: newDistrict });
    }
  };

  const handleUnassignStaff = (shopId: string, characterId: string) => {
    if (!businessDistrict) return;
    const newDistrict = JSON.parse(JSON.stringify(businessDistrict));
    const shop = newDistrict.shops.find((s: Shop) => s.id === shopId);
    if (shop) {
      shop.staff = shop.staff.filter((st: Staff) => st.characterId !== characterId);
      onUpdateProfile({ ...playerProfile, businessDistrict: newDistrict });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
          <h2 className="text-2xl font-bold text-amber-300 font-serif">
            {businessDistrict ? businessDistrict.name : '产业管理'}
          </h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        {businessDistrict ? (
          <div className="flex-grow p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Panel: Stats & Logs */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                  <h3 className="font-semibold text-amber-400 mb-2">街区总览</h3>
                  <p className="text-gray-300">等级: <span className="font-mono">{businessDistrict.level}</span></p>
                  <p className="text-gray-300">店铺数量: <span className="font-mono">{businessDistrict.shops.length}</span></p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50 h-96 overflow-y-auto">
                  <h3 className="font-semibold text-amber-400 mb-2">经营日志</h3>
                  <ul className="space-y-2 text-sm">
                    {businessDistrict.log.map((entry, index) => (
                      <li key={index} className="text-gray-400">
                        <span className="font-mono text-gray-500 mr-2">[{entry.timestamp}]</span>
                        {entry.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Panel: Shops */}
              <div className="md:col-span-2">
                <div className="flex border-b border-stone-700 mb-4">
                  {['青楼', '角斗场', '炼丹房', '拍卖行', '情报阁'].map(tabName => {
                    const shopExists = businessDistrict.shops.some(s => s.type === tabName);
                    return (
                      <button
                        key={tabName}
                        disabled={!shopExists}
                        onClick={() => setActiveTab(tabName)}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 disabled:text-gray-600 disabled:cursor-not-allowed ${
                            activeTab === tabName
                            ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400'
                            : 'bg-transparent text-gray-400 hover:bg-stone-700/50'
                        }`}
                      >
                        {tabName}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                    {businessDistrict.shops.filter(s => s.type === activeTab).map(shop => (
                        <div key={shop.id} className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-lg text-cyan-400">{shop.type} (Lv. {shop.level})</h3>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-gray-400">预期日收入: <span className="font-mono text-amber-400">{dailyIncomeByShop[shop.id] || 0} 灵石</span></p>
                                    <button onClick={() => onOpenSurveillance(shop)} className="text-xs bg-purple-600/50 text-purple-300 px-2 py-1 rounded-md hover:bg-purple-600/80">监视</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                            {Object.entries(POSITIONS)
                                .filter(([, posDetails]) => posDetails.shop === shop.type)
                                .map(([posId, posDetails]) => {
                                const assignedStaff = shop.staff.find(s => s.positionId === posId);
                                const character = assignedStaff ? cardCollection.find(c => c.id === assignedStaff.characterId) : null;
                                return (
                                    <div key={posId} className="flex items-center justify-between bg-stone-800/50 p-2 rounded-md">
                                    <span className="text-gray-300">{posDetails.name}</span>
                                    {character ? (
                                        <div className="flex items-center gap-2">
                                        <span className="text-amber-300">{character.name}</span>
                                        <button onClick={() => handleUnassignStaff(shop.id, character.id)} className="text-red-500 hover:text-red-400 text-xs">卸下</button>
                                        </div>
                                    ) : (
                                        <select onChange={(e) => handleAssignStaff(shop.id, posId, e.target.value)} className="bg-stone-700 text-white text-sm rounded">
                                        <option value="">选择员工</option>
                                        {getAvailableStaff().map(char => (
                                            <option key={char.id} value={char.id}>{char.name}</option>
                                        ))}
                                        </select>
                                    )}
                                    </div>
                                );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-4xl mb-4">🏯</p>
              <p>你还未拥有自己的产业。</p>
              <p className="text-sm mt-2">完成特定任务或积累足够资本，开启你的商业帝国吧！</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessModal;