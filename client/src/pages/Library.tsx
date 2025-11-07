import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import { demoAlbums, demoPlaylists } from '@/lib/demo-data';
import { useLocation } from 'wouter';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useToast } from '@/hooks/use-toast';

export default function Library() {
  const [, setLocation] = useLocation();
  const { playlists, isLoading, createPlaylist, isCreating } = usePlaylists();
  const { toast } = useToast();

  const handleCreatePlaylist = () => {
    createPlaylist(
      {
        name: 'Neue Playlist',
        description: 'Erstellt von GlassBeats',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        isPublic: true,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Playlist erstellt',
            description: 'Deine neue Playlist wurde erfolgreich erstellt.',
          });
        },
      }
    );
  };

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-heading font-bold" data-testid="text-library-title">
          Deine Bibliothek
        </h1>
        <Button
          onClick={handleCreatePlaylist}
          disabled={isCreating}
          className="bg-primary text-primary-foreground"
          data-testid="button-add-to-library"
        >
          <Plus size={20} weight="bold" className="mr-2" />
          {isCreating ? 'Wird erstellt...' : 'Playlist erstellen'}
        </Button>
      </div>

      {/* Playlists */}
      <section className="mb-8">
        <h2 className="text-subheading font-bold mb-4" data-testid="text-section-playlists">
          Playlists {!isLoading && `(${userPlaylists.length})`}
        </h2>
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
