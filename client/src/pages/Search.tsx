import { Card } from '@/components/Card';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useMKCatalog } from '@/hooks/useMKCatalog';
import { MagnifyingGlass, YoutubeLogo } from '@phosphor-icons/react/dist/ssr';
import { useQuery } from '@tanstack/react-query';
import type { Release, MKMediaItem } from '@shared/schema';
import { usePlayer } from '@/store/usePlayer';
import { Badge } from '@/components/ui/badge';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { searchCatalog } = useMKCatalog();
  const { setCurrentVideoId } = usePlayer();
  
  // Advanced filters
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  
  // YouTube results
  const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Listen for URL changes and update searchQuery
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);

    const handleUrlChange = () => {
      const newParams = new URLSearchParams(window.location.search);
      const newQuery = newParams.get('q') || '';
      setSearchQuery(newQuery);
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
      setYoutubeResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Search Apple Music / MusicKit
        const results = await searchCatalog(searchQuery);
        
        // Search database releases
        const query = searchQuery.toLowerCase();
        const matchingDbReleases = dbReleases.filter(release =>
          release.title.toLowerCase().includes(query) ||
          release.artistName.toLowerCase().includes(query) ||
          release.genre.toLowerCase().includes(query)
        );
        
        const matchedConvertedDbReleases = matchingDbReleases.map(convertReleaseToMKItem);
        
        // Search YouTube Music
        try {
          setYoutubeError(null);
          const ytResponse = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery + ' official audio')}&maxResults=10`);
          if (ytResponse.ok) {
            const ytData = await ytResponse.json();
            setYoutubeResults(ytData.videos || []);
          } else if (ytResponse.status === 429) {
            const ytData = await ytResponse.json();
            setYoutubeError(ytData.error || 'Rate limit erreicht - bitte später erneut versuchen');
            setYoutubeResults([]);
          } else {
            setYoutubeResults([]);
          }
        } catch (ytError) {
          console.warn('YouTube search failed:', ytError);
          setYoutubeResults([]);
        }
        
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
  }, [searchQuery, dbReleases]);

  let displaySongs = searchQuery.trim() 
    ? (searchResults?.songs || []) 
    : convertedDbReleases;
    
  // Apply filters
  if (genreFilter) {
    displaySongs = displaySongs.filter((song: any) => 
      song.attributes?.genreNames?.some((g: string) => 
        g.toLowerCase().includes(genreFilter.toLowerCase())
      )
    );
  }
  
  if (yearFilter && /^\d{4}$/.test(yearFilter)) {
    displaySongs = displaySongs.filter((song: any) => {
      const releaseDate = song.attributes?.releaseDate;
      if (!releaseDate) return false;
      try {
        const date = new Date(releaseDate);
        if (isNaN(date.getTime())) return false;
        const year = date.getFullYear().toString();
        return year === yearFilter;
      } catch {
        return false;
      }
    });
  }

  const headingText = searchQuery.trim() ? 'Ergebnisse' : 'Alle Tracks';

  const handleYoutubePlay = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  return (
    <div className="min-h-screen pb-32">
      <h1 className="text-heading font-bold mb-6" data-testid="text-search-title">
        Suchen
      </h1>
      
      {/* Advanced Filters */}
      {searchQuery.trim() && (
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Genre filtern..."
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="px-4 py-2 rounded-md bg-card text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="input-genre-filter"
          />
          <input
            type="text"
            placeholder="Jahr (z.B. 2024)..."
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 rounded-md bg-card text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="input-year-filter"
          />
          {(genreFilter || yearFilter) && (
            <button
              onClick={() => {
                setGenreFilter('');
                setYearFilter('');
              }}
              className="px-4 py-2 rounded-md bg-muted/20 text-muted-foreground hover:bg-muted/30"
              data-testid="button-clear-filters"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      )}

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

      {/* YouTube Music Results - Vertical List (No Logo) */}
      {searchQuery.trim() && (youtubeResults.length > 0 || youtubeError) && (
        <section className="mt-8">
          <h2 className="text-subheading font-bold mb-4">
            Weitere Ergebnisse
          </h2>
          {youtubeError ? (
            <div className="glass rounded-lg p-6 text-center">
              <p className="text-muted-foreground">{youtubeError}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {youtubeResults.map((video: any, index: number) => (
                <div
                  key={video.videoId}
                  onClick={() => handleYoutubePlay(video.videoId)}
                  className="glass rounded-lg p-3 hover-elevate cursor-pointer group flex items-center gap-3"
                  data-testid={`youtube-result-${index}`}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {video.channelTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
