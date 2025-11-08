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
  { value: 'custom', label: 'Benutzerdefiniert' },
];

const EQ_BANDS = ['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz'];

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
  const [eqBands, setEqBands] = useState<number[]>([0, 0, 0, 0, 0]);
  const [crossfadeDuration, setCrossfadeDuration] = useState(0);
  const [normalizationEnabled, setNormalizationEnabled] = useState(true);
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(false);
  const [monoAudioEnabled, setMonoAudioEnabled] = useState(false);

  useEffect(() => {
    if (settings) {
      setEqPreset(settings.eqPreset || 'off');
      setEqBands(settings.eqBands ? JSON.parse(settings.eqBands) : [0, 0, 0, 0, 0]);
      setCrossfadeDuration(settings.crossfadeDuration || 0);
      setNormalizationEnabled(settings.normalizationEnabled ?? true);
      setSpatialAudioEnabled(settings.spatialAudioEnabled || false);
      setMonoAudioEnabled(settings.monoAudioEnabled || false);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/audio-settings', data);
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
      eqBands: JSON.stringify(eqBands),
      crossfadeDuration,
      normalizationEnabled,
      spatialAudioEnabled,
      monoAudioEnabled,
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
        <Equalizer size={32} weight="bold" className="text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left" data-testid="heading-audio-settings">Audio-Einstellungen</h1>
      </div>

      <div className="space-y-6">
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4 text-center md:text-left" data-testid="heading-equalizer">Equalizer</h2>
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

            {eqPreset === 'custom' ? (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">Passe jeden Frequenzbereich individuell an</p>
                
                {/* Grafischer Equalizer */}
                <div className="mb-6 p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-end justify-around gap-2 h-48">
                    {EQ_BANDS.map((band, index) => {
                      const value = eqBands[index];
                      const percentage = ((value + 12) / 24) * 100; // -12 to +12 mapped to 0-100%
                      
                      return (
                        <div key={band} className="flex flex-col items-center gap-2 flex-1">
                          <div className="relative w-full h-full flex flex-col justify-end">
                            <div 
                              className="w-full bg-gradient-to-t from-primary via-primary/80 to-primary/60 rounded-t-sm transition-all duration-200 relative"
                              style={{ 
                                height: `${percentage}%`,
                                minHeight: '4px',
                                boxShadow: '0 0 10px rgba(29, 185, 84, 0.3)'
                              }}
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap">
                                {value > 0 ? '+' : ''}{value}dB
                              </div>
                            </div>
                            {/* Center line at 0dB */}
                            <div 
                              className="absolute w-full border-t border-muted-foreground/30"
                              style={{ bottom: '50%' }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{band}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sliders */}
                {EQ_BANDS.map((band, index) => (
                  <div key={band} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">{band}</Label>
                      <span className="text-xs text-muted-foreground">{eqBands[index] > 0 ? '+' : ''}{eqBands[index]}dB</span>
                    </div>
                    <Slider
                      min={-12}
                      max={12}
                      step={1}
                      value={[eqBands[index]]}
                      onValueChange={(val) => {
                        const newBands = [...eqBands];
                        newBands[index] = val[0];
                        setEqBands(newBands);
                      }}
                      data-testid={`slider-eq-${band}`}
                    />
                  </div>
                ))}
              </div>
            ) : eqPreset !== 'off' && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  {eqPreset === 'rock' && 'Verstärkte Bässe und Höhen für kraftvollen Rock-Sound'}
                  {eqPreset === 'pop' && 'Ausgewogener Klang mit betonten Mitten'}
                  {eqPreset === 'jazz' && 'Warme Mitten und sanfte Höhen'}
                  {eqPreset === 'bass_boost' && 'Maximale Bass-Verstärkung'}
                  {eqPreset === 'treble_boost' && 'Kristallklare Höhen'}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4 text-center md:text-left" data-testid="heading-playback">Wiedergabe</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="crossfade-duration">Fade In/Out</Label>
                <span className="text-xs text-muted-foreground">{crossfadeDuration}s</span>
              </div>
              <p className="text-sm text-muted-foreground">Sanfte Übergänge zwischen Songs</p>
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="normalization">Audionormalisierung</Label>
                <p className="text-sm text-muted-foreground">
                  Gleichmäßige Lautstärke
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
                  Immersiver 3D-Sound
                </p>
              </div>
              <Switch
                id="spatial"
                checked={spatialAudioEnabled}
                onCheckedChange={setSpatialAudioEnabled}
                data-testid="switch-spatial-audio"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mono">Mono Audio</Label>
                <p className="text-sm text-muted-foreground">
                  Beide Kanäle auf Mono
                </p>
              </div>
              <Switch
                id="mono"
                checked={monoAudioEnabled}
                onCheckedChange={setMonoAudioEnabled}
                data-testid="switch-mono-audio"
              />
            </div>
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
