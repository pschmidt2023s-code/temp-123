import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, Check, X, MusicNote } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Friends() {
  const { toast } = useToast();
  const userId = 'demo-user';
  const [searchQuery, setSearchQuery] = useState('');
  const [friendIdInput, setFriendIdInput] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: friends = [] } = useQuery({
    queryKey: ['/api/friends', userId],
    queryFn: async () => {
      const res = await fetch(`/api/friends/${userId}`);
      return res.json();
    },
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['/api/friends', userId, 'pending'],
    queryFn: async () => {
      const res = await fetch(`/api/friends/${userId}/pending`);
      return res.json();
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['/api/friends', userId, 'activity'],
    queryFn: async () => {
      const res = await fetch(`/api/friends/${userId}/activity?limit=20`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return apiRequest('/api/friends/request', 'POST', { userId, friendId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId, 'pending'] });
      setIsAddDialogOpen(false);
      setFriendIdInput('');
      toast({ title: 'Freundschaftsanfrage gesendet!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Anfrage konnte nicht gesendet werden',
        variant: 'destructive',
      });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest(`/api/friends/${requestId}/accept`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId, 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId, 'activity'] });
      toast({ title: 'Freundschaftsanfrage angenommen!' });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest(`/api/friends/${requestId}/reject`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId, 'pending'] });
      toast({ title: 'Anfrage abgelehnt' });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      return apiRequest(`/api/friends/${friendshipId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends', userId, 'activity'] });
      toast({ title: 'Freund entfernt' });
    },
  });

  const filteredFriends = friends.filter((f: any) =>
    f.friend?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users size={32} weight="bold" className="text-primary" />
          <h1 className="text-3xl font-bold" data-testid="heading-friends">Freunde</h1>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-friend">
              <UserPlus size={20} weight="bold" className="mr-2" />
              Freund hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Freund hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Benutzer-ID eingeben
                </label>
                <Input
                  value={friendIdInput}
                  onChange={(e) => setFriendIdInput(e.target.value)}
                  placeholder="z.B. user-12345"
                  data-testid="input-friend-id"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Frage deinen Freund nach seiner Benutzer-ID
                </p>
              </div>
              <Button
                onClick={() => sendRequestMutation.mutate(friendIdInput)}
                disabled={!friendIdInput || sendRequestMutation.isPending}
                className="w-full"
                data-testid="button-send-request"
              >
                {sendRequestMutation.isPending ? 'Wird gesendet...' : 'Anfrage senden'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-14 p-1">
          <TabsTrigger value="friends" data-testid="tab-friends" className="flex items-center justify-center h-full text-sm md:text-base font-semibold">
            <span className="hidden sm:inline">Meine Freunde ({friends.length})</span>
            <span className="sm:hidden">Freunde ({friends.length})</span>
          </TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-requests" className="flex items-center justify-center h-full text-sm md:text-base font-semibold">
            Anfragen ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity" className="flex items-center justify-center h-full text-sm md:text-base font-semibold">
            Aktivitäten
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {friends.length > 0 && (
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Freunde durchsuchen..."
              data-testid="input-search-friends"
            />
          )}

          {filteredFriends.length === 0 ? (
            <Card className="p-12 text-center">
              <Users size={64} weight="light" className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? 'Keine Freunde gefunden' : 'Noch keine Freunde'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery
                  ? 'Versuche einen anderen Suchbegriff'
                  : 'Füge Freunde hinzu und sehe was sie hören'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFriends.map((friendship: any) => (
                <Card key={friendship.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {friendship.friend?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium" data-testid={`friend-name-${friendship.id}`}>
                          {friendship.friend?.username || 'Unbekannter Nutzer'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Freunde seit {new Date(friendship.acceptedAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFriendMutation.mutate(friendship.id)}
                      disabled={removeFriendMutation.isPending}
                      data-testid={`button-remove-${friendship.id}`}
                    >
                      Entfernen
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <UserPlus size={64} weight="light" className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Keine offenen Freundschaftsanfragen</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request: any) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.requester?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium" data-testid={`requester-name-${request.id}`}>
                          {request.requester?.username || 'Unbekannter Nutzer'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.createdAt), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequestMutation.mutate(request.id)}
                        disabled={acceptRequestMutation.isPending}
                        data-testid={`button-accept-${request.id}`}
                      >
                        <Check size={16} weight="bold" className="mr-1" />
                        Annehmen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectRequestMutation.mutate(request.id)}
                        disabled={rejectRequestMutation.isPending}
                        data-testid={`button-reject-${request.id}`}
                      >
                        <X size={16} weight="bold" className="mr-1" />
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {activities.length === 0 ? (
            <Card className="p-12 text-center">
              <MusicNote size={64} weight="light" className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Noch keine Aktivitäten von Freunden</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {activities.map((activity: any) => (
                <Card key={activity.id} className="p-4 hover-elevate">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {activity.user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user?.username}</span> hört
                      </p>
                      <p className="font-semibold" data-testid={`activity-track-${activity.id}`}>
                        {activity.trackName}
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.artistName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: de,
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
