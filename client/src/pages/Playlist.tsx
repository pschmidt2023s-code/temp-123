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

export default function Playlist() {
  const [, params] = useRoute('/playlist/:id');
  const { setQueue, queue, currentIndex, isPlaying } = usePlayer();
  const { getPlaylist } = useMKCatalog();
  const [playlistData, setPlaylistData] = useState<MKMediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      setIsLoading(true);
      getPlaylist(params.id)
        .then((data) => {
          setPlaylistData(data);
        })
        .catch((error) => {
          console.error('Failed to load playlist:', error);
          setPlaylistData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [params?.id, getPlaylist]);

  const playlistTracks = (playlistData as any)?.relationships?.tracks?.data || demoTracks;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lädt Playlist...</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    setQueue(playlistTracks, 0);
    musicKit.play(playlistTracks[0]);
  };

  const totalDuration = playlistTracks.reduce(
    (acc: number, track: any) => acc + (track.attributes.durationInMillis || 0),
    0
  );

  const formatTotalDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return hours > 0 ? `${hours} Std. ${minutes} Min.` : `${minutes} Min.`;
  };

  const artwork = playlistData?.attributes?.artwork
    ? musicKit.getArtworkURL(playlistData.attributes.artwork, 232)
    : '';

  return (
    <div className="min-h-screen pb-32">
      {/* Playlist Header */}
      <div className="flex gap-6 mb-8">
        <div className="shrink-0">
          {artwork ? (
            <img
              src={artwork}
              alt={playlistData?.attributes?.name || 'Playlist'}
              className="w-[232px] h-[232px] rounded-lg shadow-card"
              data-testid="img-playlist-cover"
            />
          ) : (
            <div className="w-[232px] h-[232px] rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-card">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="96"
                height="96"
                fill="white"
                viewBox="0 0 256 256"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48.24-94.78L104.71,169.37a8,8,0,0,1-11.95-6.87V93.5a8,8,0,0,1,11.95-6.87l71.53,48.15a8,8,0,0,1,0,13.44Z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end">
          <p className="text-sm text-muted-foreground mb-2">Playlist</p>
          <h1 className="text-5xl font-bold mb-4" data-testid="text-playlist-title">
            {playlistData?.attributes?.name || 'Rock Classics'}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{(playlistData as any)?.attributes?.curatorName || 'GlassBeats'}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground" data-testid="text-playlist-info">
              {playlistTracks.length} Songs, {formatTotalDuration(totalDuration)}
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
          data-testid="button-play-playlist"
        >
          <Play size={24} weight="fill" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10" data-testid="button-like-playlist">
          <Heart size={28} weight="bold" className="text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10" data-testid="button-playlist-menu">
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

        {playlistTracks.map((track: any, index: number) => {
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
