import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie } from '@phosphor-icons/react';
import { Link } from 'wouter';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Immer aktiviert
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Prüfen ob Nutzer bereits eine Wahl getroffen hat
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (!savedPreferences) {
      // Banner nach 1 Sekunde anzeigen
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  useEffect(() => {
    // Event Listener für "Cookie-Einstellungen öffnen" aus dem Footer
    // Dieser Listener wird immer registriert, unabhängig von gespeicherten Präferenzen
    const handleOpenSettings = () => {
      const saved = localStorage.getItem('cookiePreferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
      setShowBanner(true);
      setShowSettings(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => {
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
    
    // Hier können Sie Analytics-Scripts laden/entfernen basierend auf den Präferenzen
    if (prefs.analytics) {
      // Analytics-Code laden
      console.log('Analytics aktiviert');
    }
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-primary" weight="fill" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Cookie-Einstellungen</h2>
                <p className="text-sm text-muted-foreground">Wir respektieren Ihre Privatsphäre</p>
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          {!showSettings ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Wir verwenden Cookies und ähnliche Technologien, um Ihnen die bestmögliche Erfahrung auf unserer 
                Website zu bieten. Einige Cookies sind technisch notwendig, während andere uns helfen, die Website 
                zu verbessern und Ihnen personalisierte Inhalte anzubieten.
              </p>
              <p className="text-sm text-muted-foreground">
                Weitere Informationen finden Sie in unserer{' '}
                <Link href="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={acceptAll} 
                  className="flex-1"
                  data-testid="button-accept-all-cookies"
                >
                  Alle akzeptieren
                </Button>
                <Button 
                  onClick={acceptNecessary} 
                  variant="outline" 
                  className="flex-1"
                  data-testid="button-accept-necessary-cookies"
                >
                  Nur notwendige
                </Button>
                <Button 
                  onClick={() => setShowSettings(true)} 
                  variant="ghost" 
                  className="flex-1"
                  data-testid="button-customize-cookies"
                >
                  Anpassen
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Wählen Sie, welche Cookies Sie zulassen möchten. Sie können Ihre Einstellungen jederzeit ändern.
              </p>

              {/* Cookie-Kategorien */}
              <div className="space-y-4">
                {/* Notwendige Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-muted/20">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="necessary" className="text-sm font-semibold text-foreground">
                        Notwendige Cookies
                      </Label>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Erforderlich
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Diese Cookies sind für die Funktion der Website erforderlich und können nicht deaktiviert werden. 
                      Sie werden nur als Reaktion auf Ihre Aktionen gesetzt, wie z.B. Login und Cookie-Einstellungen.
                    </p>
                  </div>
                  <Switch
                    id="necessary"
                    checked={true}
                    disabled={true}
                    data-testid="switch-necessary-cookies"
                  />
                </div>

                {/* Funktionale Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover-elevate transition-all">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="functional" className="text-sm font-semibold text-foreground cursor-pointer">
                      Funktionale Cookies
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Diese Cookies ermöglichen erweiterte Funktionen wie Lautstärke-Einstellungen, Playback-Präferenzen 
                      und personalisierte Inhalte.
                    </p>
                  </div>
                  <Switch
                    id="functional"
                    checked={preferences.functional}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })}
                    data-testid="switch-functional-cookies"
                  />
                </div>

                {/* Analyse-Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover-elevate transition-all">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="analytics" className="text-sm font-semibold text-foreground cursor-pointer">
                      Analyse-Cookies
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem Informationen 
                      anonym gesammelt und analysiert werden.
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                    data-testid="switch-analytics-cookies"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={saveCustomPreferences} 
                  className="flex-1"
                  data-testid="button-save-cookie-preferences"
                >
                  Einstellungen speichern
                </Button>
                <Button 
                  onClick={() => setShowSettings(false)} 
                  variant="outline" 
                  className="flex-1"
                  data-testid="button-back-cookie-settings"
                >
                  Zurück
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
