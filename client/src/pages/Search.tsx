import { Card } from '@/components/Card';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useMKCatalog } from '@/hooks/useMKCatalog';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { useQuery } from '@tanstack/react-query';
import type { Release, MKMediaItem } from '@shared/schema';

function convertReleaseToMKItem(release: Release): MKMediaItem {
  return {
    id: release.id!,
    type: 'songs',
    attributes: {
      name: release.title,
      artistName: release.artistName,
      artwork: release.coverFilePath ? {
        url: release.coverFilePath,
        width: 400,
        height: 400,
      } : undefined,
      genreNames: [release.genre],
      releaseDate: release.releaseDate 
        ? (typeof release.releaseDate === 'string' 
            ? release.releaseDate 
            : release.releaseDate.toISOString())
        : undefined,
      url: release.audioFilePath || undefined,
    } as any,
  };
}


export default function Search() {
  const [location, setLocation] = useLocation();
  const [urlKey, setUrlKey] = useState(0); // Force re-render on URL change
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { searchCatalog } = useMKCatalog();

  // Read search query directly from URL
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q') || '';

  // Listen for URL changes (both pushState and popState)
  useEffect(() => {
    const handleUrlChange = () => {
      setUrlKey(prev => prev + 1); // Force component to re-render
    };

    window.addEventListener('popstate', handleUrlChange);
    
    // Intercept pushState to detect programmatic navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const { data: dbReleases = [] } = useQuery<Release[]>({
    queryKey: ['/api/releases'],
    queryFn: async () => {
      const response = await fetch('/api/releases?status=published');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const convertedDbReleases = useMemo(() => 
    dbReleases.map(convertReleaseToMKItem),
    [dbReleases]
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCatalog(searchQuery);
        
        const query = searchQuery.toLowerCase();
        const matchingDbReleases = dbReleases.filter(release =>
          release.title.toLowerCase().includes(query) ||
          release.artistName.toLowerCase().includes(query) ||
          release.genre.toLowerCase().includes(query)
        );
        
        const matchedConvertedDbReleases = matchingDbReleases.map(convertReleaseToMKItem);
        
        setSearchResults({
          songs: [...matchedConvertedDbReleases, ...(results.songs || [])],
        });
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({ songs: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchCatalog, dbReleases]);

  const displaySongs = searchQuery.trim() 
    ? (searchResults?.songs || []) 
    : convertedDbReleases;

  const headingText = searchQuery.trim() ? 'Ergebnisse' : 'Alle Tracks';

  return (
    <div className="min-h-screen pb-32">
      <h1 className="text-heading font-bold mb-6" data-testid="text-search-title">
        Suchen
      </h1>

      {/* Tracks */}
      {isSearching ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-muted-foreground">
            <MagnifyingGlass size={24} className="animate-pulse" />
            <span>Suche läuft...</span>
          </div>
        </div>
      ) : displaySongs.length > 0 ? (
        <section>
          <h2 className="text-subheading font-bold mb-4" data-testid="text-results-tracks">
            {headingText}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displaySongs.map((song: any) => (
              <Card
                key={song.id}
                item={song}
                onClick={() => {}}
              />
            ))}
          </div>
        </section>
      ) : searchQuery.trim() ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Keine Ergebnisse für "{searchQuery}"</p>
        </div>
      ) : null}
    </div>
  );
}
