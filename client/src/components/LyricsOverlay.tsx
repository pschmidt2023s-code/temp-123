import { X } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { useMKLyrics } from '@/hooks/useMKLyrics';
import { usePlayer } from '@/store/usePlayer';
import { useEffect, useRef } from 'react';

interface LyricsOverlayProps {
  songId: string;
  onClose: () => void;
}

export function LyricsOverlay({ songId, onClose }: LyricsOverlayProps) {
  const { lyrics, isLoading, currentLine, fetchLyrics, updateCurrentLine } = useMKLyrics();
  const { currentTime } = usePlayer();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLyrics(songId);
  }, [songId, fetchLyrics]);

  useEffect(() => {
    updateCurrentLine(currentTime);
  }, [currentTime, updateCurrentLine]);

  useEffect(() => {
    if (lyricsContainerRef.current && lyrics.length > 0) {
      const activeElement = lyricsContainerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentLine, lyrics.length]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex flex-col"
      data-testid="lyrics-overlay"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-2xl font-bold" data-testid="text-lyrics-title">
          Songtexte
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-lyrics"
        >
          <X size={24} weight="bold" />
        </Button>
      </div>

      {/* Lyrics Content */}
      <div 
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto px-8 py-16"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Lädt Songtexte...</p>
          </div>
        ) : lyrics.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Keine Songtexte verfügbar
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {lyrics.map((line, index) => {
              const isActive = index === currentLine;
              const isPast = index < currentLine;
              
              return (
                <div
                  key={index}
                  data-active={isActive}
                  className={`
                    text-4xl font-bold transition-all duration-300
                    ${isActive 
                      ? 'text-foreground scale-105' 
                      : isPast
                      ? 'text-muted-foreground/40'
                      : 'text-muted-foreground/60'
                    }
                  `}
                  data-testid={`lyric-line-${index}`}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
