import { useRoute } from 'wouter';
import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';
import { Play, Heart, DotsThree } from '@phosphor-icons/react/dist/ssr';
import { demoTracks } from '@/lib/demo-data';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';
import { useMKCatalog } from '@/hooks/useMKCatalog';
import { useState, useEffect } from 'react';
import type { MKMediaItem } from '@shared/schema';

export default function Album() {
  const [, params] = useRoute('/album/:id');
  const { setQueue, queue, currentIndex, isPlaying } = usePlayer();
  const { getAlbum, createStation } = useMKCatalog();
  const [albumData, setAlbumData] = useState<MKMediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      setIsLoading(true);
      getAlbum(params.id)
        .then((data) => {
          setAlbumData(data);
        })
        .catch((error) => {
          console.error('Failed to load album:', error);
          setAlbumData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [params?.id, getAlbum]);

  const albumTracks = (albumData as any)?.relationships?.tracks?.data || demoTracks.slice(0, 8);
  const album = albumData || demoTracks[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lädt Album...</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    setQueue(albumTracks, 0);
    musicKit.play(albumTracks[0]);
  };

  const handleStartRadio = async () => {
    if (!params?.id) return;
    
    try {
      const mk = musicKit.getInstance();
      if (!mk) {
        console.warn('MusicKit not available');
        return;
      }

      const station = await createStation('albums', params.id);
      if (!station) {
        console.error('Failed to create station');
        return;
      }

      await mk.setQueue({ station: station.id });
      await mk.play();
      
      const queueItems = mk.player?.queue?.items || [];
      if (queueItems.length > 0) {
        const mediaItems = queueItems.map((q: any) => q.item);
        const currentPosition = mk.player?.queue?.position || 0;
        setQueue(mediaItems, currentPosition);
      }
    } catch (error) {
      console.error('Failed to start radio:', error);
    }
  };

  const totalDuration = albumTracks.reduce(
    (acc: number, track: any) => acc + (track.attributes.durationInMillis || 0),
    0
  );

  const formatTotalDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} Min.`;
  };

  const artwork = (albumData?.attributes?.artwork || album?.attributes.artwork)
    ? musicKit.getArtworkURL(albumData?.attributes?.artwork || album?.attributes.artwork, 232)
    : '';

  const albumName = albumData?.attributes?.name || album?.attributes?.albumName || album?.attributes?.name || 'Album';
  const artistName = albumData?.attributes?.artistName || album?.attributes?.artistName || 'Unknown Artist';
  const releaseDate = albumData?.attributes?.releaseDate || album?.attributes?.releaseDate || '';

  return (
    <div className="min-h-screen pb-32">
      {/* Album Header */}
      <div className="flex gap-6 mb-8">
        <div className="shrink-0">
          {artwork && (
            <img
              src={artwork}
              alt={albumName}
              className="w-[232px] h-[232px] rounded-lg shadow-card"
              data-testid="img-album-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-end">
          <p className="text-sm text-muted-foreground mb-2">Album</p>
          <h1 className="text-5xl font-bold mb-4" data-testid="text-album-title">
            {albumName}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" data-testid="text-album-artist">
              {artistName}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{releaseDate}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground" data-testid="text-album-info">
              {albumTracks.length} Songs, {formatTotalDuration(totalDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          size="lg"
          onClick={handlePlayAll}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-14 h-14 play-button-scale"
          data-testid="button-play-album"
        >
          <Play size={24} weight="fill" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10" data-testid="button-like-album">
          <Heart size={28} weight="bold" className="text-muted-foreground" />
        </Button>

        <Button 
          variant="outline" 
          onClick={handleStartRadio}
          className="text-sm"
          data-testid="button-start-radio"
        >
          Radio starten
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10" data-testid="button-album-menu">
          <DotsThree size={28} weight="bold" className="text-muted-foreground" />
        </Button>
      </div>

      {/* Track List */}
      <div className="space-y-1">
        <div className="grid grid-cols-[auto_40px_1fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-border text-sm text-muted-foreground">
          <div className="w-8 text-center">#</div>
          <div></div>
          <div>Titel</div>
          <div className="hidden md:block">Album</div>
          <div className="hidden lg:block">Datum hinzugefügt</div>
          <div className="text-right">⏱</div>
        </div>

        {albumTracks.map((track: any, index: number) => {
          const isCurrentTrack =
            queue[currentIndex]?.id === track.id && isPlaying;
          return (
            <TrackRow
              key={track.id}
              track={track}
              index={index}
              isPlaying={isCurrentTrack}
            />
          );
        })}
      </div>
    </div>
  );
}
