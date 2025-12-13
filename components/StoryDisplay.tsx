import React from 'react';

interface StoryDisplayProps {
  story: string;
  storyEndRef: React.RefObject<HTMLDivElement>;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, storyEndRef }) => {
  return (
    <div className="w-full max-w-4xl h-full max-h-[70vh] overflow-y-auto p-6 ink-card rounded-lg relative">
      {/* 水墨装饰角 */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-gold-500/30" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-gold-500/30" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-gold-500/30" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-gold-500/30" />

      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="prose max-w-none prose-p:text-ink-200 prose-p:leading-[2] prose-headings:text-gold-400 prose-strong:text-gold-300 font-serif whitespace-pre-wrap animate-fade-in text-lg tracking-wide">
        {story}
      </div>
      <div ref={storyEndRef} />

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
    </div>
  );
};

export default StoryDisplay;