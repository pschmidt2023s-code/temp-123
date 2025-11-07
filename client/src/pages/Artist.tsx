import { useRoute } from 'wouter';
import { TrackRow } from '@/components/TrackRow';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { demoTracks, demoAlbums } from '@/lib/demo-data';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';
import { useLocation } from 'wouter';

export default function Artist() {
  const [, params] = useRoute('/artist/:id');
  const [, setLocation] = useLocation();
  const { setQueue, queue, currentIndex, isPlaying } = usePlayer();

  const artistTracks = demoTracks.slice(0, 5);
  const artistAlbums = demoAlbums.slice(0, 6);
  const artist = artistTracks[0];

  const handlePlayAll = () => {
    setQueue(artistTracks, 0);
    musicKit.play(artistTracks[0]);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Artist Hero */}
      <div className="relative h-[340px] rounded-lg overflow-hidden mb-8 glass">
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=340&fit=crop"
          alt={artist?.attributes.artistName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <p className="text-sm text-muted-foreground mb-2">Künstler</p>
          <h1 className="text-6xl font-bold mb-4" data-testid="text-artist-name">
            {artist?.attributes.artistName}
          </h1>
          <p className="text-muted-foreground">2,5 Mio. monatliche Hörer</p>
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
      </div>

      {/* Popular Tracks */}
      <section className="mb-12">
        <h2 className="text-subheading font-bold mb-4" data-testid="text-popular-tracks">
          Beliebte Titel
        </h2>
        <div className="space-y-1">
          {artistTracks.map((track, index) => {
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
          {artistAlbums.map((album) => (
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
