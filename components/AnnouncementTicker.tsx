import React from 'react';
import { Announcement } from '../types';

interface AnnouncementTickerProps {
  announcements: Announcement[];
  onClick: () => void;
}

const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ announcements, onClick }) => {
  if (announcements.length === 0) {
    return null; // Don't render if there's nothing to show
  }

  const tickerText = announcements.map(a => `【${a.category}】 ${a.title}`).join('      ');
  
  return (
    <div 
      className="absolute top-16 left-0 right-0 h-8 bg-gradient-to-r from-amber-900/80 via-yellow-600/80 to-amber-900/80 z-10 flex items-center overflow-hidden cursor-pointer border-y-2 border-amber-400/50 shadow-lg pointer-events-auto"
      onClick={onClick}
    >
      <div className="whitespace-nowrap w-full flex">
        {/* We render the content twice for a seamless loop */}
        <p className="font-serif text-sm text-yellow-100 drop-shadow-sm shadow-black animate-marquee pr-12">
          {tickerText}
        </p>
        <p className="font-serif text-sm text-yellow-100 drop-shadow-sm shadow-black animate-marquee pr-12" aria-hidden="true">
          {tickerText}
        </p>
      </div>
    </div>
  );
};

export default AnnouncementTicker;
