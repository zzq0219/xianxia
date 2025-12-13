import React, { useState } from 'react';

/**
 * 动画效果展示组件
 * 演示所有可用的动画效果和使用场景
 */

export const AnimationShowcase: React.FC = () => {
    const [showEffect, setShowEffect] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-950 to-black p-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* 标题 */}
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-gradient-gold text-shadow-glow mb-4">
                        ✨ 仙侠UI动画效果展示 ✨
                    </h1>
                    <p className="text-gray-400">
                        点击下方卡片查看各种动画效果的实际应用
                    </p>
                </header>

                {/* 1. 脉冲动画 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400">1. 脉冲动画</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="ornate-border border-xianxia-gold-600 p-6 bg-stone-800/50 rounded-xl animate-pulse-glow">
                            <h3 className="text-lg font-bold text-xianxia-gold-300 mb-2">脉冲发光</h3>
                            <p className="text-gray-400 text-sm mb-3">用于传说级物品、重要通知</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-pulse-glow
                            </code>
                        </div>

                        <div className="ornate-border border-blue-500 p-6 bg-stone-800/50 rounded-xl animate-pulse-fast">
                            <h3 className="text-lg font-bold text-blue-300 mb-2">快速脉冲</h3>
                            <p className="text-gray-400 text-sm mb-3">用于警告、紧急状态</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-pulse-fast
                            </code>
                        </div>

                        <div className="ornate-border border-green-500 p-6 bg-stone-800/50 rounded-xl">
                            <h3 className="text-lg font-bold text-green-300 mb-2">标准脉冲</h3>
                            <p className="text-gray-400 text-sm mb-3">Tailwind内置，柔和变化</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-pulse
                            </code>
                        </div>
                    </div>
                </section>

                {/* 2. 旋转动画 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400">2. 旋转动画</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="ornate-border border-purple-500 p-6 bg-stone-800/50 rounded-xl text-center">
                            <div className="text-6xl animate-spin inline-block mb-4">⚔️</div>
                            <h3 className="text-lg font-bold text-purple-300 mb-2">标准旋转</h3>
                            <p className="text-gray-400 text-sm mb-3">用于加载状态</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-spin
                            </code>
                        </div>

                        <div className="ornate-border border-pink-500 p-6 bg-stone-800/50 rounded-xl text-center">
                            <div className="text-6xl animate-spin-slow inline-block mb-4">🌟</div>
                            <h3 className="text-lg font-bold text-pink-300 mb-2">慢速旋转</h3>
                            <p className="text-gray-400 text-sm mb-3">用于装饰元素</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-spin-slow
                            </code>
                        </div>

                        <div className="ornate-border border-amber-500 p-6 bg-stone-800/50 rounded-xl text-center">
                            <div className="text-6xl animate-spin-reverse inline-block mb-4">🔮</div>
                            <h3 className="text-lg font-bold text-amber-300 mb-2">反向旋转</h3>
                            <p className="text-gray-400 text-sm mb-3">用于特殊效果</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-spin-reverse
                            </code>
                        </div>
                    </div>
                </section>

                {/* 3. 位移动画 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400">3. 位移动画</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="ornate-border border-cyan-500 p-6 bg-stone-800/50 rounded-xl text-center">
                            <div className="text-6xl animate-float inline-block mb-4">☁️</div>
                            <h3 className="text-lg font-bold text-cyan-300 mb-2">漂浮</h3>
                            <p className="text-gray-400 text-sm mb-3">用于悬浮元素</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-float
                            </code>
                        </div>

                        <div className="ornate-border border-red-500 p-6 bg-stone-800/50 rounded-xl text-center">
                            <button
                                onClick={() => setShowEffect('shake')}
                                className="text-6xl mb-4 animate-shake"
                                key={showEffect === 'shake' ? Date.now() : 'shake'}
                            >
                                ⚠️
                            </button>
                            <h3 className="text-lg font-bold text-red-300 mb-2">震动</h3>
                            <p className="text-gray-400 text-sm mb-3">用于错误、警告（点击触发）</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-shake
                            </code>
                        </div>

                        <div className="ornate-border border-emerald-500 p-6 bg-stone-800/50 rounded-xl text-center">
                            <button
                                onClick={() => setShowEffect('bounce')}
                                className="text-6xl mb-4 animate-bounce"
                                key={showEffect === 'bounce' ? Date.now() : 'bounce'}
                            >
                                ⬆️
                            </button>
                            <h3 className="text-lg font-bold text-emerald-300 mb-2">弹跳</h3>
                            <p className="text-gray-400 text-sm mb-3">用于提示向上滚动</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                animate-bounce
                            </code>
                        </div>
                    </div>
                </section>

                {/* 4. 进入动画 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400">4. 进入动画</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div
                            className="ornate-border border-indigo-500 p-6 bg-stone-800/50 rounded-xl animate-fade-in-up"
                            key={showEffect === 'fadeInUp' ? Date.now() : 'fadeInUp'}
                        >
                            <h3 className="text-lg font-bold text-indigo-300 mb-2">淡入上移</h3>
                            <p className="text-gray-400 text-sm mb-3">用于弹窗、卡片显示</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block mb-2">
                                animate-fade-in-up
                            </code>
                            <button
                                onClick={() => setShowEffect('fadeInUp')}
                                className="btn-secondary-enhanced text-sm"
                            >
                                重新播放
                            </button>
                        </div>

                        <div
                            className="ornate-border border-violet-500 p-6 bg-stone-800/50 rounded-xl animate-slide-in"
                            key={showEffect === 'slideIn' ? Date.now() : 'slideIn'}
                        >
                            <h3 className="text-lg font-bold text-violet-300 mb-2">滑入</h3>
                            <p className="text-gray-400 text-sm mb-3">用于模态框、侧边栏</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block mb-2">
                                animate-slide-in
                            </code>
                            <button
                                onClick={() => setShowEffect('slideIn')}
                                className="btn-secondary-enhanced text-sm"
                            >
                                重新播放
                            </button>
                        </div>
                    </div>
                </section>

                {/* 5. 特殊效果 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400">5. 特殊光效</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="ornate-border border-yellow-500 p-6 bg-stone-800/50 rounded-xl relative overflow-hidden">
                            <h3 className="text-lg font-bold text-yellow-300 mb-2">闪光扫过</h3>
                            <p className="text-gray-400 text-sm mb-3">用于卡片悬停效果</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                shimmer-effect
                            </code>
                            <div className="shimmer-effect" />
                        </div>

                        <div className="ornate-border-legendary border-xianxia-gold-400 p-6 bg-stone-800/50 rounded-xl card-legendary-glow">
                            <h3 className="text-lg font-bold text-xianxia-gold-300 mb-2">传说级发光</h3>
                            <p className="text-gray-400 text-sm mb-3">用于传说级物品</p>
                            <code className="text-xs bg-stone-900 p-2 rounded block">
                                card-legendary-glow
                            </code>
                        </div>
                    </div>
                </section>

                {/* 6. 3D效果 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400">6. 3D交互效果</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="card-3d-hover ornate-border border-sky-500 p-6 bg-stone-800/50 rounded-xl cursor-pointer">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎴</div>
                                <h3 className="text-lg font-bold text-sky-300 mb-2">3D卡片</h3>
                                <p className="text-gray-400 text-sm mb-3">悬停查看3D倾斜效果</p>
                                <code className="text-xs bg-stone-900 p-2 rounded block">
                                    card-3d-hover
                                </code>
                            </div>
                        </div>

                        <div className="ornate-border border-rose-500 p-6 bg-stone-800/50 rounded-xl hover:scale-110 transition-transform duration-300 cursor-pointer">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎯</div>
                                <h3 className="text-lg font-bold text-rose-300 mb-2">缩放效果</h3>
                                <p className="text-gray-400 text-sm mb-3">悬停查看放大效果</p>
                                <code className="text-xs bg-stone-900 p-2 rounded block">
                                    hover:scale-110
                                </code>
                            </div>
                        </div>

                        <div className="ornate-border border-teal-500 p-6 bg-stone-800/50 rounded-xl hover:rotate-3 transition-transform duration-300 cursor-pointer">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎪</div>
                                <h3 className="text-lg font-bold text-teal-300 mb-2">旋转效果</h3>
                                <p className="text-gray-400 text-sm mb-3">悬停查看旋转效果</p>
                                <code className="text-xs bg-stone-900 p-2 rounded block">
                                    hover:rotate-3
                                </code>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. 组合效果示例 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400">7. 组合效果示例</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* 传说级抽卡效果 */}
                        <div className="ornate-border-legendary border-xianxia-gold-400 p-8 bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl card-legendary-glow animate-pulse-glow card-3d-hover cursor-pointer relative overflow-hidden">
                            <div className="relative z-10 text-center">
                                <div className="text-7xl mb-4 animate-float">✨</div>
                                <h3 className="text-2xl font-bold text-gradient-gold text-shadow-glow mb-2">
                                    传说级效果
                                </h3>
                                <p className="text-gray-300 text-sm mb-4">
                                    组合多种动画：发光 + 脉冲 + 3D + 闪光
                                </p>
                                <div className="space-y-2 text-xs">
                                    <code className="bg-stone-900 p-2 rounded block">ornate-border-legendary</code>
                                    <code className="bg-stone-900 p-2 rounded block">card-legendary-glow</code>
                                    <code className="bg-stone-900 p-2 rounded block">animate-pulse-glow</code>
                                    <code className="bg-stone-900 p-2 rounded block">card-3d-hover</code>
                                </div>
                            </div>
                            <div className="shimmer-effect opacity-30" />
                        </div>

                        {/* Boss血条效果 */}
                        <div className="ornate-border border-blood-600 p-8 bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl shadow-glow-red">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-blood-400 text-shadow-glow mb-2">
                                    👹 Boss战斗效果
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    红色发光 + 分段血条 + 流动光效
                                </p>
                            </div>

                            {/* Boss血条 */}
                            <div className="relative h-8 rounded-lg bg-stone-900 border-2 border-blood-600 overflow-hidden">
                                <div className="absolute inset-0 flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex-1 border-r border-stone-700 last:border-r-0" />
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500" style={{ width: '65%' }}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-xs">
                                <code className="bg-stone-900 p-2 rounded block">shadow-glow-red</code>
                                <code className="bg-stone-900 p-2 rounded block">animate-shimmer</code>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 使用建议 */}
                <section className="ornate-border border-xianxia-gold-600 p-8 bg-gradient-to-br from-stone-800/80 to-stone-900/80 rounded-xl">
                    <h2 className="text-2xl font-bold text-xianxia-gold-400 mb-4">💡 使用建议</h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="text-xianxia-gold-400 text-xl">1.</span>
                            <span><strong>适度使用动画</strong> - 不要在所有元素上都添加动画，重点突出关键内容</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-xianxia-gold-400 text-xl">2.</span>
                            <span><strong>传说级效果要慎用</strong> - `card-legendary-glow` 等高强度效果仅用于真正的传说级内容</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-xianxia-gold-400 text-xl">3.</span>
                            <span><strong>注意性能</strong> - 大量同时播放的动画会影响性能，特别是在移动设备上</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-xianxia-gold-400 text-xl">4.</span>
                            <span><strong>组合使用</strong> - 多种动画效果组合可以创造更震撼的视觉体验</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-xianxia-gold-400 text-xl">5.</span>
                            <span><strong>根据场景选择</strong> - 战斗场景用红色发光，抽卡用金色发光，UI提示用蓝色发光</span>
                        </li>
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default AnimationShowcase;