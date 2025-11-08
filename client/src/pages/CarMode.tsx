import { useState, useEffect } from 'react';
import { usePlayer } from '@/store/usePlayer';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, SpeakerHigh, X } from '@phosphor-icons/react';
import { useLocation } from 'wouter';

export default function CarMode() {
  const [, setLocation] = useLocation();
  const { queue, currentIndex, isPlaying, play, pause, next, previous, volume } = usePlayer();
  const currentTrack = queue[currentIndex];
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const exitCarMode = () => {
    setLocation('/');
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col" data-testid="page-car-mode">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-16 w-16"
          onClick={exitCarMode}
          data-testid="button-exit-car-mode"
        >
          <X className="w-8 h-8" />
        </Button>

        <div className="text-center mb-12">
          <div className="text-8xl font-bold mb-4" data-testid="text-car-time">
            {currentTime}
          </div>
        </div>

        {currentTrack ? (
          <div className="w-full max-w-2xl text-center mb-12">
            {currentTrack.attributes.artwork?.url && (
              <img
                src={currentTrack.attributes.artwork.url.replace('{w}', '400').replace('{h}', '400')}
                alt={currentTrack.attributes.name}
                className="w-64 h-64 rounded-2xl mx-auto mb-8 shadow-2xl"
                data-testid="img-car-artwork"
              />
            )}
            <h2 className="text-5xl font-bold mb-4 truncate" data-testid="text-car-track-name">
              {currentTrack.attributes.name}
            </h2>
            <p className="text-3xl text-muted-foreground truncate" data-testid="text-car-artist-name">
              {currentTrack.attributes.artistName}
            </p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <p className="text-3xl text-muted-foreground">Kein Track wird abgespielt</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            className="h-24 w-24 rounded-full"
            onClick={previous}
            data-testid="button-car-previous"
          >
            <SkipBack className="w-12 h-12" />
          </Button>

          <Button
            variant="default"
            size="icon"
            className="h-32 w-32 rounded-full bg-primary"
            onClick={isPlaying ? pause : play}
            data-testid="button-car-play-pause"
          >
            {isPlaying ? (
              <Pause className="w-16 h-16" weight="fill" />
            ) : (
              <Play className="w-16 h-16" weight="fill" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-24 w-24 rounded-full"
            onClick={next}
            data-testid="button-car-next"
          >
            <SkipForward className="w-12 h-12" />
          </Button>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <SpeakerHigh className="w-8 h-8" />
          <div className="text-3xl font-mono" data-testid="text-car-volume">
            {volume}%
          </div>
        </div>
      </div>
    </div>
  );
}
