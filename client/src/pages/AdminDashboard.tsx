import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/hooks/useAdminAuth';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SignOut, MusicNotes, Link as LinkIcon, Cloud, Copy, Trash, Plus, UploadSimple, Quotes, Users } from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Release, ArtistRegistrationLink, StreamingService, Lyrics, Coupon } from '@shared/schema';
import { releaseTypeEnum } from '@shared/schema';
import { format } from 'date-fns';
import { Ticket } from '@phosphor-icons/react';

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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto md:h-14 p-1 gap-1 md:gap-0">
            <TabsTrigger value="releases" data-testid="tab-releases" className="flex items-center justify-center gap-1.5 h-12 md:h-full text-sm md:text-base font-semibold">
              <MusicNotes size={18} weight="bold" />
              <span className="hidden lg:inline">Releases</span>
            </TabsTrigger>
            <TabsTrigger value="lyrics" data-testid="tab-lyrics" className="flex items-center justify-center gap-1.5 h-12 md:h-full text-sm md:text-base font-semibold">
              <Quotes size={18} weight="bold" />
              <span className="hidden lg:inline">Lyrics</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" data-testid="tab-coupons" className="flex items-center justify-center gap-1.5 h-12 md:h-full text-sm md:text-base font-semibold">
              <Ticket size={18} weight="bold" />
              <span className="hidden lg:inline">Gutscheine</span>
            </TabsTrigger>
            <TabsTrigger value="artists" data-testid="tab-artists" className="flex items-center justify-center gap-1.5 h-12 md:h-full text-sm md:text-base font-semibold">
              <LinkIcon size={18} weight="bold" />
              <span className="hidden lg:inline">Künstler</span>
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services" className="flex items-center justify-center gap-1.5 h-12 md:h-full text-sm md:text-base font-semibold">
              <Cloud size={18} weight="bold" />
              <span className="hidden lg:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users" className="flex items-center justify-center gap-1.5 h-12 md:h-full text-sm md:text-base font-semibold">
              <Users size={18} weight="bold" />
              <span className="hidden lg:inline">Benutzer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases">
            <ReleasesTab />
          </TabsContent>

          <TabsContent value="lyrics">
            <LyricsTab />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsTab />
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);

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

  const updateSubscription = useMutation({
    mutationFn: async ({ userId, tier, status, endDate }: any) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/subscription`, {
        tier,
        status,
        endDate,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Abonnement aktualisiert",
        description: "Das Benutzer-Abonnement wurde erfolgreich aktualisiert",
      });
      setIsSubDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Abonnement konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    },
  });

  const handleSubscriptionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateSubscription.mutate({
      userId: selectedUser.id,
      tier: formData.get('tier') as string,
      status: formData.get('status') as string,
      endDate: formData.get('endDate') || null,
    });
  };

  const getTierBadge = (tier: string) => {
    const tierColors: Record<string, string> = {
      free: 'bg-muted text-muted-foreground',
      plus: 'bg-blue-500 text-white',
      premium: 'bg-purple-500 text-white',
      family: 'bg-primary text-primary-foreground',
    };
    const tierNames: Record<string, string> = {
      free: 'Free',
      plus: 'Plus',
      premium: 'Premium',
      family: 'Family',
    };
    return (
      <Badge className={tierColors[tier] || tierColors.free}>
        {tierNames[tier] || tier}
      </Badge>
    );
  };

  return (
    <>
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
                  <TableHead>Abo</TableHead>
                  <TableHead>Registriert</TableHead>
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
                      {user.subscription ? getTierBadge(user.subscription.tier) : getTierBadge('free')}
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? format(new Date(user.createdAt), 'dd.MM.yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      {user.twoFactorEnabled ? (
                        <span className="text-green-500 text-xs">✓</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsSubDialogOpen(true);
                          }}
                          data-testid={`button-edit-subscription-${user.id}`}
                          title="Abo zuweisen"
                        >
                          <Ticket size={18} weight="bold" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Benutzer "${user.username}" wirklich löschen?`)) {
                              deleteUser.mutate(user.id);
                            }
                          }}
                          data-testid={`button-delete-user-${user.id}`}
                          title="Benutzer löschen"
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

      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abonnement zuweisen</DialogTitle>
            <DialogDescription>
              Weise {selectedUser?.username} ein Abonnement zu
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Abo-Stufe</Label>
              <Select
                name="tier"
                defaultValue={selectedUser?.subscription?.tier || 'free'}
                required
              >
                <SelectTrigger data-testid="select-tier">
                  <SelectValue placeholder="Stufe wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="plus">Plus (4,99€)</SelectItem>
                  <SelectItem value="premium">Premium (9,99€)</SelectItem>
                  <SelectItem value="family">Family (14,99€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                defaultValue={selectedUser?.subscription?.status || 'active'}
                required
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="cancelled">Gekündigt</SelectItem>
                  <SelectItem value="expired">Abgelaufen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Ablaufdatum (optional)</Label>
              <Input
                type="date"
                name="endDate"
                data-testid="input-end-date"
                defaultValue={
                  selectedUser?.subscription?.endDate
                    ? new Date(selectedUser.subscription.endDate).toISOString().split('T')[0]
                    : ''
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubDialogOpen(false)}
                data-testid="button-cancel-subscription"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={updateSubscription.isPending}
                data-testid="button-save-subscription"
              >
                {updateSubscription.isPending ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CouponsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['/api/admin/coupons'],
  });

  const createCoupon = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      setIsDialogOpen(false);
      toast({
        title: "Gutschein erstellt",
        description: "Der Gutscheincode wurde erfolgreich erstellt",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Gutschein konnte nicht erstellt werden",
        variant: "destructive",
      });
    },
  });

  const updateCoupon = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      return apiRequest(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      toast({
        title: "Aktualisiert",
        description: "Gutschein wurde aktualisiert",
      });
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      toast({
        title: "Gelöscht",
        description: "Gutschein wurde gelöscht",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const applicableTiers = [];
    if (formData.get('tier_plus')) applicableTiers.push('plus');
    if (formData.get('tier_premium')) applicableTiers.push('premium');
    if (formData.get('tier_family')) applicableTiers.push('family');

    const data = {
      code: formData.get('code') as string,
      discountType: formData.get('discountType') as string,
      discountValue: parseInt(formData.get('discountValue') as string),
      maxUses: parseInt(formData.get('maxUses') as string),
      validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null,
      applicableTiers: applicableTiers.length > 0 ? applicableTiers : null,
      isActive: true,
    };

    createCoupon.mutate(data);
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    return `${(coupon.discountValue / 100).toFixed(2)}€`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gutscheine</CardTitle>
            <CardDescription>Verwalten Sie Rabatt-Gutscheine für Abonnements</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-coupon">
                <Plus size={20} weight="bold" className="mr-2" />
                Gutschein erstellen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuer Gutschein</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Rabatt-Gutschein
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Gutscheincode *</Label>
                  <Input id="code" name="code" required placeholder="SOMMER2025" data-testid="input-coupon-code" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Rabatt-Typ *</Label>
                    <Select name="discountType" defaultValue="percentage" required>
                      <SelectTrigger data-testid="select-discount-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Prozent (%)</SelectItem>
                        <SelectItem value="fixed">Festbetrag (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">Rabatt-Wert *</Label>
                    <Input id="discountValue" name="discountValue" type="number" required placeholder="10" data-testid="input-discount-value" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max. Verwendungen *</Label>
                  <Input id="maxUses" name="maxUses" type="number" required defaultValue="1" data-testid="input-max-uses" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Gültig bis</Label>
                  <Input id="validUntil" name="validUntil" type="datetime-local" data-testid="input-valid-until" />
                </div>
                <div className="space-y-2">
                  <Label>Gültig für Pläne</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tier_plus" name="tier_plus" data-testid="checkbox-tier-plus" />
                      <Label htmlFor="tier_plus" className="font-normal">Plus (4,99€)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tier_premium" name="tier_premium" data-testid="checkbox-tier-premium" />
                      <Label htmlFor="tier_premium" className="font-normal">Premium (9,99€)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tier_family" name="tier_family" data-testid="checkbox-tier-family" />
                      <Label htmlFor="tier_family" className="font-normal">Family (14,99€)</Label>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Leer lassen für alle Pläne</p>
                </div>
                <Button type="submit" className="w-full" disabled={createCoupon.isPending} data-testid="button-submit-coupon">
                  {createCoupon.isPending ? 'Erstelle...' : 'Gutschein erstellen'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Lädt Gutscheine...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Keine Gutscheine vorhanden</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Rabatt</TableHead>
                <TableHead>Verwendet</TableHead>
                <TableHead>Gültig bis</TableHead>
                <TableHead>Pläne</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell>{formatDiscount(coupon)}</TableCell>
                  <TableCell>{coupon.usedCount || 0} / {coupon.maxUses || '∞'}</TableCell>
                  <TableCell>
                    {coupon.validUntil ? format(new Date(coupon.validUntil), 'dd.MM.yyyy HH:mm') : '—'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {coupon.applicableTiers && coupon.applicableTiers.length > 0 
                      ? coupon.applicableTiers.join(', ') 
                      : 'Alle'}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={coupon.isActive || false}
                      onCheckedChange={(checked) => 
                        updateCoupon.mutate({ id: coupon.id, data: { isActive: !!checked } })
                      }
                      data-testid={`checkbox-coupon-active-${coupon.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCoupon.mutate(coupon.id)}
                      data-testid={`button-delete-coupon-${coupon.id}`}
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
