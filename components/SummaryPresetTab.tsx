import React from 'react';

interface SummaryPresetTabProps {
    prompts: {
        small: string;
        large: string;
    };
    onPromptsChange: (newPrompts: { small: string; large: string }) => void;
}

const SummaryPresetTab: React.FC<SummaryPresetTabProps> = ({ prompts, onPromptsChange }) => {
    return (
        <div className="space-y-6 text-white">
            <div>
                <h4 className="text-lg font-semibold text-purple-300 mb-2">小总结预设</h4>
                <p className="text-xs text-gray-400 mb-2">
                    这个预设将用于生成实时记录的小总结。你可以使用 `&#123;category&#125;` 占位符来动态插入当前分类。
                </p>
                <textarea
                    value={prompts.small}
                    onChange={(e) => onPromptsChange({ ...prompts, small: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 bg-stone-800/60 border border-stone-600 rounded-md text-sm text-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>
            <div>
                <h4 className="text-lg font-semibold text-indigo-300 mb-2">大总结预设</h4>
                <p className="text-xs text-gray-400 mb-2">
                    这个预设将用于把多个小总结合并成一个大总结。你可以使用 `&#123;category&#125;` 占位符。
                </p>
                <textarea
                    value={prompts.large}
                    onChange={(e) => onPromptsChange({ ...prompts, large: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 bg-stone-800/60 border border-stone-600 rounded-md text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
        </div>
    );
};

export default SummaryPresetTab;