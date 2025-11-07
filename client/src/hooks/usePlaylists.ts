import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Playlist, InsertPlaylist } from '@shared/schema';

const DEMO_USER_ID = 'demo-user-1';

export function usePlaylists() {
  const playlistsQuery = useQuery<Playlist[]>({
    queryKey: ['/api/playlists', DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/playlists?userId=${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return response.json();
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (data: Omit<InsertPlaylist, 'userId'>) => {
      return apiRequest('POST', '/api/playlists', {
        ...data,
        userId: DEMO_USER_ID,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playlists', DEMO_USER_ID] });
    },
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Playlist> }) => {
      return apiRequest('PATCH', `/api/playlists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playlists', DEMO_USER_ID] });
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/playlists/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playlists', DEMO_USER_ID] });
    },
  });

  return {
    playlists: playlistsQuery.data || [],
    isLoading: playlistsQuery.isLoading,
    createPlaylist: createPlaylistMutation.mutate,
    updatePlaylist: updatePlaylistMutation.mutate,
    deletePlaylist: deletePlaylistMutation.mutate,
    isCreating: createPlaylistMutation.isPending,
  };
}
