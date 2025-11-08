import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Radio, Play, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface CustomRadioStation {
  id: string;
  userId: string;
  name: string;
  seedType: 'artist' | 'song' | 'genre';
  seedId: string;
  seedName: string;
  seedArtwork?: string;
  createdAt: string;
  lastPlayedAt?: string;
  playCount: number;
}

export default function RadioStations() {
  const { toast } = useToast();
  const userId = 'demo-user';
  const [showCreate, setShowCreate] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    seedType: 'artist' as 'artist' | 'song' | 'genre',
    seedId: '',
    seedName: '',
  });

  const { data: stations = [], isLoading } = useQuery<CustomRadioStation[]>({
    queryKey: [`/api/radio/${userId}`],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/radio', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/radio/${userId}`] });
      setShowCreate(false);
      setNewStation({ name: '', seedType: 'artist', seedId: '', seedName: '' });
      toast({
        title: 'Radio Station erstellt',
        description: 'Deine Radio Station wurde erfolgreich erstellt.',
      });
    },
    onError: () => {
      toast({
        title: 'Fehler',
        description: 'Radio Station konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (stationId: string) => apiRequest('DELETE', `/api/radio/${stationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/radio/${userId}`] });
      toast({
        title: 'Radio Station gelöscht',
        description: 'Die Radio Station wurde erfolgreich entfernt.',
      });
    },
  });

  const playMutation = useMutation({
    mutationFn: (stationId: string) => apiRequest('POST', `/api/radio/${stationId}/play`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/radio/${userId}`] });
    },
  });

  const handleCreateStation = () => {
    if (!newStation.name || !newStation.seedId || !newStation.seedName) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle alle Felder aus.',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate({ userId, ...newStation });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Lädt Radio Stations...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Custom Radio Stations</h1>
          <p className="text-muted-foreground">
            Erstelle personalisierte Radio Stations basierend auf deinen Lieblingskünstlern oder Songs
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} data-testid="button-create-station">
          <Plus className="w-4 h-4 mr-2" />
          Neue Station
        </Button>
      </div>

      {showCreate && (
        <Card data-testid="card-create-station">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Neue Radio Station erstellen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="station-name">Station Name</Label>
              <Input
                id="station-name"
                value={newStation.name}
                onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                placeholder="z.B. Meine Rock Radio"
                data-testid="input-station-name"
              />
            </div>
            <div>
              <Label htmlFor="seed-type">Station Typ</Label>
              <Select value={newStation.seedType} onValueChange={(val: 'artist' | 'song' | 'genre') => setNewStation({ ...newStation, seedType: val })}>
                <SelectTrigger id="seed-type" data-testid="select-seed-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Künstler</SelectItem>
                  <SelectItem value="song">Song</SelectItem>
                  <SelectItem value="genre">Genre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="seed-id">Seed ID (MusicKit ID)</Label>
              <Input
                id="seed-id"
                value={newStation.seedId}
                onChange={(e) => setNewStation({ ...newStation, seedId: e.target.value })}
                placeholder="z.B. 12345"
                data-testid="input-seed-id"
              />
            </div>
            <div>
              <Label htmlFor="seed-name">Seed Name</Label>
              <Input
                id="seed-name"
                value={newStation.seedName}
                onChange={(e) => setNewStation({ ...newStation, seedName: e.target.value })}
                placeholder="z.B. AC/DC"
                data-testid="input-seed-name"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateStation} disabled={createMutation.isPending} data-testid="button-submit-station">
                Erstellen
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)} data-testid="button-cancel-station">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Deine Radio Stations ({stations.length})
        </h2>

        {stations.length === 0 ? (
          <Card data-testid="card-empty-state">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Radio className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Noch keine Radio Stations</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Erstelle deine erste personalisierte Radio Station basierend auf deinen Lieblingskünstlern oder Songs
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((station) => (
              <Card key={station.id} className="hover-elevate" data-testid={`card-radio-${station.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{station.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(station.id)}
                      data-testid={`button-delete-${station.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Seed</p>
                    <p className="font-medium">{station.seedName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{station.seedType}</p>
                  </div>
                  {station.playCount > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {station.playCount}x abgespielt
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => playMutation.mutate(station.id)}
                    data-testid={`button-play-${station.id}`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Abspielen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
