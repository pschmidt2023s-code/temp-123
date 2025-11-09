import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { MKMediaItem } from '@shared/schema';

const DEMO_USER_ID = 'demo-user';

interface AIPreferences {
  favoriteGenres: string[] | null;
  favoriteArtists: string[] | null;
  discoveryScore: number | null;
}

interface APIResponse {
  preferences: AIPreferences | null;
  isNew: boolean;
}

export function useAIPersonalization() {
  const { data: apiResponse } = useQuery<APIResponse>({
    queryKey: ['/api/personalization/ai-preferences', DEMO_USER_ID],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/personalization/ai-preferences/${DEMO_USER_ID}`);
        if (!response.ok) {
          return { preferences: null, isNew: true };
        }
        return response.json();
      } catch (error) {
        console.warn('Failed to fetch AI preferences:', error);
        return { preferences: null, isNew: true };
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const preferences = apiResponse?.preferences || null;

  const personalizeReleases = useCallback((releases: MKMediaItem[]): MKMediaItem[] => {
    if (!preferences || !preferences.favoriteGenres || !preferences.favoriteArtists) {
      return releases;
    }

    const favoriteGenres = preferences.favoriteGenres || [];
    const favoriteArtists = preferences.favoriteArtists || [];

    // Score each release based on preferences
    const scored = releases.map(release => {
      let score = 0;
      
      // Check if artist matches favorites
      if (favoriteArtists.some(artist => 
        release.attributes.artistName?.toLowerCase().includes(artist.toLowerCase())
      )) {
        score += 10;
      }

      // Check if genre matches favorites
      const genres = release.attributes.genreNames || [];
      if (genres.some(genre => 
        favoriteGenres.some(fav => genre.toLowerCase().includes(fav.toLowerCase()))
      )) {
        score += 5;
      }

      return { release, score };
    });

    // Sort by score (descending) and return releases
    return scored
      .sort((a, b) => b.score - a.score)
      .map(item => item.release);
  }, [preferences]);

  return {
    preferences,
    personalizeReleases,
    hasPreferences: preferences && ((preferences.favoriteGenres?.length ?? 0) > 0 || (preferences.favoriteArtists?.length ?? 0) > 0),
  };
}
