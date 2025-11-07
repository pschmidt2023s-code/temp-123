import { useEffect } from 'react';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';
import type { MKMediaItem } from '@shared/schema';

export function useMKPlayback() {
  const {
    isPlaying,
    currentTime,
    volume,
    setPlaying,
    setCurrentTime,
    setDuration,
  } = usePlayer();

  useEffect(() => {
    const mk = musicKit.getInstance();
    if (!mk) return;

    const handlePlaybackStateChange = () => {
      setPlaying(mk.player.isPlaying);
      setCurrentTime(mk.player.currentPlaybackTime * 1000);
      setDuration(mk.player.currentPlaybackDuration * 1000);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(mk.player.currentPlaybackTime * 1000);
    };

    mk.addEventListener('playbackStateDidChange', handlePlaybackStateChange);
    mk.addEventListener('playbackTimeDidChange', handleTimeUpdate);

    return () => {
      mk.removeEventListener('playbackStateDidChange', handlePlaybackStateChange);
      mk.removeEventListener('playbackTimeDidChange', handleTimeUpdate);
    };
  }, [setPlaying, setCurrentTime, setDuration]);

  useEffect(() => {
    const mk = musicKit.getInstance();
    if (mk && mk.player) {
      mk.player.volume = volume / 100;
    }
  }, [volume]);

  const playItem = async (item: MKMediaItem) => {
    await musicKit.play(item);
  };

  const playQueue = async (items: MKMediaItem[], startIndex = 0) => {
    const mk = musicKit.getInstance();
    if (!mk) return;

    try {
      const ids = items.map(item => item.id);
      await mk.setQueue({
        [items[0].type]: ids,
        startWith: startIndex,
      });
      await mk.play();
    } catch (error) {
      console.error('Failed to play queue:', error);
    }
  };

  const pause = async () => {
    await musicKit.pause();
  };

  const skipToNext = async () => {
    const mk = musicKit.getInstance();
    if (mk) {
      await mk.player.skipToNextItem();
    }
  };

  const skipToPrevious = async () => {
    const mk = musicKit.getInstance();
    if (mk) {
      await mk.player.skipToPreviousItem();
    }
  };

  const seekToTime = async (time: number) => {
    const mk = musicKit.getInstance();
    if (mk) {
      await mk.player.seekToTime(time / 1000);
    }
  };

  return {
    playItem,
    playQueue,
    pause,
    skipToNext,
    skipToPrevious,
    seekToTime,
  };
}
