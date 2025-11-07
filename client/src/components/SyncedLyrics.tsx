import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/store/usePlayer';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lyrics } from '@shared/schema';

interface TimedWord {
  word: string;
  startTime: number;
  endTime: number;
}

interface TimedLine {
  startTime: number;
  endTime: number;
  text: string;
  words: TimedWord[];
}

interface SyncedLyricsProps {
  releaseId: string;
  className?: string;
}

export function SyncedLyrics({ releaseId, className = '' }: SyncedLyricsProps) {
  const { currentTime, seek } = usePlayer();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  const { data: lyricsData, isLoading } = useQuery<Lyrics>({
    queryKey: ['/api/lyrics', releaseId],
    queryFn: async () => {
      const res = await fetch(`/api/lyrics/${releaseId}`);
      if (!res.ok) throw new Error('Failed to fetch lyrics');
      return res.json();
    },
    enabled: !!releaseId,
  });

  const timedLines: TimedLine[] = lyricsData?.timedLines 
    ? JSON.parse(lyricsData.timedLines) 
    : [];

  useEffect(() => {
    if (!timedLines.length) return;

    const currentTimeMs = currentTime;
    
    const lineIndex = timedLines.findIndex(
      (line, idx) => {
        const nextLine = timedLines[idx + 1];
        return currentTimeMs >= line.startTime && 
               (!nextLine || currentTimeMs < nextLine.startTime);
      }
    );

    if (lineIndex !== -1) {
      setCurrentLineIndex(lineIndex);
      
      const currentLine = timedLines[lineIndex];
      if (currentLine.words?.length) {
        const wordIdx = currentLine.words.findIndex(
          (word, idx) => {
            const nextWord = currentLine.words[idx + 1];
            return currentTimeMs >= word.startTime && 
                   (!nextWord || currentTimeMs < nextWord.startTime);
          }
        );
        setCurrentWordIndex(wordIdx !== -1 ? wordIdx : 0);
      }
    }
  }, [currentTime, timedLines]);

  useEffect(() => {
    if (currentLineRef.current && lyricsRef.current) {
      const lineElement = currentLineRef.current;
      const containerElement = lyricsRef.current;
      
      const lineTop = lineElement.offsetTop;
      const lineHeight = lineElement.offsetHeight;
      const containerHeight = containerElement.offsetHeight;
      
      const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);
      
      containerElement.scrollTo({
        top: scrollTo,
        behavior: 'smooth',
      });
    }
  }, [currentLineIndex]);

  const handleLineClick = (line: TimedLine) => {
    seek(line.startTime);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-white/50 text-center">
          <div className="animate-pulse">Lyrics werden geladen...</div>
        </div>
      </div>
    );
  }

  if (!lyricsData || !timedLines.length) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-white/50 text-center space-y-2">
          <p className="text-lg">Keine Lyrics verfügbar</p>
          <p className="text-sm">Synchronisierte Lyrics für diesen Song sind noch nicht verfügbar.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={lyricsRef}
      className={`overflow-y-auto scroll-smooth ${className}`}
      data-testid="synced-lyrics-container"
    >
      <div className="py-8 px-4 space-y-8">
        {timedLines.map((line, lineIdx) => {
          const isCurrent = lineIdx === currentLineIndex;
          const isPast = lineIdx < currentLineIndex;
          const isFuture = lineIdx > currentLineIndex;

          return (
            <motion.div
              key={lineIdx}
              ref={isCurrent ? currentLineRef : null}
              onClick={() => handleLineClick(line)}
              className={`
                cursor-pointer transition-all duration-300 text-center
                ${isCurrent ? 'scale-110' : 'scale-100'}
                ${isPast ? 'text-white/30' : ''}
                ${isFuture ? 'text-white/40' : ''}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: lineIdx * 0.05 }}
              data-testid={`lyrics-line-${lineIdx}`}
            >
              {line.words && line.words.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2 text-2xl md:text-3xl font-bold leading-relaxed">
                  {line.words.map((word, wordIdx) => {
                    const isCurrentWord = isCurrent && wordIdx === currentWordIndex;
                    return (
                      <motion.span
                        key={wordIdx}
                        className={`
                          inline-block transition-all duration-200
                          ${isCurrentWord ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]' : 'text-white'}
                          ${isCurrent && !isCurrentWord ? 'text-white/90' : ''}
                        `}
                        animate={isCurrentWord ? {
                          scale: [1, 1.1, 1],
                          transition: { duration: 0.3 }
                        } : {}}
                        data-testid={`lyrics-word-${lineIdx}-${wordIdx}`}
                      >
                        {word.word}
                      </motion.span>
                    );
                  })}
                </div>
              ) : (
                <div 
                  className={`
                    text-2xl md:text-3xl font-bold leading-relaxed
                    ${isCurrent ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]' : 'text-white'}
                  `}
                >
                  {line.text}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Scroll indicator */}
      <div className="sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}
