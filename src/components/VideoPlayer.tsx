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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.95)',
        cursor: showControls ? 'default' : 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Title bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '14px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '70%',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <X style={{ width: 24, height: 24 }} />
          </button>
        </div>

        {/* Video */}
        <div
          onClick={togglePlay}
          style={{ 
            position: 'relative', 
            cursor: 'pointer',
            backgroundColor: '#000',
            width: '100%',
            aspectRatio: '16/9',
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            src={url}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              display: 'block' 
            }}
            playsInline
          />

          {/* Big center play icon when paused */}
          {!isPlaying && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(220,38,38,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)',
              }}>
                <Play style={{ width: 32, height: 32, color: '#fff', marginLeft: '4px' }} />
              </div>
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div style={{
          padding: '16px 12px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}>
          {/* Progress bar with larger tap area */}
          <div
            ref={progressRef}
            onClick={seekTo}
            onTouchStart={(e) => { e.stopPropagation(); resetControlsTimer(); }}
            onTouchMove={seekTo}
            style={{
              width: '100%',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: '4px',
              position: 'relative',
            }}
          >
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              position: 'relative',
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#dc2626',
                borderRadius: '2px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '-4px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#dc2626',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                }} />
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px sm:gap-16' }}>
              <button onClick={togglePlay} style={btnStyle}>
                {isPlaying
                  ? <Pause style={{ width: 22, height: 22, color: '#fff' }} />
                  : <Play style={{ width: 22, height: 22, color: '#fff', marginLeft: '2px' }} />
                }
              </button>
              <button onClick={replay} style={btnStyle}>
                <RotateCcw style={{ width: 18, height: 18, color: '#fff' }} />
              </button>
              <button onClick={toggleMute} style={btnStyle}>
                {isMuted
                  ? <VolumeX style={{ width: 22, height: 22, color: '#fff' }} />
                  : <Volume2 style={{ width: 22, height: 22, color: '#fff' }} />
                }
              </button>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <button onClick={toggleFullscreen} style={btnStyle}>
              <Maximize style={{ width: 20, height: 20, color: '#fff' }} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: 'none',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};
