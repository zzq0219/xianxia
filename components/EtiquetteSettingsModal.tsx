import React, { useState } from 'react';
import { EtiquetteScene, EtiquetteSettings, SCENE_NAMES } from '../types/etiquette';

interface EtiquetteSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: EtiquetteSettings;
    onSave: (settings: EtiquetteSettings) => void;
}

const EtiquetteSettingsModal: React.FC<EtiquetteSettingsModalProps> = ({
    isOpen,
    onClose,
    settings,
    onSave,
}) => {
    const [localSettings, setLocalSettings] = useState<EtiquetteSettings>(settings);

    const handleSceneToggle = (scene: EtiquetteScene) => {
        const newScenes = localSettings.enabledScenes.includes(scene)
            ? localSettings.enabledScenes.filter(s => s !== scene)
            : [...localSettings.enabledScenes, scene];
        setLocalSettings({ ...localSettings, enabledScenes: newScenes });
    };

    const handleSave = () => {
        onSave(localSettings);
    };

    const handleReset = () => {
        if (confirm('确定要恢复默认设置吗？')) {
            setLocalSettings({
                autoRefreshEnabled: true,
                refreshIntervalDays: 7,
                lastRefreshTime: settings.lastRefreshTime,
                languageEtiquetteCount: 5,
                behaviorDressEtiquetteCount: 5,
                enabledScenes: ['brothel', 'arena', 'alchemy', 'auction', 'intelligence', 'hospital', 'prison', 'etiquette_hall'],
                languageAspects: { addressing: true, requesting: true, thanking: true },
                behaviorAspects: { upperDress: true, lowerDress: true, accessories: true, entryEtiquette: true, servicePosture: true, specialActions: true },
                styleSettings: { shameLevel: 80, submissionLevel: 100, exposureLevel: 60 },
                autoDistribute: true,
                autoDeprecateOld: true,
                keepTopExecuted: 3,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="ornate-border border-pink-500/50 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />

                {/* 标题栏 */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                    <h2 className="text-xl font-bold text-pink-300 font-serif flex items-center gap-2">
                        <i className="fa-solid fa-gear"></i>
                        礼仪设计馆 - 设置
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-700/50 hover:bg-stone-600/50 text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                {/* 设置内容 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-xianxia">
                    {/* 自动刷新设置 */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            自动刷新设置
                        </h3>
                        <div className="space-y-4 pl-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">刷新周期 (天)</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={localSettings.refreshIntervalDays}
                                    onChange={(e) => setLocalSettings({ ...localSettings, refreshIntervalDays: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) })}
                                    className="w-20 px-3 py-1.5 bg-stone-700/50 border border-stone-600 rounded-lg text-white text-center focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                            <p className="text-xs text-gray-500">范围: 1-30天</p>
                        </div>
                    </section>

                    {/* 生成数量设置 */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-list-ol"></i>
                            每次生成数量
                        </h3>
                        <div className="space-y-4 pl-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">语言铁律</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={localSettings.languageEtiquetteCount}
                                        onChange={(e) => setLocalSettings({ ...localSettings, languageEtiquetteCount: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                                        className="w-20 px-3 py-1.5 bg-stone-700/50 border border-stone-600 rounded-lg text-white text-center focus:outline-none focus:border-pink-500/50"
                                    />
                                    <span className="text-gray-500 text-sm">条</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">行为着装铁律</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={localSettings.behaviorDressEtiquetteCount}
                                        onChange={(e) => setLocalSettings({ ...localSettings, behaviorDressEtiquetteCount: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                                        className="w-20 px-3 py-1.5 bg-stone-700/50 border border-stone-600 rounded-lg text-white text-center focus:outline-none focus:border-pink-500/50"
                                    />
                                    <span className="text-gray-500 text-sm">条</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 涉及场景 */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-map-location-dot"></i>
                            涉及场景 (勾选启用)
                        </h3>
                        <div className="grid grid-cols-3 gap-3 pl-4">
                            {(Object.entries(SCENE_NAMES) as [EtiquetteScene, string][]).map(([key, name]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={localSettings.enabledScenes.includes(key)}
                                        onChange={() => handleSceneToggle(key)}
                                        className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-pink-500 focus:ring-pink-500/50"
                                    />
                                    <span className="text-gray-300 group-hover:text-white transition-colors">{name}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* 涉及方面 - 语言 */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-comment-dots"></i>
                            涉及方面 - 语言
                        </h3>
                        <div className="grid grid-cols-3 gap-3 pl-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.languageAspects.addressing} onChange={(e) => setLocalSettings({ ...localSettings, languageAspects: { ...localSettings.languageAspects, addressing: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-pink-500 focus:ring-pink-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">称呼用语</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.languageAspects.requesting} onChange={(e) => setLocalSettings({ ...localSettings, languageAspects: { ...localSettings.languageAspects, requesting: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-pink-500 focus:ring-pink-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">请求/汇报用语</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.languageAspects.thanking} onChange={(e) => setLocalSettings({ ...localSettings, languageAspects: { ...localSettings.languageAspects, thanking: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-pink-500 focus:ring-pink-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">感谢/道歉用语</span>
                            </label>
                        </div>
                    </section>

                    {/* 涉及方面 - 行为着装 */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-shirt"></i>
                            涉及方面 - 行为着装
                        </h3>
                        <div className="grid grid-cols-3 gap-3 pl-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.behaviorAspects.upperDress} onChange={(e) => setLocalSettings({ ...localSettings, behaviorAspects: { ...localSettings.behaviorAspects, upperDress: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-purple-500 focus:ring-purple-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">上身着装</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.behaviorAspects.lowerDress} onChange={(e) => setLocalSettings({ ...localSettings, behaviorAspects: { ...localSettings.behaviorAspects, lowerDress: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-purple-500 focus:ring-purple-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">下身着装</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.behaviorAspects.accessories} onChange={(e) => setLocalSettings({ ...localSettings, behaviorAspects: { ...localSettings.behaviorAspects, accessories: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-purple-500 focus:ring-purple-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">配饰要求</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.behaviorAspects.entryEtiquette} onChange={(e) => setLocalSettings({ ...localSettings, behaviorAspects: { ...localSettings.behaviorAspects, entryEtiquette: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-purple-500 focus:ring-purple-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">入场礼仪</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.behaviorAspects.servicePosture} onChange={(e) => setLocalSettings({ ...localSettings, behaviorAspects: { ...localSettings.behaviorAspects, servicePosture: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-purple-500 focus:ring-purple-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">服务姿态</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.behaviorAspects.specialActions} onChange={(e) => setLocalSettings({ ...localSettings, behaviorAspects: { ...localSettings.behaviorAspects, specialActions: e.target.checked } })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-purple-500 focus:ring-purple-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">特殊动作</span>
                            </label>
                        </div>
                    </section>

                    {/* 生成风格设置 */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-sliders"></i>
                            生成风格设置
                        </h3>
                        <div className="space-y-4 pl-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">羞耻程度</span>
                                    <span className="text-pink-300 font-mono">{localSettings.styleSettings.shameLevel}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={localSettings.styleSettings.shameLevel}
                                    onChange={(e) => setLocalSettings({ ...localSettings, styleSettings: { ...localSettings.styleSettings, shameLevel: parseInt(e.target.value) } })}
                                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">服从强度</span>
                                    <span className="text-purple-300 font-mono">{localSettings.styleSettings.submissionLevel}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={localSettings.styleSettings.submissionLevel}
                                    onChange={(e) => setLocalSettings({ ...localSettings, styleSettings: { ...localSettings.styleSettings, submissionLevel: parseInt(e.target.value) } })}
                                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">露出程度</span>
                                    <span className="text-red-300 font-mono">{localSettings.styleSettings.exposureLevel}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={localSettings.styleSettings.exposureLevel}
                                    onChange={(e) => setLocalSettings({ ...localSettings, styleSettings: { ...localSettings.styleSettings, exposureLevel: parseInt(e.target.value) } })}
                                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 高级设置 */}
                    <section>
                        <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-gears"></i>
                            高级设置
                        </h3>
                        <div className="space-y-3 pl-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.autoDistribute} onChange={(e) => setLocalSettings({ ...localSettings, autoDistribute: e.target.checked })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-cyan-500 focus:ring-cyan-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">新礼仪生成后自动下发到各部门</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={localSettings.autoDeprecateOld} onChange={(e) => setLocalSettings({ ...localSettings, autoDeprecateOld: e.target.checked })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-cyan-500 focus:ring-cyan-500/50" />
                                <span className="text-gray-300 group-hover:text-white transition-colors">旧礼仪在新周期开始时自动废除</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" checked={localSettings.keepTopExecuted > 0} onChange={(e) => setLocalSettings({ ...localSettings, keepTopExecuted: e.target.checked ? 3 : 0 })} className="w-4 h-4 rounded border-stone-600 bg-stone-700 text-cyan-500 focus:ring-cyan-500/50" />
                                <span className="text-gray-300">保留执行次数最高的</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={localSettings.keepTopExecuted}
                                    onChange={(e) => setLocalSettings({ ...localSettings, keepTopExecuted: Math.max(0, Math.min(10, parseInt(e.target.value) || 0)) })}
                                    disabled={localSettings.keepTopExecuted === 0}
                                    className="w-16 px-2 py-1 bg-stone-700/50 border border-stone-600 rounded text-white text-center text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                                />
                                <span className="text-gray-300">条礼仪</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 底部按钮 */}
                <div className="flex-shrink-0 p-4 border-t border-stone-700/50 bg-black/20 flex justify-between">
                    <button onClick={handleReset} className="px-4 py-2 bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 rounded-lg text-gray-300 hover:text-white transition-colors text-sm">
                        恢复默认
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 rounded-lg text-gray-300 hover:text-white transition-colors text-sm">
                            取消
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-lg text-white font-semibold text-sm transition-all duration-200">
                            保存设置
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
            </div>
        </div>
    );
};

export default EtiquetteSettingsModal;