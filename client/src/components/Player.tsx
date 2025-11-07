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
import { LyricsOverlay } from './LyricsOverlay';
import { FullscreenPlayer } from './FullscreenPlayer';

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

  const handleAudioPlay = () => {
    if (!isPlaying) {
      play();
    }
  };

  const handleAudioPause = () => {
    if (isPlaying) {
      pause();
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
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
      />
      
      {showLyrics && currentTrack && (
        <LyricsOverlay
          songId={currentTrack.id}
          onClose={() => setShowLyrics(false)}
        />
      )}
      {showFullscreen && (
        <FullscreenPlayer onClose={() => setShowFullscreen(false)} />
      )}
      
      <footer 
        className="fixed left-0 right-0 px-2 md:px-4 bg-background/95 backdrop-blur-lg shadow-2xl border-t border-border"
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
          {/* Mobile: Track info on top */}
          <div className="md:hidden flex items-center gap-2 w-full px-2">
            {artwork && (
              <button
                onClick={() => setShowFullscreen(true)}
                className="shrink-0 transition-transform active:scale-95"
                data-testid="button-open-fullscreen-mobile"
              >
                <img
                  src={artwork}
                  alt={currentTrack.attributes.name}
                  className="w-10 h-10 rounded object-cover cursor-pointer"
                />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                {currentTrack.attributes.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {currentTrack.attributes.artistName}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
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
              data-testid="button-play-pause"
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

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2">
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
      </div>
      </footer>
    </>
  );
}

export const Player = memo(PlayerComponent);
