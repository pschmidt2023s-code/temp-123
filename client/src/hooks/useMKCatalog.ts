import { useQuery } from '@tanstack/react-query';
import { musicKit } from '@/lib/musickit';
import { demoAlbums, demoPlaylists, demoTracks } from '@/lib/demo-data';
import type { MKMediaItem } from '@shared/schema';

export function useMKCatalog() {
  const searchCatalog = async (query: string, types: string[] = ['songs', 'albums', 'playlists']) => {
    const mk = musicKit.getInstance();
    if (!mk) {
      return {
        songs: demoTracks.filter(t => 
          t.attributes.name.toLowerCase().includes(query.toLowerCase())
        ),
        albums: demoAlbums.filter(a => 
          a.attributes.name.toLowerCase().includes(query.toLowerCase())
        ),
        playlists: demoPlaylists.filter(p => 
          p.attributes.name.toLowerCase().includes(query.toLowerCase())
        ),
      };
    }

    try {
      const results = await mk.api.music(`/v1/catalog/de/search`, {
        term: query,
        types: types.join(','),
      });
      return results.data;
    } catch (error) {
      console.error('Search failed:', error);
      return { songs: [], albums: [], playlists: [] };
    }
  };

  const getAlbum = async (id: string): Promise<MKMediaItem | null> => {
    const mk = musicKit.getInstance();
    if (!mk) {
      return demoAlbums.find(a => a.id === id) || null;
    }

    try {
      const response = await mk.api.music(`/v1/catalog/de/albums/${id}`);
      return response.data[0];
    } catch (error) {
      console.error('Failed to fetch album:', error);
      return null;
    }
  };

  const getPlaylist = async (id: string): Promise<MKMediaItem | null> => {
    const mk = musicKit.getInstance();
    if (!mk) {
      return demoPlaylists.find(p => p.id === id) || null;
    }

    try {
      const response = await mk.api.music(`/v1/catalog/de/playlists/${id}`);
      return response.data[0];
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      return null;
    }
  };

  const getArtist = async (id: string): Promise<MKMediaItem | null> => {
    const mk = musicKit.getInstance();
    if (!mk) {
      return null;
    }

    try {
      const response = await mk.api.music(`/v1/catalog/de/artists/${id}`);
      return response.data[0];
    } catch (error) {
      console.error('Failed to fetch artist:', error);
      return null;
    }
  };

  const createStation = async (type: 'songs' | 'artists' | 'albums', id: string) => {
    const mk = musicKit.getInstance();
    if (!mk) {
      console.warn('MusicKit not available for stations');
      return null;
    }

    try {
      const response = await mk.api.music(`/v1/catalog/de/${type}/${id}/station`, {});
      return response.data[0];
    } catch (error) {
      console.error('Failed to create station:', error);
      return null;
    }
  };

  const getRecentlyPlayed = async (): Promise<MKMediaItem[]> => {
    const mk = musicKit.getInstance();
    if (!mk) {
      return [];
    }

    try {
      const response = await mk.api.music('/v1/me/recent/played', {});
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch recently played:', error);
      return [];
    }
  };

  const getRecommendations = async (): Promise<MKMediaItem[]> => {
    const mk = musicKit.getInstance();
    if (!mk) {
      return [];
    }

    try {
      const response = await mk.api.music('/v1/me/recommendations', {});
      const recommendations = response.data?.[0]?.relationships?.contents?.data || [];
      return recommendations.slice(0, 6);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      return [];
    }
  };

  const getNewReleases = async (): Promise<MKMediaItem[]> => {
    const mk = musicKit.getInstance();
    if (!mk) {
      return [];
    }

    try {
      const response = await mk.api.music('/v1/catalog/de/new-releases', {});
      return response.data?.[0]?.relationships?.albums?.data || [];
    } catch (error) {
      console.error('Failed to fetch new releases:', error);
      return [];
    }
  };

  return {
    searchCatalog,
    getAlbum,
    getPlaylist,
    getArtist,
    createStation,
    getRecentlyPlayed,
    getRecommendations,
    getNewReleases,
  };
}
