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
import { SignOut, MusicNotes, Link as LinkIcon, Cloud, Copy, Trash, Plus } from '@phosphor-icons/react';
import type { Release, ArtistRegistrationLink, StreamingService } from '@shared/schema';
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="releases" data-testid="tab-releases">
              <MusicNotes size={20} weight="bold" className="mr-2" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="artists" data-testid="tab-artists">
              <LinkIcon size={20} weight="bold" className="mr-2" />
              Künstler-Links
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              <Cloud size={20} weight="bold" className="mr-2" />
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases">
            <ReleasesTab />
          </TabsContent>

          <TabsContent value="artists">
            <ArtistLinksTab />
          </TabsContent>

          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ReleasesTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: releases = [], isLoading } = useQuery<Release[]>({
    queryKey: ['/api/admin/releases'],
  });

  const createRelease = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/admin/releases', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      toast({
        title: "Release erstellt",
        description: "Das Release wurde erfolgreich angelegt",
      });
      setIsDialogOpen(false);
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
      const res = await apiRequest('PATCH', `/api/admin/releases/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      toast({
        title: "Status aktualisiert",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createRelease.mutate({
      title: formData.get('title'),
      artistName: formData.get('artistName'),
      releaseDate: new Date(formData.get('releaseDate') as string),
      coverUrl: formData.get('coverUrl') || null,
      trackCount: parseInt(formData.get('trackCount') as string) || 0,
      catalogId: formData.get('catalogId') || null,
      isrc: formData.get('isrc') || null,
      upc: formData.get('upc') || null,
      status: 'pending',
    });
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel *</Label>
                    <Input id="title" name="title" required data-testid="input-release-title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artistName">Künstler *</Label>
                    <Input id="artistName" name="artistName" required data-testid="input-release-artist" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release-Datum *</Label>
                    <Input id="releaseDate" name="releaseDate" type="date" required data-testid="input-release-date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trackCount">Anzahl Tracks</Label>
                    <Input id="trackCount" name="trackCount" type="number" defaultValue="0" data-testid="input-release-tracks" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="coverUrl">Cover URL</Label>
                    <Input id="coverUrl" name="coverUrl" type="url" placeholder="https://..." data-testid="input-release-cover" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catalogId">Catalog ID</Label>
                    <Input id="catalogId" name="catalogId" placeholder="Apple Music ID" data-testid="input-release-catalog" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isrc">ISRC</Label>
                    <Input id="isrc" name="isrc" placeholder="USRC12345678" data-testid="input-release-isrc" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="upc">UPC</Label>
                    <Input id="upc" name="upc" placeholder="123456789012" data-testid="input-release-upc" />
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
