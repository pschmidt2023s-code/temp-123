import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { MusicNote, MagnifyingGlass, Sparkle, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react';

export default function SpotifyImport() {
  const { toast } = useToast();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const userId = 'demo-user';

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check Spotify status
  const { data: spotifyStatus } = useQuery({
    queryKey: ['/api/spotify/status'],
  });

  // Import playlist mutation
  const importPlaylistMutation = useMutation({
    mutationFn: async (url: string) => {
      // Extract playlist ID from URL
      const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
      if (!match) {
        throw new Error('Ungültige Playlist-URL');
      }
      const playlistId = match[1];
      
      return apiRequest('POST', '/api/spotify/import-playlist', {
        spotifyPlaylistId: playlistId,
        userId,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/playlists'] });
      toast({
        title: 'Import erfolgreich!',
        description: data.message,
      });
      setPlaylistUrl('');
    },
    onError: (error: any) => {
      toast({
        title: 'Import fehlgeschlagen',
        description: error.message || 'Playlist konnte nicht importiert werden',
        variant: 'destructive',
      });
    },
  });

  // Search tracks (debounced)
  const { data: searchResults, isLoading: isSearching, error: searchError } = useQuery({
    queryKey: ['/api/spotify/search', debouncedSearch],
    enabled: debouncedSearch.length > 2,
    queryFn: async () => {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(debouncedSearch)}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Suche fehlgeschlagen');
      }
      return res.json();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get AI recommendations
  const recommendationsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/spotify/recommendations/${userId}?limit=20`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Empfehlungen konnten nicht geladen werden');
      }
      return res.json();
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib eine Playlist-URL ein',
        variant: 'destructive',
      });
      return;
    }
    importPlaylistMutation.mutate(playlistUrl);
  };

  const isConfigured = spotifyStatus?.configured;

  if (!isConfigured) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WarningCircle size={24} weight="fill" className="text-destructive" />
              Spotify API nicht konfiguriert
            </CardTitle>
            <CardDescription>
              Die Spotify API-Keys wurden nicht gefunden. Bitte konfiguriere die Umgebungsvariablen SPOTIFY_CLIENT_ID und SPOTIFY_CLIENT_SECRET.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Spotify Integration</h1>
        <p className="text-muted-foreground">
          Importiere Playlists, suche nach Tracks und erhalte personalisierte Empfehlungen
        </p>
      </div>

      {/* Playlist Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MusicNote size={24} weight="duotone" />
            Playlist importieren
          </CardTitle>
          <CardDescription>
            Füge eine Spotify Playlist-URL ein, um alle Tracks zu importieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImport} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-url">Spotify Playlist URL</Label>
              <Input
                id="playlist-url"
                data-testid="input-playlist-url"
                type="text"
                placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                disabled={importPlaylistMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Beispiel: https://open.spotify.com/playlist/[PLAYLIST_ID]
              </p>
            </div>

            <Button
              type="submit"
              data-testid="button-import-playlist"
              disabled={importPlaylistMutation.isPending || !playlistUrl.trim()}
            >
              {importPlaylistMutation.isPending ? 'Importiere...' : 'Playlist importieren'}
            </Button>

            {importPlaylistMutation.isSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle size={16} weight="fill" />
                Import erfolgreich abgeschlossen
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Track Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={24} weight="duotone" />
            Track-Suche
          </CardTitle>
          <CardDescription>
            Suche nach Songs, Künstlern oder Alben auf Spotify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">Suchbegriff</Label>
            <Input
              id="search-query"
              data-testid="input-search-tracks"
              type="text"
              placeholder="z.B. 'Bohemian Rhapsody' oder 'Queen'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleNotch size={16} className="animate-spin" />
              Suche...
            </div>
          )}

          {searchError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <WarningCircle size={16} weight="fill" />
              {(searchError as Error).message}
            </div>
          )}

          {searchResults?.tracks && searchResults.tracks.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Ergebnisse ({searchResults.tracks.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.tracks.map((track: any, index: number) => (
                  <Card key={index} className="p-3 hover-elevate">
                    <div className="flex items-center gap-3">
                      {track.coverUrl && (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" data-testid={`text-track-title-${index}`}>
                          {track.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {debouncedSearch.length > 2 && searchResults?.tracks?.length === 0 && !isSearching && !searchError && (
            <p className="text-sm text-muted-foreground">Keine Ergebnisse gefunden</p>
          )}
          
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <p className="text-xs text-muted-foreground">Gib mindestens 3 Zeichen ein um zu suchen</p>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle size={24} weight="duotone" />
            KI-Empfehlungen
          </CardTitle>
          <CardDescription>
            Personalisierte Musik-Empfehlungen basierend auf deinen Hörgewohnheiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => recommendationsMutation.mutate()}
            data-testid="button-load-recommendations"
            disabled={recommendationsMutation.isPending}
          >
            {recommendationsMutation.isPending ? (
              <span className="flex items-center gap-2">
                <CircleNotch size={16} className="animate-spin" />
                Lädt...
              </span>
            ) : (
              'Empfehlungen generieren'
            )}
          </Button>

          {recommendationsMutation.data?.tracks && recommendationsMutation.data.tracks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{recommendationsMutation.data.message}</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recommendationsMutation.data.tracks.map((track: any, index: number) => (
                  <Card key={index} className="p-3 hover-elevate">
                    <div className="flex items-center gap-3">
                      {track.coverUrl && (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" data-testid={`text-recommendation-${index}`}>
                          {track.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {recommendationsMutation.data?.tracks?.length === 0 && !recommendationsMutation.isPending && (
            <p className="text-sm text-muted-foreground">
              {recommendationsMutation.data.message || 'Keine Empfehlungen verfügbar. Importiere zuerst einige Playlists!'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">💡 Tipps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Playlist-URLs findest du auf Spotify unter "Teilen" → "Playlist-Link kopieren"</li>
            <li>Der Import kann bei großen Playlists einige Sekunden dauern</li>
            <li>KI-Empfehlungen basieren auf deinen importierten Playlists</li>
            <li>Alle importierten Tracks werden in deiner Bibliothek gespeichert</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
