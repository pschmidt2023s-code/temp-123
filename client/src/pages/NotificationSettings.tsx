import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Check } from 'lucide-react';
import { ResponsiveSectionHeader } from '@/components/ResponsivePageHeader';
import { requestNotificationPermission, sendNotification } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    newReleases: true,
    friendActivity: true,
    playlistUpdates: false,
    liveRoomInvites: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(Notification.permission);
    
    if (granted) {
      toast({
        title: 'Benachrichtigungen aktiviert',
        description: 'Du erhältst jetzt Push-Benachrichtigungen.',
      });
      sendNotification('SoundVista Benachrichtigungen', {
        body: 'Du erhältst jetzt Updates zu neuen Releases, Freunden und mehr!',
      });
    } else {
      toast({
        title: 'Benachrichtigungen abgelehnt',
        description: 'Du kannst dies in deinen Browser-Einstellungen ändern.',
        variant: 'destructive',
      });
    }
  };

  const handleTestNotification = () => {
    sendNotification('Test Benachrichtigung', {
      body: 'Dies ist eine Test-Benachrichtigung von SoundVista!',
    });
    toast({
      title: 'Test gesendet',
      description: 'Überprüfe deine Benachrichtigungen.',
    });
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: settings[key] ? 'Deaktiviert' : 'Aktiviert',
      description: `Benachrichtigungen für ${getLabel(key)} ${settings[key] ? 'aus' : 'ein'}geschaltet.`,
    });
  };

  const getLabel = (key: keyof typeof settings) => {
    const labels = {
      newReleases: 'Neue Releases',
      friendActivity: 'Freunde-Aktivität',
      playlistUpdates: 'Playlist-Updates',
      liveRoomInvites: 'Live Room Einladungen',
    };
    return labels[key];
  };

  return (
    <div className="min-h-screen pb-32">
      <ResponsiveSectionHeader title="Benachrichtigungen" />
      
      <p className="text-muted-foreground mb-8">
        Verwalte deine Push-Benachrichtigungen und bleibe auf dem Laufenden
      </p>

      {/* Permission Status */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <Bell className="w-6 h-6 text-primary" />
            ) : (
              <BellOff className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-bold">Browser-Benachrichtigungen</h3>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' && 'Aktiviert'}
                {permission === 'denied' && 'Blockiert - Bitte in Browser-Einstellungen ändern'}
                {permission === 'default' && 'Noch nicht aktiviert'}
              </p>
            </div>
          </div>
          {permission === 'granted' && (
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Aktiv</span>
            </div>
          )}
        </div>
        
        {permission !== 'granted' && (
          <Button
            onClick={handleRequestPermission}
            disabled={permission === 'denied'}
            className="w-full"
            data-testid="button-enable-notifications"
          >
            Benachrichtigungen aktivieren
          </Button>
        )}
        
        {permission === 'granted' && (
          <Button
            variant="outline"
            onClick={handleTestNotification}
            className="w-full"
            data-testid="button-test-notification"
          >
            Test-Benachrichtigung senden
          </Button>
        )}
      </Card>

      {/* Notification Types */}
      {permission === 'granted' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Benachrichtigungs-Einstellungen</h3>
          
          {Object.entries(settings).map(([key, value]) => (
            <Card key={key} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{getLabel(key as keyof typeof settings)}</p>
                  <p className="text-sm text-muted-foreground">
                    {key === 'newReleases' && 'Benachrichtigung bei neuen Song-Releases'}
                    {key === 'friendActivity' && 'Wenn Freunde Musik hören oder Playlists teilen'}
                    {key === 'playlistUpdates' && 'Wenn jemand deine Playlist aktualisiert'}
                    {key === 'liveRoomInvites' && 'Einladungen zu Live Music Rooms'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={() => handleToggle(key as keyof typeof settings)}
                  data-testid={`switch-${key}`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="p-6 mt-8">
        <h3 className="font-bold text-lg mb-2">Hinweis</h3>
        <p className="text-sm text-muted-foreground">
          Push-Benachrichtigungen funktionieren nur, wenn du SoundVista in deinem Browser geöffnet hast 
          oder als PWA installiert hast. Du kannst Benachrichtigungen jederzeit in deinen Browser-Einstellungen deaktivieren.
        </p>
      </Card>
    </div>
  );
}
