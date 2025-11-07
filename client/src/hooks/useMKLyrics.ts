import { useState } from 'react';
import { musicKit } from '@/lib/musickit';
import type { LyricLine } from '@shared/schema';

export function useMKLyrics() {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  const fetchLyrics = async (songId: string) => {
    const mk = musicKit.getInstance();
    if (!mk) {
      setLyrics([
        {
          startTime: 0,
          endTime: 10000,
          text: 'Demo-Modus: Lyrics sind nur mit Apple Music verfügbar',
        },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await mk.api.music(`/v1/catalog/de/songs/${songId}/lyrics`);
      if (response.data && response.data[0]) {
        const lyricData = response.data[0].attributes.ttml;
        const parsed = parseLyrics(lyricData);
        setLyrics(parsed);
      }
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
      setLyrics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseLyrics = (ttml: string): LyricLine[] => {
    const lines: LyricLine[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(ttml, 'text/xml');
    const pElements = doc.querySelectorAll('p');

    pElements.forEach((p) => {
      const begin = parseTime(p.getAttribute('begin') || '0');
      const end = parseTime(p.getAttribute('end') || '0');
      const text = p.textContent || '';

      lines.push({
        startTime: begin,
        endTime: end,
        text,
      });
    });

    return lines;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    const seconds = parseFloat(parts[2] || '0');
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  const updateCurrentLine = (currentTime: number) => {
    const index = lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    );
    if (index !== -1 && index !== currentLine) {
      setCurrentLine(index);
    }
  };

  return {
    lyrics,
    isLoading,
    currentLine,
    fetchLyrics,
    updateCurrentLine,
  };
}
