import { Card } from '@/components/Card';
import { useLocation } from 'wouter';
import { demoAlbums, demoPlaylists, demoTracks } from '@/lib/demo-data';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';

export default function Home() {
  const [, setLocation] = useLocation();
  const { setQueue } = usePlayer();

  const handleAlbumClick = (id: string) => {
    setLocation(`/album/${id}`);
  };

  const handlePlaylistClick = (id: string) => {
    setLocation(`/playlist/${id}`);
  };

  const handleQuickPlay = () => {
    setQueue(demoTracks, 0);
    musicKit.play(demoTracks[0]);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <section className="mb-8">
        <h1 className="text-heading font-bold mb-6" data-testid="text-welcome">
          Für dich
        </h1>
        <div
          className="relative h-64 rounded-lg glass overflow-hidden cursor-pointer group"
          onClick={handleQuickPlay}
          data-testid="hero-section"
        >
          <img
            src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop"
            alt="Featured Mix"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-sm text-muted-foreground mb-2">Dein Mix</p>
            <h2 className="text-4xl font-bold mb-4">Rock Classics</h2>
            <p className="text-muted-foreground mb-4">
              Die besten Rock-Songs aller Zeiten
            </p>
          </div>
        </div>
      </section>

      {/* Recently Played */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold" data-testid="text-section-recent">
            Kürzlich gespielt
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {demoAlbums.slice(0, 6).map((album) => (
            <Card
              key={album.id}
              item={album}
              onClick={() => handleAlbumClick(album.id)}
            />
          ))}
        </div>
      </section>

      {/* Made For You */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold" data-testid="text-section-for-you">
            Für dich erstellt
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {demoPlaylists.map((playlist) => (
            <Card
              key={playlist.id}
              item={playlist}
              onClick={() => handlePlaylistClick(playlist.id)}
            />
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold" data-testid="text-section-new">
            Neuerscheinungen
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {demoAlbums.map((album) => (
            <Card
              key={album.id}
              item={album}
              onClick={() => handleAlbumClick(album.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
