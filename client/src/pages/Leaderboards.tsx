import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Trophy, Medal, MusicNotes, MagicWand } from '@phosphor-icons/react/dist/ssr';
import { Badge } from '@/components/ui/badge';

const PERIODS = [
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'monthly', label: 'Monatlich' },
  { value: 'all_time', label: 'Alle Zeit' },
];

export default function Leaderboards() {
  const [selectedArtist, setSelectedArtist] = useState<{ id: string; name: string } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const [searchQuery, setSearchQuery] = useState('');
  const userId = 'user-1';

  const { data: artists = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['/api/artists'],
  });

  const { data: leaderboards = [] } = useQuery<any[]>({
    queryKey: ['/api/leaderboards', selectedArtist?.id, { period: selectedPeriod }],
    enabled: !!selectedArtist,
  });

  const { data: userPosition } = useQuery<any>({
    queryKey: ['/api/leaderboards', selectedArtist?.id, 'user', userId, { period: selectedPeriod }],
    enabled: !!selectedArtist,
  });

  const { data: achievements = [] } = useQuery<any[]>({
    queryKey: ['/api/users', userId, 'achievements'],
  });

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={24} weight="fill" className="text-yellow-500" />;
    if (rank === 2) return <Medal size={24} weight="fill" className="text-gray-400" />;
    if (rank === 3) return <Medal size={24} weight="fill" className="text-orange-500" />;
    return null;
  };

  const getAchievementIcon = (iconName: string) => {
    const iconProps = { size: 40, weight: 'fill' as const };
    switch (iconName) {
      case 'Trophy': return <Trophy {...iconProps} className="text-primary" />;
      case 'Crown': return <Crown {...iconProps} className="text-yellow-500" />;
      case 'MusicNotes': return <MusicNotes {...iconProps} className="text-primary" />;
      case 'MagicWand': return <MagicWand {...iconProps} className="text-purple-500" />;
      default: return <Trophy {...iconProps} className="text-primary" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Leaderboards</h1>
        <p className="text-muted-foreground">
          Sieh wer die Top-Listener deiner Lieblingskünstler sind!
        </p>
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <Card className="p-6 mb-8" data-testid="card-achievements">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={28} weight="fill" className="text-primary" />
            Deine Erfolge
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement: any) => (
              <Card 
                key={achievement.id} 
                className="p-4 flex items-start gap-4 hover-elevate"
                data-testid={`achievement-${achievement.type}`}
              >
                <div className="flex-shrink-0">
                  {getAchievementIcon(achievement.iconName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1" data-testid={`achievement-title-${achievement.type}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Freigeschaltet: {new Date(achievement.unlockedAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artist Selection */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Künstler wählen</h2>
            <Input
              placeholder="Künstler suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
              data-testid="input-search-artist"
            />
            <div className="space-y-2">
              {filteredArtists.map((artist) => (
                <Button
                  key={artist.id}
                  variant={selectedArtist.id === artist.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedArtist(artist)}
                  data-testid={`button-artist-${artist.id}`}
                >
                  <MusicNotes size={20} weight="bold" className="mr-2" />
                  {artist.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Period Selection */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedArtist.name}</h2>
              <div className="flex gap-2">
                {PERIODS.map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    data-testid={`button-period-${period.value}`}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* User Position */}
            {userPosition && userPosition.rank && (
              <Card className="p-4 mb-6 bg-primary/5 border-primary" data-testid="card-user-position">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">#{userPosition.rank}</div>
                    <div>
                      <p className="font-semibold">Deine Position</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(userPosition.totalMinutes)} gehört
                      </p>
                    </div>
                  </div>
                  {getRankIcon(userPosition.rank)}
                </div>
              </Card>
            )}

            {/* Leaderboard List */}
            <div className="space-y-2">
              {leaderboards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-data">
                  <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Noch keine Daten für diesen Künstler.</p>
                  <p className="text-sm mt-2">Höre Songs von {selectedArtist.name} um auf dem Leaderboard zu erscheinen!</p>
                </div>
              ) : (
                leaderboards.map((entry: any) => {
                  const isCurrentUser = entry.userId === userId;
                  return (
                    <Card
                      key={entry.id}
                      className={`p-4 ${isCurrentUser ? 'border-primary bg-primary/5' : ''} hover-elevate`}
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                          {getRankIcon(entry.rank) || (
                            <span className="text-lg font-bold">{entry.rank}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            User #{entry.userId.slice(-6)}
                            {isCurrentUser && (
                              <Badge variant="secondary" className="ml-2">Du</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(entry.totalMinutes)} gehört
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
