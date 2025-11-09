import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkle, MusicNotes, Heart, Fire, Cloud } from '@phosphor-icons/react';
import { ResponsiveSectionHeader } from '@/components/ResponsivePageHeader';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const moods = [
  { value: 'happy', label: 'Glücklich', icon: Heart, color: '#FFD700', genres: ['Pop', 'Dance', 'Funk'] },
  { value: 'energetic', label: 'Energiegeladen', icon: Fire, color: '#FF4500', genres: ['Rock', 'Electronic', 'Hip-Hop'] },
  { value: 'calm', label: 'Ruhig', icon: Cloud, color: '#87CEEB', genres: ['Classical', 'Ambient', 'Jazz'] },
  { value: 'romantic', label: 'Romantisch', icon: Heart, color: '#FF69B4', genres: ['R&B', 'Soul', 'Ballad'] },
  { value: 'focus', label: 'Konzentriert', icon: Sparkle, color: '#9370DB', genres: ['Lo-fi', 'Classical', 'Instrumental'] },
];

export default function SoundMatch() {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [generatedPlaylist, setGeneratedPlaylist] = useState<any>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (mood: string) => {
      const moodData = moods.find(m => m.value === mood);
      return apiRequest('/api/soundmatch/generate', 'POST', {
        mood,
        genres: moodData?.genres || [],
      });
    },
    onSuccess: (data) => {
      setGeneratedPlaylist(data);
      toast({
        title: 'Sound Match erstellt!',
        description: 'Deine personalisierte Stimmungs-Playlist wurde generiert.',
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedMood) {
      toast({
        title: 'Keine Stimmung ausgewählt',
        description: 'Bitte wähle eine Stimmung aus.',
        variant: 'destructive',
      });
      return;
    }
    generateMutation.mutate(selectedMood);
  };

  const selectedMoodData = moods.find(m => m.value === selectedMood);

  return (
    <div className="min-h-screen pb-32">
      <ResponsiveSectionHeader title="Sound Match" />
      
      <p className="text-muted-foreground mb-8">
        Wähle deine aktuelle Stimmung und wir erstellen die perfekte Playlist für dich
      </p>

      {/* Mood Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {moods.map((mood) => {
          const Icon = mood.icon;
          return (
            <Card
              key={mood.value}
              className={`p-6 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                selectedMood === mood.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMood(mood.value)}
              data-testid={`card-mood-${mood.value}`}
            >
              <div className="text-center">
                <Icon 
                  className="w-12 h-12 mx-auto mb-3" 
                  style={{ color: mood.color }}
                  weight="fill"
                />
                <p className="font-medium text-sm">{mood.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!selectedMood || generateMutation.isPending}
        className="w-full md:w-auto mb-8"
        size="lg"
        data-testid="button-generate-playlist"
      >
        {generateMutation.isPending ? (
          <span className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 animate-spin" />
            Erstelle Playlist...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <MusicNotes className="w-5 h-5" />
            Sound Match generieren
          </span>
        )}
      </Button>

      {/* Generated Playlist Info */}
      {selectedMoodData && (
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-3">Deine Stimmung:</h3>
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedMoodData.color + '20' }}
            >
              <selectedMoodData.icon 
                className="w-6 h-6" 
                style={{ color: selectedMoodData.color }}
              />
            </div>
            <div>
              <p className="font-medium">{selectedMoodData.label}</p>
              <p className="text-sm text-muted-foreground">
                Genres: {selectedMoodData.genres.join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-6 glass">
        <h3 className="font-bold text-lg mb-2">Wie funktioniert Sound Match?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✨ Wähle deine aktuelle Stimmung aus</li>
          <li>🎵 Unser Algorithmus analysiert passende Genres und Tempos</li>
          <li>🎧 Erhalte eine personalisierte Playlist mit 30+ Songs</li>
          <li>💾 Playlist wird automatisch in deiner Bibliothek gespeichert</li>
        </ul>
      </Card>
    </div>
  );
}
