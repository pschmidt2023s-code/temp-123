import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface CollaboratorDialogProps {
  playlistId: string;
  isOpen: boolean;
  onClose: () => void;
  currentCollaborators: string[];
}

export function CollaboratorDialog({ playlistId, isOpen, onClose, currentCollaborators }: CollaboratorDialogProps) {
  const [username, setUsername] = useState('');
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: (username: string) => 
      apiRequest(`/api/playlists/${playlistId}/collaborators`, 'POST', { username }),
    onSuccess: () => {
      toast({ title: 'Collaborator hinzugefügt' });
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${playlistId}`] });
      setUsername('');
    },
    onError: () => {
      toast({ title: 'Fehler', description: 'Nutzer nicht gefunden', variant: 'destructive' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest(`/api/playlists/${playlistId}/collaborators/${userId}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: 'Collaborator entfernt' });
      queryClient.invalidateQueries({ queryKey: [`/api/playlists/${playlistId}`] });
    },
  });

  const handleAdd = () => {
    if (username.trim()) {
      addMutation.mutate(username.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-collaborators">
        <DialogHeader>
          <DialogTitle>Collaboratoren verwalten</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add Collaborator */}
          <div className="flex gap-2">
            <Input
              placeholder="Benutzername eingeben..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              data-testid="input-collaborator-username"
            />
            <Button
              onClick={handleAdd}
              disabled={!username.trim() || addMutation.isPending}
              data-testid="button-add-collaborator"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Collaborators */}
          {currentCollaborators && currentCollaborators.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Aktuelle Collaboratoren ({currentCollaborators.length})
              </p>
              {currentCollaborators.map((userId) => (
                <Card key={userId} className="p-3 flex items-center justify-between">
                  <span className="text-sm">{userId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMutation.mutate(userId)}
                    data-testid={`button-remove-${userId}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
          
          {(!currentCollaborators || currentCollaborators.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Noch keine Collaboratoren. Füge Freunde hinzu!
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
