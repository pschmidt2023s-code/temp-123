import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Trash, Plus, SpeakerHigh, WifiHigh, CloudArrowDown } from '@phosphor-icons/react';
import { startRegistration } from '@simplewebauthn/browser';
import type { UserSettings } from '@shared/schema';

export default function Settings() {
  const { toast } = useToast();
  const userId = localStorage.getItem('userId') || 'demo-user';

  const [show2FADialog, setShow2FADialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [showPasskeyDialog, setShowPasskeyDialog] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');

  const { data: user } = useQuery<any>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ['/api/settings', userId],
    queryFn: async () => {
      const res = await fetch(`/api/settings/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: passkeys = [], refetch: refetchPasskeys } = useQuery<any[]>({
    queryKey: ['/api/auth/webauthn/credentials', userId],
    enabled: !!userId,
  });

  // Update Settings Mutation
  const updateSettings = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      return await apiRequest('PATCH', `/api/settings/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings', userId] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 2FA Setup Mutation
  const setup2FA = useMutation({
    mutationFn: async () => {
      return await apiRequest<{ qrCode: string; secret: string; backupCodes: string[] }>(
        'POST',
        '/api/auth/2fa/setup',
        { userId }
      );
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setShow2FADialog(true);
    },
  });

  // 2FA Enable Mutation
  const enable2FA = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest('POST', '/api/auth/2fa/enable', { userId, token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      setShow2FADialog(false);
      setVerifyCode('');
      toast({
        title: "2FA aktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert",
      });
    },
  });

  // 2FA Disable Mutation
  const disable2FA = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest('POST', '/api/auth/2fa/disable', { userId, password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "2FA deaktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde deaktiviert",
      });
    },
  });

  // Passkey Registration
  const registerPasskey = async () => {
    try {
      const optionsResponse = await apiRequest<any>(
        'POST',
        '/api/auth/webauthn/register-options',
        { userId }
      );

      const registrationResponse = await startRegistration(optionsResponse);

      await apiRequest('POST', '/api/auth/webauthn/register-verify', {
        userId,
        response: registrationResponse,
        deviceName: passkeyName || 'Mein Gerät',
      });

      refetchPasskeys();
      setShowPasskeyDialog(false);
      setPasskeyName('');

      toast({
        title: "Passkey registriert",
        description: "Ihr Passkey wurde erfolgreich registriert",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || 'Passkey-Registrierung fehlgeschlagen',
        variant: "destructive",
      });
    }
  };

  // Delete Passkey
  const deletePasskey = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/auth/webauthn/credentials/${id}`);
    },
    onSuccess: () => {
      refetchPasskeys();
      toast({
        title: "Passkey gelöscht",
        description: "Der Passkey wurde erfolgreich gelöscht",
      });
    },
  });

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Einstellungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 pb-32 px-4 md:px-8">
      <h1 className="text-heading font-bold mb-6 text-center md:text-left" data-testid="text-settings-title">Einstellungen</h1>

      <Tabs defaultValue="audio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audio" data-testid="tab-audio" className="flex flex-col md:flex-row items-center justify-center gap-1 py-2">
            <SpeakerHigh size={18} weight="bold" />
            <span className="text-xs md:text-sm">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="streaming" data-testid="tab-streaming" className="flex flex-col md:flex-row items-center justify-center gap-1 py-2">
            <WifiHigh size={18} weight="bold" />
            <span className="text-xs md:text-sm">Streaming</span>
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security" className="flex flex-col md:flex-row items-center justify-center gap-1 py-2">
            <Shield size={18} weight="bold" />
            <span className="text-xs md:text-sm">Sicherheit</span>
          </TabsTrigger>
        </TabsList>

        {/* Audio Settings */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio-Einstellungen</CardTitle>
              <CardDescription>Passen Sie Ihre Klangpräferenzen an</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="fade-in-out">Fade In/Out</Label>
                  <p className="text-sm text-muted-foreground">Sanfte Übergänge zwischen Songs</p>
                </div>
                <Switch
                  id="fade-in-out"
                  checked={settings?.fadeInOut ?? true}
                  onCheckedChange={(checked) => updateSettings.mutate({ fadeInOut: checked })}
                  data-testid="switch-fade-in-out"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-dj">Auto DJ</Label>
                  <p className="text-sm text-muted-foreground">Automatisch ähnliche Songs abspielen</p>
                </div>
                <Switch
                  id="auto-dj"
                  checked={settings?.autoDj ?? false}
                  onCheckedChange={(checked) => updateSettings.mutate({ autoDj: checked })}
                  data-testid="switch-auto-dj"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audio-normalization">Audionormalisierung</Label>
                  <p className="text-sm text-muted-foreground">Gleichmäßige Lautstärke bei allen Songs</p>
                </div>
                <Switch
                  id="audio-normalization"
                  checked={settings?.audioNormalization ?? true}
                  onCheckedChange={(checked) => updateSettings.mutate({ audioNormalization: checked })}
                  data-testid="switch-audio-normalization"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mono-audio">Mono Audio</Label>
                  <p className="text-sm text-muted-foreground">Beide Kanäle auf Mono umschalten</p>
                </div>
                <Switch
                  id="mono-audio"
                  checked={settings?.monoAudio ?? false}
                  onCheckedChange={(checked) => updateSettings.mutate({ monoAudio: checked })}
                  data-testid="switch-mono-audio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equalizer">Equalizer</Label>
                <Select
                  value={settings?.equalizer || 'off'}
                  onValueChange={(value) => updateSettings.mutate({ equalizer: value })}
                >
                  <SelectTrigger id="equalizer" data-testid="select-equalizer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Aus</SelectItem>
                    <SelectItem value="acoustic">Akustik</SelectItem>
                    <SelectItem value="bass_boost">Bass Boost</SelectItem>
                    <SelectItem value="treble_boost">Höhen Boost</SelectItem>
                    <SelectItem value="vocal_boost">Vocal Boost</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaming Settings */}
        <TabsContent value="streaming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaming & Downloads</CardTitle>
              <CardDescription>Datenverbrauch und Qualität verwalten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-saver">Data Saver</Label>
                  <p className="text-sm text-muted-foreground">Reduziert Datenverbrauch</p>
                </div>
                <Switch
                  id="data-saver"
                  checked={settings?.dataSaver ?? false}
                  onCheckedChange={(checked) => updateSettings.mutate({ dataSaver: checked })}
                  data-testid="switch-data-saver"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="download-cellular">Über Mobilfunk herunterladen</Label>
                  <p className="text-sm text-muted-foreground">Downloads auch über mobile Daten erlauben</p>
                </div>
                <Switch
                  id="download-cellular"
                  checked={settings?.downloadOverCellular ?? false}
                  onCheckedChange={(checked) => updateSettings.mutate({ downloadOverCellular: checked })}
                  data-testid="switch-download-cellular"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="picture-in-picture">Bild-in-Bild Modus</Label>
                  <p className="text-sm text-muted-foreground">Video-Player im Miniaturformat</p>
                </div>
                <Switch
                  id="picture-in-picture"
                  checked={settings?.pictureInPicture ?? true}
                  onCheckedChange={(checked) => updateSettings.mutate({ pictureInPicture: checked })}
                  data-testid="switch-picture-in-picture"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-bandwidth">Automatische Anpassung nach Bandbreite</Label>
                  <p className="text-sm text-muted-foreground">Qualität automatisch anpassen</p>
                </div>
                <Switch
                  id="auto-bandwidth"
                  checked={settings?.autoBandwidthAdjust ?? true}
                  onCheckedChange={(checked) => updateSettings.mutate({ autoBandwidthAdjust: checked })}
                  data-testid="switch-auto-bandwidth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream-quality">Medienqualität beim Streamen</Label>
                <Select
                  value={settings?.streamQuality || 'high'}
                  onValueChange={(value) => updateSettings.mutate({ streamQuality: value })}
                >
                  <SelectTrigger id="stream-quality" data-testid="select-stream-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig (64 kbit/s)</SelectItem>
                    <SelectItem value="normal">Normal (128 kbit/s)</SelectItem>
                    <SelectItem value="high">Hoch (256 kbit/s)</SelectItem>
                    <SelectItem value="best">Beste (320 kbit/s)</SelectItem>
                    <SelectItem value="lossless">Lossless (FLAC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cellular-quality">Medienqualität für Mobilfunk</Label>
                <Select
                  value={settings?.cellularQuality || 'normal'}
                  onValueChange={(value) => updateSettings.mutate({ cellularQuality: value })}
                >
                  <SelectTrigger id="cellular-quality" data-testid="select-cellular-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig (64 kbit/s)</SelectItem>
                    <SelectItem value="normal">Normal (128 kbit/s)</SelectItem>
                    <SelectItem value="high">Hoch (256 kbit/s)</SelectItem>
                    <SelectItem value="best">Beste (320 kbit/s)</SelectItem>
                    <SelectItem value="lossless">Lossless (FLAC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          {/* 2FA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={24} weight="bold" />
                Zwei-Faktor-Authentifizierung (2FA)
              </CardTitle>
              <CardDescription>
                Erhöhen Sie die Sicherheit Ihres Kontos mit 2FA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <Shield size={20} weight="fill" />
                    <span className="font-medium">2FA ist aktiviert</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const password = prompt('Passwort eingeben, um 2FA zu deaktivieren:');
                      if (password) disable2FA.mutate(password);
                    }}
                    data-testid="button-disable-2fa"
                  >
                    2FA deaktivieren
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setup2FA.mutate()}
                  disabled={setup2FA.isPending}
                  data-testid="button-setup-2fa"
                >
                  <Shield size={20} weight="bold" className="mr-2" />
                  {setup2FA.isPending ? '2FA wird eingerichtet...' : '2FA einrichten'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Passkeys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={24} weight="bold" />
                Passkeys (Biometrische Anmeldung)
              </CardTitle>
              <CardDescription>
                Melden Sie sich mit Face ID, Touch ID oder Windows Hello an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowPasskeyDialog(true)}
                data-testid="button-add-passkey"
              >
                <Plus size={20} weight="bold" className="mr-2" />
                Passkey hinzufügen
              </Button>

              {passkeys.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Ihre Passkeys:</h3>
                  {passkeys.map((passkey: any) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{passkey.deviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          Erstellt: {new Date(passkey.createdAt).toLocaleDateString('de-DE')}
                          {passkey.lastUsedAt && ` • Zuletzt verwendet: ${new Date(passkey.lastUsedAt).toLocaleDateString('de-DE')}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Passkey wirklich löschen?')) {
                            deletePasskey.mutate(passkey.id);
                          }
                        }}
                        data-testid={`button-delete-passkey-${passkey.id}`}
                      >
                        <Trash size={18} weight="bold" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>2FA einrichten</DialogTitle>
            <DialogDescription>
              Scannen Sie den QR-Code mit Ihrer Authenticator-App
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Oder geben Sie den Code manuell ein:</Label>
              <Input value={secret} readOnly className="font-mono text-sm" />
            </div>

            {backupCodes.length > 0 && (
              <div className="space-y-2">
                <Label>Backup-Codes (sicher aufbewahren!):</Label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                  {backupCodes.map((code, i) => (
                    <div key={i}>{code}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verifyCode">Bestätigungscode eingeben:</Label>
              <Input
                id="verifyCode"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                data-testid="input-2fa-code"
              />
            </div>

            <Button
              className="w-full"
              onClick={() => enable2FA.mutate(verifyCode)}
              disabled={enable2FA.isPending || !verifyCode}
              data-testid="button-verify-2fa"
            >
              {enable2FA.isPending ? 'Wird verifiziert...' : 'Verifizieren & Aktivieren'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Passkey Setup Dialog */}
      <Dialog open={showPasskeyDialog} onOpenChange={setShowPasskeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passkey hinzufügen</DialogTitle>
            <DialogDescription>
              Geben Sie Ihrem Gerät einen Namen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkeyName">Gerätename</Label>
              <Input
                id="passkeyName"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="z.B. iPhone 15 Pro"
                data-testid="input-passkey-name"
              />
            </div>

            <Button
              className="w-full"
              onClick={registerPasskey}
              data-testid="button-register-passkey"
            >
              <Key size={20} weight="bold" className="mr-2" />
              Passkey erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
