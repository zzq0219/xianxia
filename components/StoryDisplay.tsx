import React from 'react';

interface StoryDisplayProps {
  story: string;
  storyEndRef: React.RefObject<HTMLDivElement>;
}

const CornerDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={`absolute w-16 h-16 text-xianxia-gold-500/40 pointer-events-none ${className}`} style={style} viewBox="0 0 100 100" fill="currentColor">
    <path d="M0,0 L30,0 L30,5 L5,5 L5,30 L0,30 Z" />
    <path d="M10,10 L35,10 L35,12 L12,12 L12,35 L10,35 Z" opacity="0.6" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, storyEndRef }) => {
  return (
    <div className="relative w-full max-w-6xl h-full flex flex-col group">
      {/* 背景层 */}
      <div className="absolute inset-0 bg-stone-950/90 rounded-xl border-2 border-xianxia-gold-700/30 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* 背景渐变与纹理 */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-transparent to-stone-900/30 pointer-events-none" />
      </div>

      {/* 装饰层 - 独立于背景，确保不受内部布局影响 */}
      <div className="absolute inset-0 pointer-events-none z-20 rounded-xl overflow-hidden">
        {/* 内层装饰边框 */}
        <div className="absolute inset-1 border border-xianxia-gold-500/20 rounded-lg" />

        {/* 角落装饰 - 使用 scale 代替 rotate 以增强兼容性 */}
        <CornerDecoration className="top-0 left-0" />
        <CornerDecoration className="top-0 right-0" style={{ transform: 'scaleX(-1)' }} />
        <CornerDecoration className="bottom-0 right-0" style={{ transform: 'scale(-1, -1)' }} />
        <CornerDecoration className="bottom-0 left-0" style={{ transform: 'scaleY(-1)' }} />

        {/* 顶部光晕装饰 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-xianxia-gold-500/30 blur-sm" />

        {/* 底部继续指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <svg className="w-6 h-6 text-xianxia-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 滚动内容区域 */}
      <div className="relative z-10 w-full h-full overflow-y-auto scrollbar-xianxia p-4 sm:p-8">
        <div className="prose max-w-none prose-p:text-stone-100 prose-p:leading-loose prose-p:tracking-widest prose-headings:text-amber-300 prose-headings:font-xianxia prose-strong:text-amber-200 whitespace-pre-wrap animate-fade-in text-sm sm:text-base md:text-lg text-stone-100 selection:bg-amber-900/50 selection:text-amber-100 font-xianxia text-shadow-sm">
          {story}
        </div>
        <div ref={storyEndRef} />
      </div>
    </div>
  );
};

export default StoryDisplay;