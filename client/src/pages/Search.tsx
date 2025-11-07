import { Card } from '@/components/Card';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
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

const categories = [
  { id: 'all', name: 'Alle', color: 'bg-gradient-to-br from-purple-600 to-blue-600' },
  { id: 'rock', name: 'Rock', color: 'bg-gradient-to-br from-red-600 to-orange-600' },
  { id: 'pop', name: 'Pop', color: 'bg-gradient-to-br from-pink-600 to-purple-600' },
  { id: 'hip-hop', name: 'Hip-Hop', color: 'bg-gradient-to-br from-yellow-600 to-red-600' },
  { id: 'electronic', name: 'Electronic', color: 'bg-gradient-to-br from-cyan-600 to-blue-600' },
  { id: 'jazz', name: 'Jazz', color: 'bg-gradient-to-br from-amber-600 to-yellow-600' },
  { id: 'classical', name: 'Klassik', color: 'bg-gradient-to-br from-indigo-600 to-purple-600' },
  { id: 'country', name: 'Country', color: 'bg-gradient-to-br from-green-600 to-emerald-600' },
];

export default function Search() {
  const [location, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { searchCatalog } = useMKCatalog();

  const { data: dbReleases = [] } = useQuery<Release[]>({
    queryKey: ['/api/releases'],
    queryFn: async () => {
      const response = await fetch('/api/releases?status=published');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location]);

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
        
        const convertedDbReleases = matchingDbReleases.map(convertReleaseToMKItem);
        
        setSearchResults({
          songs: results.songs || [],
          albums: [...convertedDbReleases, ...(results.albums || [])],
          playlists: results.playlists || [],
        });
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({ songs: [], albums: [], playlists: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchCatalog, dbReleases]);

  return (
    <div className="min-h-screen pb-32">
      <h1 className="text-heading font-bold mb-6" data-testid="text-search-title">
        Suchen
      </h1>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'secondary'}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => setActiveCategory(cat.id)}
            data-testid={`chip-category-${cat.id}`}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Search Results */}
      {searchQuery && isSearching ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-muted-foreground">
            <MagnifyingGlass size={24} className="animate-pulse" />
            <span>Suche läuft...</span>
          </div>
        </div>
      ) : searchResults ? (
        <div className="space-y-8">
          {searchResults.songs && searchResults.songs.length > 0 && (
            <section>
              <h2 className="text-subheading font-bold mb-4" data-testid="text-results-songs">
                Songs
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {searchResults.songs.slice(0, 12).map((song: any) => (
                  <Card
                    key={song.id}
                    item={song}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {searchResults.albums && searchResults.albums.length > 0 && (
            <section>
              <h2 className="text-subheading font-bold mb-4" data-testid="text-results-albums">
                Alben
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {searchResults.albums.slice(0, 12).map((album: any) => (
                  <Card
                    key={album.id}
                    item={album}
                    onClick={() => setLocation(`/album/${album.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {searchResults.playlists && searchResults.playlists.length > 0 && (
            <section>
              <h2 className="text-subheading font-bold mb-4" data-testid="text-results-playlists">
                Playlists
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {searchResults.playlists.slice(0, 12).map((playlist: any) => (
                  <Card
                    key={playlist.id}
                    item={playlist}
                    onClick={() => setLocation(`/playlist/${playlist.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {(!searchResults.songs || searchResults.songs.length === 0) &&
           (!searchResults.albums || searchResults.albums.length === 0) &&
           (!searchResults.playlists || searchResults.playlists.length === 0) && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Keine Ergebnisse für "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        /* Browse Categories */
        <section>
          <h2 className="text-subheading font-bold mb-4" data-testid="text-browse-all">
            Alle durchsuchen
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(1).map((category) => (
              <div
                key={category.id}
                className={`${category.color} rounded-lg p-6 h-48 flex items-end cursor-pointer card-hover-lift`}
                onClick={() => setActiveCategory(category.id)}
                data-testid={`card-genre-${category.id}`}
              >
                <h3 className="text-2xl font-bold text-white">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
