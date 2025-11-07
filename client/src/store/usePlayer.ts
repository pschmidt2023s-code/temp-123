import { create } from 'zustand';
import type { MKMediaItem, PlayerState } from '@shared/schema';

interface PlayerStore extends PlayerState {
  setQueue: (queue: MKMediaItem[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
}

export const usePlayer = create<PlayerStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: 'off',
  volume: 80,
  currentTime: 0,
  duration: 0,

  setQueue: (queue, startIndex = 0) => {
    set({ queue, currentIndex: startIndex, isPlaying: true });
  },

  play: () => {
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  next: () => {
    const { queue, currentIndex, repeat } = get();
    if (repeat === 'one') return;
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      nextIndex = repeat === 'all' ? 0 : currentIndex;
    }
    set({ currentIndex: nextIndex, currentTime: 0 });
  },

  previous: () => {
    const { currentIndex, currentTime } = get();
    if (currentTime > 3) {
      set({ currentTime: 0 });
    } else {
      const prevIndex = Math.max(0, currentIndex - 1);
      set({ currentIndex: prevIndex, currentTime: 0 });
    }
  },

  seek: (time) => {
    set({ currentTime: time });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  toggleRepeat: () => {
    set((state) => ({
      repeat: state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off',
    }));
  },

  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(100, volume)) });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
  },
}));
