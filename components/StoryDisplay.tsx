import React from 'react';

interface StoryDisplayProps {
  story: string;
  storyEndRef: React.RefObject<HTMLDivElement>;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, storyEndRef }) => {
  return (
    <div className="w-full max-w-4xl h-full max-h-[70vh] scrollbar-enhanced overflow-y-auto p-6 bg-stone-950/70 rounded-xl border border-stone-700/50 shadow-2xl backdrop-blur-md">
      <div className="prose max-w-none prose-p:text-gray-200 prose-p:leading-loose prose-headings:text-amber-400 prose-strong:text-amber-200 font-serif whitespace-pre-wrap animate-fade-in text-lg">
        {story}
      </div>
      <div ref={storyEndRef} />
    </div>
  );
};

export default StoryDisplay;