'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

type VideoItem = {
  id: string;
  title: string;
  url: string | null;
};

export function VideoGrid({ items }: { items: VideoItem[] }) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {items.map((item, i) => (
          <div
            key={item.id}
            onClick={() => item.url && setActiveVideo(item)}
            className={`group relative aspect-[9/16] bg-neutral-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-neutral-800 hover:border-red-600 transition-colors duration-300 shadow-2xl ${item.url ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none"></div>

            {item.url ? (
              <>
                {/* Silent preview thumbnail */}
                <video
                  src={item.url}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.play();
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }
                  }}
                />
                {/* Play icon overlay - always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-red-600/95 flex items-center justify-center shadow-2xl shadow-red-600/40 transform scale-90 md:scale-100">
                    <Play className="w-7 h-7 md:w-10 md:h-10 text-white ml-1.5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-800 font-black text-3xl uppercase tracking-tighter opacity-20 select-none">
                GANG
              </div>
            )}

            {/* Bottom Info */}
            <div className="absolute bottom-6 left-6 right-6 z-30 flex flex-col items-start">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-2 shadow-lg">
                #CUTTER
              </span>
              <h3 className="text-white text-lg md:text-xl font-black leading-tight line-clamp-2 tracking-tight drop-shadow-lg uppercase">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {activeVideo && activeVideo.url && (
        <VideoPlayer
          url={activeVideo.url}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
