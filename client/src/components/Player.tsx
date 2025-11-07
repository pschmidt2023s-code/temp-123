import { usePlayer } from '@/store/usePlayer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  SpeakerHigh,
  Queue,
  Quotes,
  Heart,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect, memo, useRef } from 'react';
import { musicKit } from '@/lib/musickit';
import { useMKPlayback } from '@/hooks/useMKPlayback';
import { useMediaSession } from '@/hooks/useMediaSession';
import { LyricsOverlay } from './LyricsOverlay';
import { FullscreenPlayer } from './FullscreenPlayer';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';

function PlayerComponent() {
  const {
    queue,
    currentIndex,
    isPlaying,
    shuffle,
    repeat,
    volume,
    currentTime,
    duration,
    play,
    pause,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    seek,
    setDuration,
    setCurrentTime,
  } = usePlayer();

  const { seekToTime, skipToNext, skipToPrevious } = useMKPlayback();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // Enable Media Session API for iPhone Control Center
  useMediaSession();

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (info.offset.y < -100 || info.velocity.y < -300) {
      setShowFullscreen(true);
    }
  };

  const currentTrack = queue[currentIndex];
  const isDBRelease = currentTrack?.attributes?.url ? true : false;

  useEffect(() => {
    if (!audioRef.current || !isDBRelease || !currentTrack?.attributes?.url) return;
    
    const audio = audioRef.current;
    audio.src = currentTrack.attributes.url;
    audio.load();
    
    setCurrentTime(0);
  }, [currentIndex, currentTrack, isDBRelease, setCurrentTime]);

  useEffect(() => {
    if (!audioRef.current || !isDBRelease) return;
    audioRef.current.volume = volume / 100;
  }, [volume, isDBRelease]);

  useEffect(() => {
    if (queue[currentIndex]) {
      const track = queue[currentIndex];
      if (!isDBRelease) {
        const trackDuration = track.attributes.durationInMillis || 0;
        setDuration(trackDuration);
      }
    }
  }, [currentIndex, queue, setDuration, isDBRelease]);

  useEffect(() => {
    if (isDBRelease) return;

    let animationFrameId: number | null = null;
    let lastUpdateTime = performance.now();

    const updateProgress = (currentTime: number) => {
      const { currentTime: storeCurrentTime, duration, repeat } = usePlayer.getState();
      const now = performance.now();
      const deltaTime = now - lastUpdateTime;
      
      if (deltaTime >= 1000) {
        const newTime = storeCurrentTime + 1000;
        
        if (newTime < duration) {
          usePlayer.getState().setCurrentTime(newTime);
        } else if (newTime >= duration && storeCurrentTime < duration) {
          usePlayer.getState().setCurrentTime(duration);
          
          if (repeat === 'one') {
            usePlayer.getState().setCurrentTime(0);
          } else if (repeat === 'all') {
            usePlayer.getState().next();
          } else {
            usePlayer.getState().pause();
            usePlayer.getState().next();
          }
        }
        
        lastUpdateTime = now;
      }
      
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying && duration > 0) {
      lastUpdateTime = performance.now();
      animationFrameId = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, duration, isDBRelease]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime * 1000);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration * 1000);
    }
  };

  const handleAudioEnded = () => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeat === 'all') {
      next();
    } else {
      pause();
      next();
    }
  };


  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!audioRef.current || !isDBRelease) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.warn('HTML5 Audio play failed:', error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isDBRelease]);

  const handlePlayPause = async () => {
    if (isDBRelease) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      if (isPlaying) {
        pause();
        try {
          await musicKit.pause();
        } catch (error) {
          console.warn('MusicKit pause failed, using demo mode:', error);
        }
      } else {
        play();
        try {
          if (currentTrack) {
            await musicKit.play(currentTrack);
          }
        } catch (error) {
          console.warn('MusicKit play failed, using demo mode:', error);
        }
      }
    }
  };

  const handleNext = async () => {
    if (isDBRelease) {
      next();
    } else {
      try {
        await skipToNext();
        next();
      } catch (error) {
        console.warn('MusicKit skip failed, using demo mode:', error);
        next();
      }
    }
  };

  const handlePrevious = async () => {
    if (isDBRelease) {
      previous();
    } else {
      try {
        await skipToPrevious();
        previous();
      } catch (error) {
        console.warn('MusicKit skip failed, using demo mode:', error);
        previous();
      }
    }
  };

  const handleSeek = async (time: number) => {
    if (isDBRelease && audioRef.current) {
      audioRef.current.currentTime = time / 1000;
      seek(time);
    } else {
      try {
        await seekToTime(time);
        seek(time);
      } catch (error) {
        console.warn('MusicKit seek failed, using demo mode:', error);
        seek(time);
      }
    }
  };

  if (!currentTrack) {
    return null;
  }

  const artwork = currentTrack.attributes.artwork
    ? musicKit.getArtworkURL(currentTrack.attributes.artwork, 64)
    : '';

  return (
    <>
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
      />
      
      {showLyrics && currentTrack && (
        <LyricsOverlay
          songId={currentTrack.id}
          onClose={() => setShowLyrics(false)}
        />
      )}
      <AnimatePresence>
        {showFullscreen && (
          <FullscreenPlayer onClose={() => setShowFullscreen(false)} />
        )}
      </AnimatePresence>
      
      {!showFullscreen && (
        <motion.footer 
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.5, bottom: 0 }}
          onDragEnd={handleDragEnd}
          className="fixed left-0 right-0 px-2 md:px-4 bg-background/95 backdrop-blur-lg shadow-2xl border-t border-border touch-none"
          style={{ 
            bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
            height: '90px',
            zIndex: 70
          }}
          data-testid="player-bar"
        >
        <div className="h-full flex flex-col md:flex-row items-center justify-between gap-1 md:gap-4">
        {/* Left: Current Track Info */}
        <div className="hidden md:flex items-center gap-4 min-w-[180px] w-[30%]">
          {artwork && (
            <button
              onClick={() => setShowFullscreen(true)}
              className="shrink-0 transition-transform hover:scale-105 active:scale-95"
              data-testid="button-open-fullscreen-desktop"
            >
              <img
                src={artwork}
                alt={currentTrack.attributes.name}
                className="w-14 h-14 rounded object-cover cursor-pointer"
                data-testid="img-track-cover"
              />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate" data-testid="text-track-name">
              {currentTrack.attributes.name}
            </div>
            <div className="text-xs text-muted-foreground truncate" data-testid="text-track-artist">
              {currentTrack.attributes.artistName}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-primary"
            data-testid="button-like-track"
          >
            <Heart size={16} weight="bold" />
          </Button>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 md:gap-2 max-w-full md:max-w-[40%] w-full">
          {/* Mobile: Spotify-Style minimalistisch */}
          <div className="md:hidden w-full flex flex-col gap-2">
            {/* Obere Zeile: Cover + Info + Play */}
            <div className="flex items-center gap-3 px-3">
              {artwork && (
                <button
                  onClick={() => setShowFullscreen(true)}
                  className="shrink-0 transition-transform active:scale-95"
                  data-testid="button-open-fullscreen-mobile"
                >
                  <img
                    src={artwork}
                    alt={currentTrack.attributes.name}
                    className="w-12 h-12 rounded object-cover cursor-pointer"
                  />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-foreground truncate">
                  {currentTrack.attributes.name}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {currentTrack.attributes.artistName}
                </div>
              </div>
              <Button
                size="icon"
                onClick={handlePlayPause}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-12 h-12 rounded-full shrink-0"
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause size={28} weight="fill" /> : <Play size={28} weight="fill" />}
              </Button>
            </div>
            
            {/* Timeline UNTEN - volle Breite */}
            <div className="w-full px-3">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={([value]) => handleSeek(value)}
                className="w-full"
                data-testid="slider-progress"
              />
            </div>
          </div>
          
          {/* Desktop: Vollständige Controls */}
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className={shuffle ? 'text-primary' : 'text-muted-foreground'}
              data-testid="button-shuffle"
            >
              <Shuffle size={20} weight="bold" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="text-muted-foreground"
              data-testid="button-previous"
            >
              <SkipBack size={20} weight="bold" />
            </Button>

            <Button
              size="icon"
              onClick={handlePlayPause}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-8 h-8 rounded-full play-button-scale"
              data-testid="button-play-pause-desktop"
            >
              {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="text-muted-foreground"
              data-testid="button-next"
            >
              <SkipForward size={20} weight="bold" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRepeat}
              className={repeat !== 'off' ? 'text-primary' : 'text-muted-foreground'}
              data-testid="button-repeat"
            >
              <Repeat size={20} weight="bold" />
              {repeat === 'one' && (
                <span className="absolute text-[10px] font-bold">1</span>
              )}
            </Button>
          </div>

          {/* Desktop Progress Bar */}
          <div className="hidden md:flex w-full items-center gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right" data-testid="text-current-time">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={([value]) => handleSeek(value)}
              className="flex-1"
              data-testid="slider-progress"
            />
            <span className="text-xs text-muted-foreground w-10" data-testid="text-duration">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Extra Controls - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 justify-end min-w-[180px] w-[30%]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLyrics(!showLyrics)}
            className="text-muted-foreground"
            data-testid="button-lyrics"
          >
            <Quotes size={20} weight="bold" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            data-testid="button-queue"
          >
            <Queue size={20} weight="bold" />
          </Button>

          <div className="flex items-center gap-2">
            <SpeakerHigh size={20} weight="bold" className="text-muted-foreground" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={([value]) => setVolume(value)}
              className="w-24"
              data-testid="slider-volume"
            />
          </div>
        </div>
        
        {/* Drag Handle Indicator for Mobile */}
        <div className="md:hidden absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full" />
      </div>
      </motion.footer>
      )}
    </>
  );
}

export const Player = memo(PlayerComponent);
