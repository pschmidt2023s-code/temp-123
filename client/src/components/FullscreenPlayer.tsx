import { useState, useEffect, useRef, useMemo } from 'react';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  X,
  Heart,
  DotsThree,
  Queue as QueueIcon,
  Quotes,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { SyncedLyrics } from './SyncedLyrics';

interface FullscreenPlayerProps {
  onClose: () => void;
}

export function FullscreenPlayer({ onClose }: FullscreenPlayerProps) {
  const {
    queue,
    currentIndex,
    isPlaying,
    shuffle,
    repeat,
    currentTime,
    duration,
    play,
    pause,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    seek,
  } = usePlayer();

  const currentTrack = queue[currentIndex];
  const [dominantColor, setDominantColor] = useState<string>('142, 70%, 41%');
  const [isPulsing, setIsPulsing] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const animationRef = useRef<number | null>(null);
  
  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (info.offset.y > 150 || info.velocity.y > 300) {
      onClose();
    }
  };

  // Extract dominant color from album artwork
  useEffect(() => {
    if (!currentTrack?.attributes.artwork) return;

    const extractColor = async () => {
      try {
        const artworkUrl = musicKit.getArtworkURL(currentTrack.attributes.artwork, 300);
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = artworkUrl;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let r = 0, g = 0, b = 0;
          const pixelCount = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }

          r = Math.floor(r / pixelCount);
          g = Math.floor(g / pixelCount);
          b = Math.floor(b / pixelCount);

          const hsl = rgbToHsl(r, g, b);
          setDominantColor(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
        };
      } catch (error) {
        console.warn('Color extraction failed:', error);
      }
    };

    extractColor();
  }, [currentTrack]);

  // Beat pulsation animation
  useEffect(() => {
    if (!isPlaying) {
      setIsPulsing(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    setIsPulsing(true);
    let lastTime = 0;
    const bpm = 120;
    const interval = (60 / bpm) * 1000;

    const animate = (time: number) => {
      if (time - lastTime >= interval) {
        setIsPulsing(prev => !prev);
        lastTime = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
      try {
        await musicKit.pause();
      } catch (error) {
        console.warn('MusicKit pause failed:', error);
      }
    } else {
      play();
      try {
        if (currentTrack) {
          await musicKit.play(currentTrack);
        }
      } catch (error) {
        console.warn('MusicKit play failed:', error);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={handleDragEnd}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      data-testid="fullscreen-player"
    >
        {/* Drag Handle Indicator */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full z-50" />

        {/* Animated background gradient */}
        <div
          className="absolute inset-0 transition-all duration-1000 pointer-events-none"
          style={{
            background: `
              radial-gradient(
                circle at ${isPulsing ? '60%' : '40%'} ${isPulsing ? '40%' : '60%'},
                hsl(${dominantColor}) 0%,
                hsl(${dominantColor.split(',')[0]}, ${parseInt(dominantColor.split(',')[1]) - 20}%, ${parseInt(dominantColor.split(',')[2]) - 30}%) 50%,
                hsl(0, 0%, 7%) 100%
              )
            `,
            transform: isPulsing ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Content */}
        <div className="relative flex flex-col h-full p-6 md:p-8 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
              data-testid="button-close-fullscreen"
            >
              <X size={28} weight="bold" />
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLyrics(!showLyrics)}
                className={`text-white hover:bg-white/10 ${showLyrics ? 'text-primary' : ''}`}
                data-testid="button-lyrics-fullscreen"
              >
                <Quotes size={24} weight="bold" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-like-fullscreen"
              >
                <Heart size={24} weight="bold" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                data-testid="button-menu-fullscreen"
              >
                <DotsThree size={24} weight="bold" />
              </Button>
            </div>
          </div>

        {/* Album Art - 4x4 Format */}
        <div className="flex-1 flex items-center justify-center mb-8 px-4">
          <div
            className="relative transition-transform duration-500 w-full max-w-sm md:max-w-md"
            style={{
              transform: isPulsing ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <img
              src={musicKit.getArtworkURL(currentTrack.attributes.artwork, 600)}
              alt={currentTrack.attributes.name}
              className="w-full aspect-square rounded-2xl shadow-2xl object-cover"
            />
            <div
              className="absolute inset-0 rounded-2xl transition-all duration-500"
              style={{
                boxShadow: isPulsing
                  ? `0 0 80px 20px hsl(${dominantColor})`
                  : `0 0 40px 10px hsl(${dominantColor})`,
              }}
            />
          </div>
        </div>

        {/* Track Info */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 truncate">
            {currentTrack.attributes.name}
          </h1>
          <p className="text-lg md:text-xl text-white/70 truncate">
            {currentTrack.attributes.artistName}
          </p>
          {currentTrack.attributes.albumName && (
            <p className="text-sm text-white/50 mt-1 truncate">
              {currentTrack.attributes.albumName}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1000}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/70 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={`text-white hover:bg-white/10 ${
              shuffle ? 'text-primary' : 'text-white/70'
            }`}
            data-testid="button-shuffle-fullscreen"
          >
            <Shuffle size={24} weight="bold" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={previous}
            className="text-white hover:bg-white/10"
            data-testid="button-previous-fullscreen"
          >
            <SkipBack size={32} weight="fill" />
          </Button>

          <Button
            size="icon"
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-white text-background hover:scale-105 transition-transform"
            data-testid="button-play-pause-fullscreen"
          >
            {isPlaying ? (
              <Pause size={32} weight="fill" />
            ) : (
              <Play size={32} weight="fill" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="text-white hover:bg-white/10"
            data-testid="button-next-fullscreen"
          >
            <SkipForward size={32} weight="fill" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={`text-white hover:bg-white/10 ${
              repeat !== 'off' ? 'text-primary' : 'text-white/70'
            }`}
            data-testid="button-repeat-fullscreen"
          >
            <Repeat size={24} weight="bold" />
          </Button>
        </div>

        {/* Queue info */}
        <div className="flex items-center justify-center gap-2 text-xs text-white/50">
          <QueueIcon size={16} weight="bold" />
          <span>
            {currentIndex + 1} / {queue.length}
          </span>
        </div>

        {/* Lyrics Panel (overlay when enabled) */}
        <AnimatePresence>
          {showLyrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 bottom-32 top-20 md:top-24 mx-4 md:mx-8 bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden"
              data-testid="lyrics-panel"
            >
              <SyncedLyrics 
                releaseId={currentTrack.id} 
                className="h-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
