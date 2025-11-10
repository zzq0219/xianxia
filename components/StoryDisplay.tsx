import React from 'react';

interface StoryDisplayProps {
  story: string;
  storyEndRef: React.RefObject<HTMLDivElement>;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, storyEndRef }) => {
  return (
    <div className="w-full max-w-4xl h-full scroll-container overflow-y-auto">
      <div className="prose max-w-none prose-p:text-stone-800 prose-p:leading-loose prose-headings:text-amber-800 font-serif whitespace-pre-wrap animate-fade-in">
        {story}
      </div>
      <div ref={storyEndRef} />
    </div>
  );
};

export default StoryDisplay;