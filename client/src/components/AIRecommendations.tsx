import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkle, TrendUp } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';
import type { MKMediaItem } from '@shared/schema';

interface AIRecommendationsProps {
  userId: string;
}

export function AIRecommendations({ userId }: AIRecommendationsProps) {
  const { setQueue } = usePlayer();

  const { data: recommendations = [], isLoading } = useQuery<MKMediaItem[]>({
    queryKey: ['/api/ai/recommendations', userId],
    queryFn: async () => {
      const res = await fetch(`/api/ai/recommendations/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
  });

  const handlePlay = async (track: MKMediaItem, index: number) => {
    setQueue(recommendations, index);
    const mk = musicKit.getInstance();
    if (mk) {
      try {
        await mk.play();
      } catch (e) {
        console.error('Failed to play:', e);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkle size={24} weight="bold" className="text-primary animate-pulse" />
            <CardTitle>KI-Empfehlungen</CardTitle>
          </div>
          <CardDescription>Personalisierte Vorschläge basierend auf Ihrem Geschmack</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-pulse">Analysiere Ihre Hörgewohnheiten...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkle size={24} weight="bold" className="text-primary" />
            <CardTitle>KI-Empfehlungen</CardTitle>
          </div>
          <CardDescription>Personalisierte Vorschläge basierend auf Ihrem Geschmack</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">Noch keine Empfehlungen</p>
            <p className="text-sm">Hören Sie mehr Musik, um personalisierte KI-Vorschläge zu erhalten</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkle size={24} weight="bold" className="text-primary" />
          <CardTitle>KI-Empfehlungen</CardTitle>
        </div>
        <CardDescription>
          Basierend auf Ihren Top-Künstlern und Hörgewohnheiten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {recommendations.slice(0, 6).map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer group"
              onClick={() => handlePlay(track, index)}
              data-testid={`ai-recommendation-${index}`}
            >
              <div className="relative shrink-0">
                <img
                  src={track.attributes.artwork ? musicKit.getArtworkURL(track.attributes.artwork, 64) : ''}
                  alt={track.attributes.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {track.attributes.name}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {track.attributes.artistName}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendUp size={16} weight="bold" className="text-primary" />
                <span>KI</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
