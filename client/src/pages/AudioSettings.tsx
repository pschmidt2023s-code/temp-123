import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Equalizer, Check } from '@phosphor-icons/react';

const EQ_PRESETS = [
  { value: 'off', label: 'Aus' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'bass_boost', label: 'Bass Boost' },
  { value: 'treble_boost', label: 'Höhen Boost' },
  { value: 'custom', label: 'Eigener EQ' },
];

export default function AudioSettings() {
  const { toast } = useToast();
  const userId = 'demo-user';

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/audio-settings', userId],
    queryFn: async () => {
      const res = await fetch(`/api/audio-settings/${userId}`);
      return res.json();
    },
  });

  const [eqPreset, setEqPreset] = useState('off');
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);
  const [crossfadeDuration, setCrossfadeDuration] = useState(0);
  const [normalizationEnabled, setNormalizationEnabled] = useState(true);
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(false);
  const [vocalReducerEnabled, setVocalReducerEnabled] = useState(false);

  useEffect(() => {
    if (settings) {
      setEqPreset(settings.eqPreset || 'off');
      setCrossfadeEnabled(settings.crossfadeEnabled || false);
      setCrossfadeDuration(settings.crossfadeDuration || 0);
      setNormalizationEnabled(settings.normalizationEnabled ?? true);
      setSpatialAudioEnabled(settings.spatialAudioEnabled || false);
      setVocalReducerEnabled(settings.vocalReducerEnabled || false);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/audio-settings', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audio-settings', userId] });
      toast({
        title: 'Gespeichert',
        description: 'Audio-Einstellungen wurden aktualisiert',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      userId,
      eqPreset,
      crossfadeEnabled,
      crossfadeDuration,
      normalizationEnabled,
      spatialAudioEnabled,
      vocalReducerEnabled,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-md mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Equalizer size={32} weight="bold" className="text-primary" />
        <h1 className="text-3xl font-bold" data-testid="heading-audio-settings">Audio-Einstellungen</h1>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4" data-testid="heading-equalizer">Equalizer</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eq-preset">EQ-Voreinstellung</Label>
              <Select value={eqPreset} onValueChange={setEqPreset}>
                <SelectTrigger id="eq-preset" data-testid="select-eq-preset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQ_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {eqPreset !== 'off' && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  {eqPreset === 'rock' && '🎸 Verstärkte Bässe und Höhen für kraftvollen Rock-Sound'}
                  {eqPreset === 'pop' && '🎤 Ausgewogener Klang mit betonten Mitten für Pop-Musik'}
                  {eqPreset === 'jazz' && '🎷 Warme Mitten und sanfte Höhen für Jazz-Atmosphäre'}
                  {eqPreset === 'bass_boost' && '🔊 Maximale Bass-Verstärkung für intensive Tiefbass-Erlebnisse'}
                  {eqPreset === 'treble_boost' && '✨ Kristallklare Höhen für detailreiche Instrumentierung'}
                  {eqPreset === 'custom' && '⚙️ Eigener EQ - Bald verfügbar'}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4" data-testid="heading-playback">Wiedergabe-Einstellungen</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="crossfade">Überblendung (Crossfade)</Label>
                <p className="text-sm text-muted-foreground">
                  Nahtloser Übergang zwischen Songs
                </p>
              </div>
              <Switch
                id="crossfade"
                checked={crossfadeEnabled}
                onCheckedChange={setCrossfadeEnabled}
                data-testid="switch-crossfade"
              />
            </div>

            {crossfadeEnabled && (
              <div className="space-y-2">
                <Label htmlFor="crossfade-duration">
                  Überblendungsdauer: {crossfadeDuration} Sekunden
                </Label>
                <Slider
                  id="crossfade-duration"
                  min={0}
                  max={12}
                  step={1}
                  value={[crossfadeDuration]}
                  onValueChange={(val) => setCrossfadeDuration(val[0])}
                  data-testid="slider-crossfade-duration"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="normalization">Lautstärke-Normalisierung</Label>
                <p className="text-sm text-muted-foreground">
                  Gleicht Lautstärke-Unterschiede zwischen Songs aus
                </p>
              </div>
              <Switch
                id="normalization"
                checked={normalizationEnabled}
                onCheckedChange={setNormalizationEnabled}
                data-testid="switch-normalization"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="spatial">Spatial Audio</Label>
                <p className="text-sm text-muted-foreground">
                  Immersiver 3D-Sound (erfordert kompatible Kopfhörer)
                </p>
              </div>
              <Switch
                id="spatial"
                checked={spatialAudioEnabled}
                onCheckedChange={setSpatialAudioEnabled}
                data-testid="switch-spatial-audio"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4" data-testid="heading-karaoke">Karaoke-Modus</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vocal-reducer">Vocal Reducer</Label>
                <p className="text-sm text-muted-foreground">
                  Reduziert Gesang für Karaoke-Erlebnis (funktioniert am besten bei zentrierten Vocals)
                </p>
              </div>
              <Switch
                id="vocal-reducer"
                checked={vocalReducerEnabled}
                onCheckedChange={setVocalReducerEnabled}
                data-testid="switch-vocal-reducer"
              />
            </div>

            {vocalReducerEnabled && (
              <div className="p-4 bg-primary/10 rounded-md border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  🎤 Vocal Reducer aktiviert - Perfekt für Karaoke! Der Effekt wird beim Abspielen angewendet.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="w-full sm:w-auto"
          data-testid="button-save-settings"
        >
          <Check size={20} weight="bold" className="mr-2" />
          {saveMutation.isPending ? 'Wird gespeichert...' : 'Einstellungen speichern'}
        </Button>
      </div>
    </div>
  );
}
