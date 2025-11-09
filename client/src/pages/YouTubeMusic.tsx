import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { MusicNote, MagnifyingGlass, Play, CheckCircle, WarningCircle, CircleNotch, YoutubeLogo } from '@phosphor-icons/react';

export default function YouTubeMusic() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');

  // Check YouTube status and quota
  const { data: youtubeStatus } = useQuery({
    queryKey: ['/api/youtube/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Search videos
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=10`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Suche fehlgeschlagen');
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

  // Find specific track
  const findTrackMutation = useMutation({
    mutationFn: async ({ artist, title }: { artist: string; title: string }) => {
      return apiRequest('POST', '/api/youtube/find-track', { artist, title });
    },
    onSuccess: (data: any) => {
      if (data.found) {
        setCurrentVideo(data.video.videoId);
        toast({
          title: 'Video gefunden!',
          description: data.video.title,
        });
      } else {
        toast({
          title: 'Kein Video gefunden',
          description: data.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Track konnte nicht gefunden werden',
        variant: 'destructive',
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleFindTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (artist.trim() && title.trim()) {
      findTrackMutation.mutate({ artist, title });
    }
  };

  const isConfigured = youtubeStatus?.configured;

  if (!isConfigured) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WarningCircle size={24} weight="fill" className="text-destructive" />
              YouTube API nicht konfiguriert
            </CardTitle>
            <CardDescription>
              Der YouTube API-Key wurde nicht gefunden. Bitte konfiguriere die Umgebungsvariable YOUTUBE_API_KEY.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <YoutubeLogo size={32} weight="fill" className="text-red-600" />
          YouTube Music
        </h1>
        <p className="text-muted-foreground">
          Millionen Songs mit Werbung kostenlos streamen
        </p>
      </div>

      {/* Current Player */}
      {currentVideo && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Aktuell läuft</h2>
          <YouTubePlayer
            videoId={currentVideo}
            autoplay={true}
            onEnded={() => {
              toast({
                title: 'Song beendet',
                description: 'Wähle einen neuen Song aus',
              });
            }}
          />
        </div>
      )}

      {/* Video Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={24} weight="duotone" />
            Video-Suche
          </CardTitle>
          <CardDescription>
            Suche nach Musikvideos auf YouTube
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Suchbegriff</Label>
              <Input
                id="search-query"
                data-testid="input-search-videos"
                type="text"
                placeholder="z.B. 'Bohemian Rhapsody Official Video'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={searchMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              data-testid="button-search-videos"
              disabled={searchMutation.isPending || !searchQuery.trim()}
            >
              {searchMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <CircleNotch size={16} className="animate-spin" />
                  Suche...
                </span>
              ) : (
                'Suchen'
              )}
            </Button>
          </form>

          {/* Search Results */}
          {searchMutation.data?.videos && searchMutation.data.videos.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-medium text-sm">Ergebnisse ({searchMutation.data.count})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchMutation.data.videos.map((video: any, index: number) => (
                  <Card key={index} className="p-3 hover-elevate cursor-pointer" onClick={() => setCurrentVideo(video.videoId)}>
                    <div className="flex items-center gap-3">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-20 h-14 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" data-testid={`text-video-title-${index}`}>
                          {video.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {video.channelTitle}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" data-testid={`button-play-video-${index}`}>
                        <Play size={20} weight="fill" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Find Track by Artist + Title */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MusicNote size={24} weight="duotone" />
            Track finden
          </CardTitle>
          <CardDescription>
            Finde ein Musikvideo anhand von Künstler und Titel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFindTrack} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artist">Künstler</Label>
                <Input
                  id="artist"
                  data-testid="input-artist"
                  type="text"
                  placeholder="z.B. Queen"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  disabled={findTrackMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  data-testid="input-title"
                  type="text"
                  placeholder="z.B. Bohemian Rhapsody"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={findTrackMutation.isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="button-find-track"
              disabled={findTrackMutation.isPending || !artist.trim() || !title.trim()}
            >
              {findTrackMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <CircleNotch size={16} className="animate-spin" />
                  Suche...
                </span>
              ) : (
                'Track finden'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quota Status */}
      {youtubeStatus?.quota && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <YoutubeLogo size={20} weight="fill" className="text-red-600" />
              API Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tägliche Quota</p>
                <p className="text-lg font-semibold">
                  {youtubeStatus.quota.unitsUsed} / {youtubeStatus.quota.dailyQuota}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Verbleibende Suchen</p>
                <p className="text-lg font-semibold">
                  {youtubeStatus.searchesRemaining}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Verwendet</p>
                <p className="text-lg font-semibold">
                  {youtubeStatus.quota.percentageUsed.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Nächster Reset</p>
                <p className="text-lg font-semibold">Mitternacht UTC</p>
              </div>
            </div>
            {youtubeStatus.quota.percentageUsed > 90 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Quota fast erschöpft! Nur noch {youtubeStatus.searchesRemaining} Suchen heute möglich.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <YoutubeLogo size={20} weight="fill" className="text-red-600" />
            Über YouTube Music Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>**Komplett kostenlos** - Keine Spotify Premium erforderlich</li>
            <li>**Werbefinanziert** - YouTube zeigt automatisch Werbung (du verdienst daran mit)</li>
            <li>**Millionen Songs** - Zugriff auf die gesamte YouTube Musikbibliothek</li>
            <li>**Hohe Qualität** - Videos in HD-Qualität verfügbar</li>
            <li>**Spotify Metadaten** - Nutzt Spotify für Song-Informationen, YouTube für Wiedergabe</li>
            <li>**Quota-Schutz** - Intelligentes Limit-System verhindert API-Überlastung</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
