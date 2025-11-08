import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartBar, Trophy, ShareNetwork, Clock } from '@phosphor-icons/react';
import type { UserStats, Achievement } from '@shared/schema';

export default function Dashboard() {
  const userId = localStorage.getItem('userId') || 'demo-user';

  const { data: stats = [], isLoading: statsLoading } = useQuery<UserStats[]>({
    queryKey: ['/api/stats', userId],
    queryFn: async () => {
      const res = await fetch(`/api/stats/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  const { data: topArtists = [], isLoading: topArtistsLoading } = useQuery<UserStats[]>({
    queryKey: ['/api/stats', userId, 'top-artists'],
    queryFn: async () => {
      const res = await fetch(`/api/stats/${userId}/top-artists?limit=10`);
      if (!res.ok) throw new Error('Failed to fetch top artists');
      return res.json();
    },
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements', userId],
    queryFn: async () => {
      const res = await fetch(`/api/achievements/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch achievements');
      return res.json();
    },
  });

  const totalMinutes = stats.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);
  const totalPlays = stats.reduce((sum, s) => sum + (s.playCount || 0), 0);
  const uniqueArtists = new Set(stats.map(s => s.artistName)).size;

  const shareAchievement = (achievement: Achievement) => {
    const text = `Ich habe ein Achievement auf GlassBeats freigeschaltet: ${achievement.title} 🎵`;
    const url = `https://www.instagram.com/`;
    
    // Create shareable text
    if (navigator.share) {
      navigator.share({
        title: 'Mein GlassBeats Achievement',
        text: text,
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Achievement-Text in Zwischenablage kopiert!');
    }
  };

  if (statsLoading || topArtistsLoading || achievementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 pb-32 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-bold" data-testid="text-dashboard-title">Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Hörzeit</CardTitle>
            <Clock size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-minutes">
              {totalMinutes.toLocaleString()} Min
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ {Math.floor(totalMinutes / 60)} Stunden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Songs gespielt</CardTitle>
            <ChartBar size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-plays">
              {totalPlays.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Insgesamt abgespielt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Künstler entdeckt</CardTitle>
            <Trophy size={20} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-unique-artists">
              {uniqueArtists}
            </div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Künstler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Artists */}
      <Card>
        <CardHeader>
          <CardTitle>Deine Top Künstler</CardTitle>
          <CardDescription>Die Künstler, die du am meisten hörst</CardDescription>
        </CardHeader>
        <CardContent>
          {topArtists.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Hördaten verfügbar. Starte deine ersten Songs!
            </p>
          ) : (
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                  data-testid={`artist-stat-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{artist.artistName}</p>
                      <p className="text-sm text-muted-foreground">
                        {artist.playCount} mal gespielt • {artist.totalMinutes} Minuten
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {Math.floor((artist.totalMinutes || 0) / 60)}h {(artist.totalMinutes || 0) % 60}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy size={24} weight="bold" />
            Erfolge
          </CardTitle>
          <CardDescription>Deine musikalischen Meilensteine</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Erfolge freigeschaltet. Höre mehr Musik, um Erfolge zu sammeln!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="flex-shrink-0">
                    <Trophy size={32} weight="fill" className="text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {achievement.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString('de-DE') : 'Kürzlich'}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareAchievement(achievement)}
                      data-testid={`button-share-${achievement.id}`}
                    >
                      <ShareNetwork size={16} weight="bold" className="mr-2" />
                      Teilen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>AI Song-Vorschläge</CardTitle>
          <CardDescription>Personalisierte Empfehlungen basierend auf deinem Geschmack</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              AI-Empfehlungen werden bald verfügbar sein!
            </p>
            <p className="text-sm text-muted-foreground">
              Basierend auf deinen Top-Künstlern und Hörgewohnheiten werden wir dir perfekt passende Songs empfehlen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
