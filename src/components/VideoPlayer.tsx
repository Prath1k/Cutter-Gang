'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

type VideoPlayerProps = {
  url: string;
  title: string;
  onClose: () => void;
};

export function VideoPlayer({ url, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoaded = () => setDuration(video.duration);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('ended', onEnded);

    video.play().catch(() => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'm') toggleMute();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, isMuted]);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    
    let clientX = 0;
    if ('clientX' in e) {
      clientX = e.clientX;
    } else {
      clientX = e.touches[0].clientX;
    }
    
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = percent * video.duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return createPortal(
    <div
      onClick={onClose}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 transition-opacity duration-300 ${showControls ? 'cursor-default' : 'cursor-none'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-screen flex flex-col justify-center"
      >
        {/* Title bar */}
        <div className={`flex items-center justify-between p-4 sm:p-6 transition-opacity duration-300 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest truncate max-w-[70%] drop-shadow-md">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 border-none rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Video Container */}
        <div
          onClick={togglePlay}
          className="relative cursor-pointer bg-black w-full flex items-center justify-center overflow-hidden sm:rounded-3xl shadow-2xl"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          <video
            ref={videoRef}
            src={url}
            className="max-w-full max-h-full block object-contain aspect-auto h-auto"
            playsInline
          />

          {/* Big center play icon when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl shadow-red-600/40 transform hover:scale-110 transition-transform">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1.5" />
              </div>
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className={`p-4 sm:p-8 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute bottom-0 left-0 right-0 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress bar with larger tap area */}
          <div
            ref={progressRef}
            onClick={seekTo}
            onTouchStart={(e) => { e.stopPropagation(); resetControlsTimer(); }}
            onTouchMove={seekTo}
            className="w-full h-6 flex items-center cursor-pointer mb-2 relative group/progress"
          >
            <div className="w-full h-1 sm:h-1.5 bg-white/20 rounded-full relative overflow-hidden">
              <div 
                className="h-full bg-red-600 rounded-full relative transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full shadow-lg border border-white/20 opacity-0 group-hover/progress:opacity-100" />
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={togglePlay} className="control-btn p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90">
                {isPlaying
                  ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                  : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
                }
              </button>
              <button onClick={replay} className="control-btn p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={toggleMute} className="control-btn p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90">
                {isMuted
                  ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                  : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                }
              </button>
              <span className="text-white text-[10px] sm:text-xs font-black tracking-widest font-mono opacity-80 whitespace-nowrap hidden xs:block">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <button onClick={toggleFullscreen} className="control-btn p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90">
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

