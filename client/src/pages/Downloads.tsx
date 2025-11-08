import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, Music, Album, ListMusic, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineDownload {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumName?: string;
  albumArt?: string;
  quality: string;
  fileSizeBytes?: number;
  downloadedAt: string;
}

interface StorageUsage {
  totalBytes: number;
  totalMB: number;
}

export default function Downloads() {
  const { toast } = useToast();
  const userId = 'demo-user';

  const { data: downloads = [], isLoading } = useQuery<OfflineDownload[]>({
    queryKey: [`/api/downloads/${userId}`],
  });

  const { data: storageUsage } = useQuery<StorageUsage>({
    queryKey: [`/api/downloads/${userId}/storage`],
  });

  const deleteDownloadMutation = useMutation({
    mutationFn: (downloadId: string) => apiRequest('DELETE', `/api/downloads/${downloadId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/downloads/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/downloads/${userId}/storage`] });
      toast({
        title: 'Download gelöscht',
        description: 'Der Download wurde erfolgreich entfernt.',
      });
    },
    onError: () => {
      toast({
        title: 'Fehler',
        description: 'Download konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    },
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-- MB';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const maxStorageMB = 5000;
  const usedPercentage = storageUsage 
    ? Math.min((storageUsage.totalMB / maxStorageMB) * 100, 100)
    : 0;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Lädt Downloads...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Offline Downloads</h1>
        <p className="text-muted-foreground">
          Verwalte deine heruntergeladenen Songs und Alben
        </p>
      </div>

      <Card data-testid="card-storage-usage">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Speicherplatz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Verwendet</span>
            <span data-testid="text-storage-used" className="font-medium">
              {storageUsage?.totalMB || 0} MB / {maxStorageMB} MB
            </span>
          </div>
          <Progress 
            value={usedPercentage} 
            className="h-2" 
            data-testid="progress-storage"
          />
          <p className="text-xs text-muted-foreground">
            {Math.round(100 - usedPercentage)}% verfügbar
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Deine Downloads ({downloads.length})
        </h2>

        {downloads.length === 0 ? (
          <Card data-testid="card-empty-state">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Noch keine Downloads</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Lade Songs, Alben oder Playlists herunter, um sie offline zu hören.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {downloads.map((download) => (
              <Card 
                key={download.id} 
                className="hover-elevate"
                data-testid={`card-download-${download.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-muted rounded flex items-center justify-center">
                      {download.albumArt ? (
                        <img 
                          src={download.albumArt} 
                          alt={download.trackName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-semibold truncate" 
                        data-testid={`text-download-name-${download.id}`}
                      >
                        {download.trackName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {download.artistName}
                        {download.albumName && ` • ${download.albumName}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{download.quality.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatFileSize(download.fileSizeBytes)}</span>
                        <span>•</span>
                        <span>{formatDate(download.downloadedAt)}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDownloadMutation.mutate(download.id)}
                      disabled={deleteDownloadMutation.isPending}
                      data-testid={`button-delete-${download.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
