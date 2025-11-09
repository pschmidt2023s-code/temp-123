import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { defaultThemes, applyTheme, type Theme } from '@/lib/themes';
import { ResponsiveSectionHeader } from '@/components/ResponsivePageHeader';

export default function ThemeSettings() {
  const [selectedTheme, setSelectedTheme] = useState<string>('Spotify Grün');
  
  // Load persisted theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('soundvista-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        setSelectedTheme(theme.name);
        applyTheme(theme);
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }, []);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme.name);
    applyTheme(theme);
    localStorage.setItem('soundvista-theme', JSON.stringify(theme));
  };

  return (
    <div className="min-h-screen pb-32">
      <ResponsiveSectionHeader title="Themes" />
      
      <p className="text-muted-foreground mb-8">
        Wähle dein bevorzugtes Farbschema für SoundVista
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultThemes.map((theme) => (
          <Card 
            key={theme.name}
            className="p-6 cursor-pointer hover-elevate active-elevate-2 relative"
            onClick={() => handleThemeSelect(theme)}
            data-testid={`card-theme-${theme.name.toLowerCase().replace(/\s/g, '-')}`}
          >
            {selectedTheme === theme.name && (
              <div className="absolute top-4 right-4">
                <div className="bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            )}
            
            <h3 className="font-bold text-lg mb-4" data-testid={`text-theme-name-${theme.name}`}>
              {theme.name}
            </h3>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div 
                className="h-12 rounded-md border"
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary"
              />
              <div 
                className="h-12 rounded-md border"
                style={{ backgroundColor: theme.colors.accent }}
                title="Accent"
              />
              <div 
                className="h-12 rounded-md border"
                style={{ backgroundColor: theme.colors.card }}
                title="Card"
              />
            </div>
            
            <Button
              variant={selectedTheme === theme.name ? 'default' : 'outline'}
              className="w-full"
              data-testid={`button-select-theme-${theme.name.toLowerCase().replace(/\s/g, '-')}`}
            >
              {selectedTheme === theme.name ? 'Aktiv' : 'Auswählen'}
            </Button>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-6 glass rounded-lg">
        <h3 className="font-bold text-lg mb-2">Hinweis</h3>
        <p className="text-muted-foreground text-sm">
          Dein ausgewähltes Theme wird lokal gespeichert und beim nächsten Besuch automatisch geladen.
        </p>
      </div>
    </div>
  );
}
