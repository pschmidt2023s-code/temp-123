import { Card } from '@/components/Card';
import { useState } from 'react';
import { demoAlbums, demoTracks, demoPlaylists } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

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
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResults = searchQuery
    ? {
        tracks: demoTracks.filter((t) =>
          t.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        albums: demoAlbums.filter((a) =>
          a.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        playlists: demoPlaylists.filter((p) =>
          p.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }
    : null;

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
      {filteredResults ? (
        <div className="space-y-8">
          {filteredResults.albums.length > 0 && (
            <section>
              <h2 className="text-subheading font-bold mb-4" data-testid="text-results-albums">
                Alben
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredResults.albums.map((album) => (
                  <Card
                    key={album.id}
                    item={album}
                    onClick={() => setLocation(`/album/${album.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredResults.playlists.length > 0 && (
            <section>
              <h2 className="text-subheading font-bold mb-4" data-testid="text-results-playlists">
                Playlists
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredResults.playlists.map((playlist) => (
                  <Card
                    key={playlist.id}
                    item={playlist}
                    onClick={() => setLocation(`/playlist/${playlist.id}`)}
                  />
                ))}
              </div>
            </section>
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
