import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SignOut, MusicNotes, UploadSimple, ChartLine, User, Trash, Eye } from '@phosphor-icons/react';
import type { Release, ArtistProfile } from '@shared/schema';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ArtistPortal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = localStorage.getItem('userId') || 'demo-user';

  const { data: artistProfile, isLoading: profileLoading } = useQuery<ArtistProfile>({
    queryKey: ['/api/artist/profile', userId],
    queryFn: async () => {
      const res = await fetch(`/api/artist/profile/${userId}`);
      if (!res.ok) throw new Error('Not an artist account');
      return res.json();
    },
  });

  const { data: releases = [], isLoading: releasesLoading } = useQuery<Release[]>({
    queryKey: ['/api/artist/releases', userId],
    queryFn: async () => {
      const res = await fetch(`/api/artist/releases/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch releases');
      return res.json();
    },
    enabled: !!artistProfile,
  });

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setLocation('/login');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
        <div className="text-center">
          <div className="animate-pulse text-primary text-lg">Lade Künstlerprofil...</div>
        </div>
      </div>
    );
  }

  if (!artistProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#121212' }}>
        <Card className="w-full max-w-md glass">
          <CardHeader>
            <CardTitle>Kein Künstlerprofil</CardTitle>
            <CardDescription>
              Dieser Account ist kein Künstler-Account. Bitte verwenden Sie einen Artist-Account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setLocation('/login')}>
              Zur Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#121212' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Artist Portal</h1>
            <p className="text-muted-foreground">
              {artistProfile.artistName}
              {artistProfile.isVerified && (
                <Badge variant="default" className="ml-2">Verifiziert</Badge>
              )}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <SignOut size={20} weight="bold" className="mr-2" />
            Abmelden
          </Button>
        </div>

        <Tabs defaultValue="releases" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="releases" data-testid="tab-releases">
              <MusicNotes size={20} weight="bold" className="mr-2" />
              Meine Releases
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <ChartLine size={20} weight="bold" className="mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User size={20} weight="bold" className="mr-2" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases">
            <ReleasesTab releases={releases} artistProfile={artistProfile} isLoading={releasesLoading} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab artistProfile={artistProfile} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab artistProfile={artistProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ReleasesTab({ releases, artistProfile, isLoading }: { releases: Release[]; artistProfile: ArtistProfile; isLoading: boolean }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const createRelease = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/artist/releases', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Upload failed');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/artist/releases'] });
      toast({
        title: "Release hochgeladen",
        description: "Ihr Release wird jetzt überprüft",
      });
      setIsDialogOpen(false);
      setAudioFile(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (audioFile) {
      formData.append('audio', audioFile);
    }
    
    formData.append('artistId', artistProfile.userId);
    
    createRelease.mutate(formData);
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meine Releases</CardTitle>
            <CardDescription>Verwalten Sie Ihre Musik-Releases</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-release">
                <UploadSimple size={20} weight="bold" className="mr-2" />
                Release hochladen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neues Release hochladen</DialogTitle>
                <DialogDescription>
                  Laden Sie Ihr neues Release hoch. Es wird überprüft bevor es veröffentlicht wird.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input id="title" name="title" required placeholder="Song-Titel" data-testid="input-title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Typ</Label>
                  <Select name="type" defaultValue="single" required>
                    <SelectTrigger data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="ep">EP</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isrc">ISRC (optional)</Label>
                  <Input id="isrc" name="isrc" placeholder="z.B. USXX12345678" data-testid="input-isrc" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upc">UPC/EAN (optional)</Label>
                  <Input id="upc" name="upc" placeholder="z.B. 123456789012" data-testid="input-upc" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio">Audio-Datei</Label>
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    required
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    data-testid="input-audio-file"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createRelease.isPending} data-testid="button-submit-release">
                  {createRelease.isPending ? 'Lädt hoch...' : 'Hochladen'}
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
          <div className="text-center py-8 text-muted-foreground">
            Keine Releases vorhanden. Laden Sie Ihr erstes Release hoch!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hochgeladen</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell className="font-medium">{release.title}</TableCell>
                  <TableCell>{release.type}</TableCell>
                  <TableCell>
                    <Badge variant={
                      release.status === 'published' ? 'default' :
                      release.status === 'approved' ? 'secondary' :
                      release.status === 'rejected' ? 'destructive' :
                      'outline'
                    }>
                      {release.status === 'published' ? 'Veröffentlicht' :
                       release.status === 'approved' ? 'Genehmigt' :
                       release.status === 'rejected' ? 'Abgelehnt' :
                       'In Prüfung'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(release.uploadedAt!), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" data-testid={`button-view-${release.id}`}>
                      <Eye size={20} weight="bold" />
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

function AnalyticsTab({ artistProfile }: { artistProfile: ArtistProfile }) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/artist/analytics', artistProfile.userId],
    queryFn: async () => {
      const res = await fetch(`/api/artist/analytics/${artistProfile.userId}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lädt Analytics...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Gesamte Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {analytics?.totalStreams?.toLocaleString() || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Hörstunden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {Math.floor((analytics?.totalMinutes || 0) / 60).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Top Land</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {analytics?.topCountries?.[0]?.country || '—'}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {analytics?.topCountries?.[0]?.streams?.toLocaleString() || 0} Streams
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileTab({ artistProfile }: { artistProfile: ArtistProfile }) {
  const { toast } = useToast();

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', `/api/artist/profile/${artistProfile.userId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/artist/profile'] });
      toast({
        title: "Profil aktualisiert",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfile.mutate({
      bio: formData.get('bio'),
    });
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Profil bearbeiten</CardTitle>
        <CardDescription>Aktualisieren Sie Ihre Künstlerinformationen</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Künstlername</Label>
            <Input value={artistProfile.artistName} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={artistProfile.bio || ''}
              rows={5}
              placeholder="Erzählen Sie etwas über sich..."
              data-testid="input-bio"
            />
          </div>

          <Button type="submit" disabled={updateProfile.isPending} data-testid="button-save-profile">
            {updateProfile.isPending ? 'Speichert...' : 'Profil speichern'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
