import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Music, Trash2, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Smiley, SmileyXEyes, Lightning, CloudMoon, Flame, Brain } from '@phosphor-icons/react';

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Smiley, color: '#FFD700' },
  { id: 'sad', label: 'Sad', icon: SmileyXEyes, color: '#4682B4' },
  { id: 'energetic', label: 'Energetic', icon: Lightning, color: '#FF4500' },
  { id: 'calm', label: 'Calm', icon: CloudMoon, color: '#87CEEB' },
  { id: 'workout', label: 'Workout', icon: Flame, color: '#FF6347' },
  { id: 'focus', label: 'Focus', icon: Brain, color: '#9370DB' },
];

export default function AIPlaylists() {
  const { toast } = useToast();
  const userId = 'demo-user';
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: playlists = [] } = useQuery({
    queryKey: ['/api/ai-playlists', userId],
    queryFn: async () => {
      const res = await fetch(`/api/ai-playlists/${userId}`);
      return res.json();
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (mood: string) => {
      const tracks = generateDemoTracks(mood, 20);
      const moodData = MOODS.find(m => m.id === mood);
      
      return apiRequest('/api/ai-playlists', 'POST', {
        userId,
        name: `${moodData?.label} Mix`,
        mood,
        tracks,
        coverUrl: `https://via.placeholder.com/300x300/${moodData?.color.slice(1)}/FFFFFF?text=${moodData?.label}+Mix`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-playlists', userId] });
      setIsGenerating(false);
      setSelectedMood(null);
      toast({ title: 'Playlist erstellt!', description: 'Deine AI-Playlist wurde generiert.' });
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast({
        title: 'Fehler',
        description: error.message || 'Playlist konnte nicht erstellt werden',
        variant: 'destructive',
      });
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/ai-playlists/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-playlists', userId] });
      toast({ title: 'Playlist gelöscht' });
    },
  });

  const refreshPlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/ai-playlists/${id}/refresh`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-playlists', userId] });
      toast({ title: 'Playlist aktualisiert!', description: 'Neue Songs wurden generiert.' });
    },
  });

  const handleGeneratePlaylist = () => {
    if (!selectedMood) {
      toast({
        title: 'Mood auswählen',
        description: 'Bitte wähle zuerst eine Stimmung aus.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    createPlaylistMutation.mutate(selectedMood);
  };

  function generateDemoTracks(mood: string, count: number): string[] {
    const tracks: string[] = [];
    for (let i = 0; i < count; i++) {
      tracks.push(`${mood}-track-${i + 1}`);
    }
    return tracks;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles size={32} className="text-primary" />
        <h1 className="text-3xl font-bold" data-testid="heading-ai-playlists">AI Playlists</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generiere deine Playlist</CardTitle>
          <CardDescription>
            Wähle eine Stimmung und lass AI die perfekte Playlist für dich erstellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  data-testid={`button-mood-${mood.id}`}
                  className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all hover-elevate active-elevate-2 ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  <Icon size={40} weight="bold" style={{ color: mood.color }} />
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleGeneratePlaylist}
            disabled={!selectedMood || isGenerating}
            className="w-full"
            data-testid="button-generate-playlist"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={20} className="mr-2 animate-spin" />
                Generiere...
              </>
            ) : (
              <>
                <Sparkles size={20} className="mr-2" />
                Playlist generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-2xl font-bold">Deine AI Playlists</h2>
        <p className="text-sm text-muted-foreground">
          {playlists.length} Playlist{playlists.length !== 1 ? 's' : ''}
        </p>
      </div>

      {playlists.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Music size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Noch keine AI Playlists</p>
            <p className="text-sm">Wähle eine Stimmung oben und generiere deine erste Playlist!</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((playlist: any) => {
            const moodData = MOODS.find(m => m.id === playlist.mood);
            return (
              <Card key={playlist.id} className="overflow-hidden hover-elevate" data-testid={`card-playlist-${playlist.id}`}>
                <div
                  className="h-48 bg-gradient-to-br flex items-center justify-center"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${moodData?.color}22, ${moodData?.color}44)`,
                  }}
                >
                  {moodData && (
                    <moodData.icon size={80} weight="bold" style={{ color: moodData.color }} />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1" data-testid={`text-playlist-name-${playlist.id}`}>
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {playlist.tracks?.length || 0} Songs • {playlist.mood}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" data-testid={`button-play-${playlist.id}`}>
                      <Play size={16} className="mr-1 fill-current" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshPlaylistMutation.mutate(playlist.id)}
                      disabled={refreshPlaylistMutation.isPending}
                      data-testid={`button-refresh-${playlist.id}`}
                    >
                      <RefreshCw size={16} className={refreshPlaylistMutation.isPending ? 'animate-spin' : ''} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                      disabled={deletePlaylistMutation.isPending}
                      data-testid={`button-delete-${playlist.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
