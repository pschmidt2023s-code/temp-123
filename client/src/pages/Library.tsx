import { Card } from '@/components/Card';
import { demoAlbums, demoPlaylists } from '@/lib/demo-data';
import { useLocation } from 'wouter';
import { usePlaylists } from '@/hooks/usePlaylists';
import { ResponsivePageHeader, ResponsiveSectionHeader } from '@/components/ResponsivePageHeader';

export default function Library() {
  const [, setLocation] = useLocation();
  const { playlists, isLoading } = usePlaylists();

  const userPlaylists = playlists.length > 0
    ? playlists.map(p => ({
        id: p.id,
        type: 'playlists' as const,
        attributes: {
          name: p.name,
          artistName: 'Deine Playlist',
          artwork: p.coverUrl ? {
            url: p.coverUrl,
            width: 400,
            height: 400,
          } : undefined,
        },
      }))
    : demoPlaylists;

  return (
    <div className="min-h-screen pb-32">
      <ResponsivePageHeader 
        title="Deine Bibliothek" 
        testId="text-library-title"
        className="mb-8"
      />

      {/* Playlists */}
      <section className="mb-8">
        <ResponsiveSectionHeader 
          title={`Playlists ${!isLoading ? `(${userPlaylists.length})` : ''}`}
          testId="text-section-playlists"
          className="mb-4"
        />
        {isLoading ? (
          <div className="text-muted-foreground">Lädt...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {userPlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                item={playlist}
                onClick={() => setLocation(`/playlist/${playlist.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Albums */}
      <section className="mb-8">
        <h2 className="text-subheading font-bold mb-4" data-testid="text-section-albums">
          Alben
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {demoAlbums.map((album) => (
            <Card
              key={album.id}
              item={album}
              onClick={() => setLocation(`/album/${album.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
