import { useRoute } from 'wouter';
import { TrackRow } from '@/components/TrackRow';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { demoTracks, demoAlbums } from '@/lib/demo-data';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';
import { useLocation } from 'wouter';
import { useMKCatalog } from '@/hooks/useMKCatalog';
import { useState, useEffect } from 'react';
import type { MKMediaItem } from '@shared/schema';

export default function Artist() {
  const [, params] = useRoute('/artist/:id');
  const [, setLocation] = useLocation();
  const { setQueue, queue, currentIndex, isPlaying } = usePlayer();
  const { getArtist, createStation } = useMKCatalog();
  const [artistData, setArtistData] = useState<MKMediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      setIsLoading(true);
      getArtist(params.id)
        .then((data) => {
          setArtistData(data);
        })
        .catch((error) => {
          console.error('Failed to load artist:', error);
          setArtistData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [params?.id, getArtist]);

  const artistTracks = (artistData as any)?.views?.['top-songs']?.data || demoTracks.slice(0, 5);
  const artistAlbums = (artistData as any)?.views?.['latest-release']?.data || demoAlbums.slice(0, 6);
  const artist = artistData || demoTracks[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lädt Künstler...</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    setQueue(artistTracks, 0);
    musicKit.play(artistTracks[0]);
  };

  const handleStartRadio = async () => {
    if (!params?.id) return;
    
    try {
      const mk = musicKit.getInstance();
      if (!mk) {
        console.warn('MusicKit not available');
        return;
      }

      const station = await createStation('artists', params.id);
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

  const heroImage = artistData?.attributes?.artwork
    ? musicKit.getArtworkURL(artistData.attributes.artwork, 1200)
    : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=340&fit=crop';

  return (
    <div className="min-h-screen pb-32">
      {/* Artist Hero */}
      <div className="relative h-[340px] rounded-lg overflow-hidden mb-8 glass">
        <img
          src={heroImage}
          alt={artistData?.attributes?.name || artist?.attributes.artistName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <p className="text-sm text-muted-foreground mb-2">Künstler</p>
          <h1 className="text-6xl font-bold mb-4" data-testid="text-artist-name">
            {artistData?.attributes?.name || artist?.attributes.artistName}
          </h1>
          <p className="text-muted-foreground">
            {(artistData as any)?.attributes?.editorialNotes?.standard || '2,5 Mio. monatliche Hörer'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          size="lg"
          onClick={handlePlayAll}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-14 h-14 play-button-scale"
          data-testid="button-play-artist"
        >
          <Play size={24} weight="fill" />
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleStartRadio}
          className="text-sm"
          data-testid="button-start-radio-artist"
        >
          Radio starten
        </Button>
      </div>

      {/* Popular Tracks */}
      <section className="mb-12">
        <h2 className="text-subheading font-bold mb-4" data-testid="text-popular-tracks">
          Beliebte Titel
        </h2>
        <div className="space-y-1">
          {artistTracks.map((track: any, index: number) => {
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
      </section>

      {/* Discography */}
      <section className="mb-12">
        <h2 className="text-subheading font-bold mb-4" data-testid="text-discography">
          Diskografie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {artistAlbums.map((album: any) => (
            <Card
              key={album.id}
              item={album}
              onClick={() => setLocation(`/album/${album.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Similar Artists */}
      <section>
        <h2 className="text-subheading font-bold mb-4" data-testid="text-similar-artists">
          Ähnliche Künstler
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {demoAlbums.slice(0, 6).map((item) => (
            <Card
              key={item.id}
              item={item}
              onClick={() => setLocation(`/artist/${item.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
