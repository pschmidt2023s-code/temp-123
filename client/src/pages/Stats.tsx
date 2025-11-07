import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { ChartBar, MusicNote, Headphones, Clock } from '@phosphor-icons/react';

export default function Stats() {
  const userId = 'demo-user';

  const { data: stats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user-stats', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user-stats/${userId}`);
      return res.json();
    },
  });

  const { data: topArtistsData = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['/api/user-stats', userId, 'top-artists'],
    queryFn: async () => {
      const res = await fetch(`/api/user-stats/${userId}/top-artists?limit=10`);
      return res.json();
    },
  });

  const { data: totalData, isLoading: totalLoading } = useQuery({
    queryKey: ['/api/user-stats', userId, 'total'],
    queryFn: async () => {
      const res = await fetch(`/api/user-stats/${userId}/total`);
      return res.json();
    },
  });

  const totalMinutes = totalData?.totalMinutes || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalSongs = stats.reduce((sum: number, s: any) => sum + s.playCount, 0);
  const uniqueArtists = new Set(stats.map((s: any) => s.artistName)).size;

  const isLoading = statsLoading || artistsLoading || totalLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-md mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ChartBar size={32} weight="bold" className="text-primary" />
        <h1 className="text-3xl font-bold" data-testid="heading-stats">Meine Statistiken</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock size={32} weight="bold" className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gehört</p>
              <p className="text-3xl font-bold" data-testid="stat-total-hours">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">{totalMinutes} Minuten</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MusicNote size={32} weight="bold" className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Songs abgespielt</p>
              <p className="text-3xl font-bold" data-testid="stat-total-songs">{totalSongs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Headphones size={32} weight="bold" className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Künstler entdeckt</p>
              <p className="text-3xl font-bold" data-testid="stat-unique-artists">{uniqueArtists}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4" data-testid="heading-top-artists">Top 10 Künstler</h2>
        {topArtistsData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Noch keine Statistiken verfügbar</p>
        ) : (
          <div className="space-y-3">
            {topArtistsData.map((artist: any, index: number) => (
              <div key={artist.artistName} className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                <div className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</div>
                <div className="flex-1">
                  <p className="font-medium" data-testid={`artist-name-${index}`}>{artist.artistName}</p>
                  <p className="text-sm text-muted-foreground">
                    {artist.playCount} Wiedergaben · {Math.floor(artist.totalMinutes / 60)}h {artist.totalMinutes % 60}m
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4" data-testid="heading-recent-tracks">Zuletzt gehört</h2>
        {stats.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Noch keine Songs gehört</p>
        ) : (
          <div className="space-y-2">
            {stats.slice(0, 20).map((track: any) => (
              <div key={track.id} className="flex items-center justify-between p-2 hover-elevate rounded-md">
                <div>
                  <p className="font-medium text-sm" data-testid={`track-title-${track.id}`}>{track.songTitle}</p>
                  <p className="text-xs text-muted-foreground">{track.artistName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{track.playCount}x</p>
                  <p className="text-xs text-muted-foreground">{track.totalMinutes}min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
