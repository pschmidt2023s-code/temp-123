import { useEffect } from 'react';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';

export function useMediaSession() {
  const {
    queue,
    currentIndex,
    isPlaying,
    play,
    pause,
    next,
    previous,
    seek,
  } = usePlayer();

  const currentTrack = queue[currentIndex];

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      // Update metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.attributes.name,
        artist: currentTrack.attributes.artistName,
        album: currentTrack.attributes.albumName || '',
        artwork: [
          { src: musicKit.getArtworkURL(currentTrack.attributes.artwork, 96), sizes: '96x96', type: 'image/jpeg' },
          { src: musicKit.getArtworkURL(currentTrack.attributes.artwork, 128), sizes: '128x128', type: 'image/jpeg' },
          { src: musicKit.getArtworkURL(currentTrack.attributes.artwork, 192), sizes: '192x192', type: 'image/jpeg' },
          { src: musicKit.getArtworkURL(currentTrack.attributes.artwork, 256), sizes: '256x256', type: 'image/jpeg' },
          { src: musicKit.getArtworkURL(currentTrack.attributes.artwork, 384), sizes: '384x384', type: 'image/jpeg' },
          { src: musicKit.getArtworkURL(currentTrack.attributes.artwork, 512), sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      // Set playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (error) {
      console.warn('MediaSession metadata update failed:', error);
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Set up action handlers
    const actionHandlers: [MediaSessionAction, () => void][] = [
      ['play', play],
      ['pause', pause],
      ['previoustrack', previous],
      ['nexttrack', next],
      ['stop', pause],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`MediaSession action ${action} not supported:`, error);
      }
    });

    // Seekto handler with position
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime * 1000); // Convert to milliseconds
        }
      });
    } catch (error) {
      console.warn('MediaSession seekto not supported:', error);
    }

    return () => {
      // Clean up handlers
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    };
  }, [play, pause, next, previous, seek]);
}
