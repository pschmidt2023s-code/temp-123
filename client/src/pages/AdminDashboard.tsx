import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SignOut, MusicNotes, Link as LinkIcon, Cloud, Copy, Trash, Plus, UploadSimple, Quotes } from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Release, ArtistRegistrationLink, StreamingService, Lyrics } from '@shared/schema';
import { releaseTypeEnum } from '@shared/schema';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, logout, username, isLoading } = useAdminAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet",
    });
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#121212' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Willkommen, {username}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            data-testid="button-admin-logout"
          >
            <SignOut size={20} weight="bold" className="mr-2" />
            Abmelden
          </Button>
        </div>

        <Tabs defaultValue="releases" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="releases" data-testid="tab-releases">
              <MusicNotes size={20} weight="bold" className="mr-2" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="lyrics" data-testid="tab-lyrics">
              <Quotes size={20} weight="bold" className="mr-2" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger value="artists" data-testid="tab-artists">
              <LinkIcon size={20} weight="bold" className="mr-2" />
              Künstler-Links
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              <Cloud size={20} weight="bold" className="mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Plus size={20} weight="bold" className="mr-2" />
              Benutzer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases">
            <ReleasesTab />
          </TabsContent>

          <TabsContent value="lyrics">
            <LyricsTab />
          </TabsContent>

          <TabsContent value="artists">
            <ArtistLinksTab />
          </TabsContent>

          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LyricsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<string>('');

  const { data: releases = [] } = useQuery<Release[]>({
    queryKey: ['/api/releases'],
  });

  const { data: allLyrics = [], isLoading } = useQuery<Lyrics[]>({
    queryKey: ['/api/admin/lyrics/all'],
  });

  const createLyrics = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/admin/lyrics', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lyrics/all'] });
      toast({
        title: "Lyrics hinzugefügt",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Lyrics konnten nicht hinzugefügt werden",
        variant: "destructive",
      });
    },
  });

  const deleteLyrics = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/lyrics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lyrics/all'] });
      toast({
        title: "Lyrics gelöscht",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Lyrics konnten nicht gelöscht werden",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const timedLinesText = formData.get('timedLines') as string;
    let timedLines = null;
    
    if (timedLinesText && timedLinesText.trim()) {
      try {
        timedLines = JSON.parse(timedLinesText);
      } catch (error) {
        toast({
          title: "Fehler",
          description: "Ungültiges JSON-Format für Timed Lines",
          variant: "destructive",
        });
        return;
      }
    }

    createLyrics.mutate({
      releaseId: selectedRelease,
      content: formData.get('content'),
      timedLines: timedLines ? JSON.stringify(timedLines) : null,
      language: formData.get('language') || 'de',
    });
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lyrics-Verwaltung</CardTitle>
            <CardDescription>Lyrics mit Word-by-Word Timing hinzufügen</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-lyrics">
                <Plus size={20} weight="bold" className="mr-2" />
                Lyrics hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Lyrics hinzufügen</DialogTitle>
                <CardDescription>
                  Fügen Sie synchronisierte Lyrics für ein Release hinzu
                </CardDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="releaseId">Release</Label>
                  <Select value={selectedRelease} onValueChange={setSelectedRelease} required>
                    <SelectTrigger data-testid="select-release">
                      <SelectValue placeholder="Release auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {releases.map((release) => (
                        <SelectItem key={release.id} value={release.id}>
                          {release.title} - {release.artistName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Lyrics-Text</Label>
                  <Textarea
                    id="content"
                    name="content"
                    required
                    rows={8}
                    placeholder="Vollständiger Lyrics-Text..."
                    data-testid="input-lyrics-content"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timedLines">Timed Lines (JSON, optional)</Label>
                  <Textarea
                    id="timedLines"
                    name="timedLines"
                    rows={10}
                    placeholder={'[\n  {\n    "startTime": 0,\n    "endTime": 4000,\n    "text": "Beispielzeile",\n    "words": [\n      {"word": "Beispiel", "startTime": 0, "endTime": 2000},\n      {"word": "zeile", "startTime": 2000, "endTime": 4000}\n    ]\n  }\n]'}
                    className="font-mono text-xs"
                    data-testid="input-timed-lines"
                  />
                  <p className="text-xs text-muted-foreground">
                    Zeiten in Millisekunden. Optional: Leer lassen für einfache Lyrics.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Sprache</Label>
                  <Select name="language" defaultValue="de">
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={createLyrics.isPending} data-testid="button-submit-lyrics">
                  {createLyrics.isPending ? 'Erstelle...' : 'Lyrics hinzufügen'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Lädt Lyrics...</div>
        ) : allLyrics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Keine Lyrics vorhanden</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Release</TableHead>
                <TableHead>Sprache</TableHead>
                <TableHead>Timing</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLyrics.map((lyrics: any) => (
                <TableRow key={lyrics.id}>
                  <TableCell>{lyrics.releaseTitle || lyrics.releaseId}</TableCell>
                  <TableCell>{lyrics.language?.toUpperCase()}</TableCell>
                  <TableCell>
                    {lyrics.timedLines ? 'Synced' : 'Einfach'}
                  </TableCell>
                  <TableCell>{format(new Date(lyrics.createdAt!), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLyrics.mutate(lyrics.id)}
                      data-testid={`button-delete-lyrics-${lyrics.id}`}
                    >
                      <Trash size={20} weight="bold" className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function UsersTab() {
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gelöscht werden",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benutzer-Verwaltung</CardTitle>
        <CardDescription>
          Verwalte registrierte Benutzer und ihre Abonnements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Lade Benutzer...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Keine Benutzer gefunden
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benutzername</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Registriert</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email || '—'}</TableCell>
                  <TableCell>
                    {user.createdAt ? format(new Date(user.createdAt), 'dd.MM.yyyy HH:mm') : '—'}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'dd.MM.yyyy HH:mm') : 'Nie'}
                  </TableCell>
                  <TableCell>
                    {user.twoFactorEnabled ? (
                      <span className="text-green-500">Aktiv</span>
                    ) : (
                      <span className="text-muted-foreground">Inaktiv</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Benutzer "${user.username}" wirklich löschen?`)) {
                          deleteUser.mutate(user.id);
                        }
                      }}
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash size={18} weight="bold" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ReleasesTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [releaseType, setReleaseType] = useState<'single' | 'ep' | 'album'>('single');
  const [preorderEnabled, setPreorderEnabled] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const { data: releases = [], isLoading } = useQuery<Release[]>({
    queryKey: ['/api/admin/releases'],
  });

  const createRelease = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/admin/releases', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      toast({
        title: "Release erstellt",
        description: "Das Release wurde erfolgreich angelegt",
      });
      setIsDialogOpen(false);
      // Reset form state
      setReleaseType('single');
      setPreorderEnabled(false);
      setPreviewEnabled(false);
      setCoverFile(null);
      setAudioFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Release konnte nicht erstellt werden",
        variant: "destructive",
      });
    },
  });

  const deleteRelease = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/releases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      toast({
        title: "Release gelöscht",
        description: "Das Release wurde entfernt",
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest('PATCH', `/api/admin/releases/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      toast({
        title: "Status aktualisiert",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Upload files first if provided
      let coverFilePath = null;
      let audioFilePath = null;

      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('cover', coverFile);
        const coverRes = await apiRequest<{ filePath: string }>('POST', '/api/admin/upload/cover', coverFormData);
        coverFilePath = coverRes.filePath;
      }

      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('audio', audioFile);
        const audioRes = await apiRequest<{ filePath: string }>('POST', '/api/admin/upload/audio', audioFormData);
        audioFilePath = audioRes.filePath;
      }

      // Prepare release data
      const releaseDateStr = formData.get('releaseDate') + 'T' + formData.get('releaseTime');
      const preorderDateStr = preorderEnabled && formData.get('preorderDate')
        ? formData.get('preorderDate') + 'T' + (formData.get('preorderTime') || '00:00')
        : null;

      const releaseData: any = {
        title: formData.get('title'),
        artistName: formData.get('artistName'),
        releaseDate: new Date(releaseDateStr).toISOString(),
        releaseType: releaseType,
        genre: formData.get('genre'),
        preorderEnabled,
        preorderDate: preorderDateStr ? new Date(preorderDateStr).toISOString() : null,
        previewEnabled,
        previewDurationSeconds: previewEnabled 
          ? parseInt(formData.get('previewDuration') as string)
          : null,
        coverFilePath,
        audioFilePath,
        coverUrl: formData.get('coverUrl') || null,
        trackCount: parseInt(formData.get('trackCount') as string) || 1,
        catalogId: formData.get('catalogId') || null,
        isrc: formData.get('isrc') || null,
        upc: formData.get('upc') || null,
        status: 'pending',
      };

      console.log('Sending release data:', releaseData);
      createRelease.mutate(releaseData);
    } catch (error: any) {
      toast({
        title: "Upload-Fehler",
        description: error.message || "Dateien konnten nicht hochgeladen werden",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Release-Management</CardTitle>
            <CardDescription>Verwalten Sie Musikveröffentlichungen</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-release">
                <Plus size={20} weight="bold" className="mr-2" />
                Release erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neues Release</DialogTitle>
                <DialogDescription>
                  Legen Sie ein neues Musik-Release an
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel *</Label>
                    <Input id="title" name="title" required data-testid="input-release-title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artistName">Künstler *</Label>
                    <Input id="artistName" name="artistName" required data-testid="input-release-artist" />
                  </div>

                  {/* Release Type & Genre */}
                  <div className="space-y-2">
                    <Label htmlFor="releaseType">Release-Typ *</Label>
                    <Select value={releaseType} onValueChange={(value) => setReleaseType(value as 'single' | 'ep' | 'album')}>
                      <SelectTrigger data-testid="select-release-type">
                        <SelectValue placeholder="Wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="ep">EP</SelectItem>
                        <SelectItem value="album">Album</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre/Style *</Label>
                    <Input id="genre" name="genre" required placeholder="z.B. Pop, Rock, Hip-Hop" data-testid="input-release-genre" />
                  </div>

                  {/* Release Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release-Datum *</Label>
                    <Input id="releaseDate" name="releaseDate" type="date" required data-testid="input-release-date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="releaseTime">Uhrzeit</Label>
                    <Input id="releaseTime" name="releaseTime" type="time" defaultValue="00:00" data-testid="input-release-time" />
                  </div>

                  {/* Preorder */}
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="preorderEnabled" 
                        checked={preorderEnabled}
                        onCheckedChange={(checked) => setPreorderEnabled(checked as boolean)}
                        data-testid="checkbox-preorder"
                      />
                      <Label htmlFor="preorderEnabled" className="cursor-pointer">Vorbestellung aktivieren</Label>
                    </div>
                  </div>

                  {preorderEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="preorderDate">Vorbestell-Start *</Label>
                        <Input id="preorderDate" name="preorderDate" type="date" required data-testid="input-preorder-date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preorderTime">Uhrzeit</Label>
                        <Input id="preorderTime" name="preorderTime" type="time" defaultValue="00:00" data-testid="input-preorder-time" />
                      </div>
                    </>
                  )}

                  {/* Preview */}
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="previewEnabled" 
                        checked={previewEnabled}
                        onCheckedChange={(checked) => setPreviewEnabled(checked as boolean)}
                        data-testid="checkbox-preview"
                      />
                      <Label htmlFor="previewEnabled" className="cursor-pointer">Preview aktivieren</Label>
                    </div>
                  </div>

                  {previewEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="previewDuration">Preview-Länge (Sekunden) * (max 30)</Label>
                      <Input 
                        id="previewDuration" 
                        name="previewDuration" 
                        type="number" 
                        min="1" 
                        max="30" 
                        required 
                        placeholder="15"
                        data-testid="input-preview-duration" 
                      />
                    </div>
                  )}

                  {/* File Uploads */}
                  <div className="space-y-2">
                    <Label htmlFor="coverUpload">Cover-Upload</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="coverUpload" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        data-testid="input-cover-upload"
                      />
                      {coverFile && <span className="text-sm text-muted-foreground">{coverFile.name}</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audioUpload">Audio-Datei (Wave) *</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="audioUpload" 
                        type="file" 
                        accept=".wav,audio/wav"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        required
                        data-testid="input-audio-upload"
                      />
                      {audioFile && <span className="text-sm text-muted-foreground">{audioFile.name}</span>}
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-2">
                    <Label htmlFor="trackCount">Anzahl Tracks</Label>
                    <Input id="trackCount" name="trackCount" type="number" defaultValue="1" min="1" data-testid="input-release-tracks" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catalogId">Catalog ID</Label>
                    <Input id="catalogId" name="catalogId" placeholder="Apple Music ID" data-testid="input-release-catalog" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isrc">ISRC</Label>
                    <Input id="isrc" name="isrc" placeholder="USRC12345678" data-testid="input-release-isrc" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upc">UPC</Label>
                    <Input id="upc" name="upc" placeholder="123456789012" data-testid="input-release-upc" />
                  </div>

                  {/* Cover URL (optional fallback) */}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="coverUrl">Cover URL (Fallback)</Label>
                    <Input id="coverUrl" name="coverUrl" type="url" placeholder="https://..." data-testid="input-release-cover" />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createRelease.isPending} data-testid="button-submit-release">
                  {createRelease.isPending ? 'Erstelle...' : 'Release anlegen'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Lädt Releases...</div>
        ) : releases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Keine Releases vorhanden</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Künstler</TableHead>
                <TableHead>Release-Datum</TableHead>
                <TableHead>Tracks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell className="font-medium">{release.title}</TableCell>
                  <TableCell>{release.artistName}</TableCell>
                  <TableCell>{format(new Date(release.releaseDate), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>{release.trackCount}</TableCell>
                  <TableCell>
                    <Select
                      value={release.status}
                      onValueChange={(value) => updateStatus.mutate({ id: release.id, status: value })}
                    >
                      <SelectTrigger className="w-32" data-testid={`select-status-${release.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRelease.mutate(release.id)}
                      data-testid={`button-delete-release-${release.id}`}
                    >
                      <Trash size={18} weight="bold" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ArtistLinksTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: links = [], isLoading } = useQuery<ArtistRegistrationLink[]>({
    queryKey: ['/api/admin/artist-links'],
  });

  const createLink = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/admin/artist-links', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/artist-links'] });
      toast({
        title: "Link erstellt",
        description: "Der Künstler-Registrierungslink wurde generiert",
      });
      setIsDialogOpen(false);
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/artist-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/artist-links'] });
      toast({
        title: "Link gelöscht",
      });
    },
  });

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/artist-register/${code}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link kopiert",
      description: "Der Registrierungslink wurde in die Zwischenablage kopiert",
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLink.mutate({
      artistName: formData.get('artistName') || null,
      email: formData.get('email') || null,
    });
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Künstler-Registrierungslinks</CardTitle>
            <CardDescription>Erstellen Sie einmalige Links für Künstler-Registrierungen</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-artist-link">
                <Plus size={20} weight="bold" className="mr-2" />
                Link generieren
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Künstler-Link generieren</DialogTitle>
                <DialogDescription>
                  Der Link ist 7 Tage gültig und kann einmalig verwendet werden
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artistName">Künstlername (optional)</Label>
                  <Input id="artistName" name="artistName" placeholder="z.B. Max Mustermann" data-testid="input-artist-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail (optional)</Label>
                  <Input id="email" name="email" type="email" placeholder="artist@example.com" data-testid="input-artist-email" />
                </div>
                <Button type="submit" className="w-full" disabled={createLink.isPending} data-testid="button-submit-artist-link">
                  {createLink.isPending ? 'Erstelle...' : 'Link generieren'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Lädt Links...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Keine Links vorhanden</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Künstler</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Läuft ab</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.artistName || '—'}</TableCell>
                  <TableCell>{link.email || '—'}</TableCell>
                  <TableCell>{format(new Date(link.createdAt!), 'dd.MM.yyyy HH:mm')}</TableCell>
                  <TableCell>{format(new Date(link.expiresAt), 'dd.MM.yyyy HH:mm')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      link.isUsed ? 'bg-muted text-muted-foreground' : 
                      new Date() > new Date(link.expiresAt) ? 'bg-destructive/20 text-destructive' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {link.isUsed ? 'Verwendet' : new Date() > new Date(link.expiresAt) ? 'Abgelaufen' : 'Aktiv'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyLink(link.linkCode)}
                        disabled={link.isUsed || new Date() > new Date(link.expiresAt)}
                        data-testid={`button-copy-link-${link.id}`}
                      >
                        <Copy size={18} weight="bold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLink.mutate(link.id)}
                        data-testid={`button-delete-link-${link.id}`}
                      >
                        <Trash size={18} weight="bold" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ServicesTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: services = [], isLoading } = useQuery<StreamingService[]>({
    queryKey: ['/api/admin/services'],
  });

  const createService = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/admin/services', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      toast({
        title: "Service erstellt",
      });
      setIsDialogOpen(false);
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/admin/services/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      toast({
        title: "Service aktualisiert",
      });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      toast({
        title: "Service gelöscht",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createService.mutate({
      name: formData.get('name'),
      status: 'active',
      apiEndpoint: formData.get('apiEndpoint') || null,
    });
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Streaming-Services</CardTitle>
            <CardDescription>Verwalten Sie integrierte Streaming-Dienste</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-service">
                <Plus size={20} weight="bold" className="mr-2" />
                Service hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuer Service</DialogTitle>
                <DialogDescription>
                  Fügen Sie einen Streaming-Dienst hinzu
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service-Name *</Label>
                  <Input id="name" name="name" required placeholder="z.B. Spotify" data-testid="input-service-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input id="apiEndpoint" name="apiEndpoint" type="url" placeholder="https://api.example.com" data-testid="input-service-endpoint" />
                </div>
                <Button type="submit" className="w-full" disabled={createService.isPending} data-testid="button-submit-service">
                  {createService.isPending ? 'Erstelle...' : 'Service erstellen'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Lädt Services...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Keine Services vorhanden</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>API Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{service.apiEndpoint || '—'}</TableCell>
                  <TableCell>
                    <Select
                      value={service.status}
                      onValueChange={(value) => updateService.mutate({ id: service.id, data: { status: value } })}
                    >
                      <SelectTrigger className="w-32" data-testid={`select-service-status-${service.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{format(new Date(service.createdAt!), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteService.mutate(service.id)}
                      data-testid={`button-delete-service-${service.id}`}
                    >
                      <Trash size={18} weight="bold" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
