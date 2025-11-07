import { Card } from '@/components/Card';
import { useLocation } from 'wouter';
import { demoAlbums, demoPlaylists, demoTracks } from '@/lib/demo-data';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';
import { useState, useEffect } from 'react';
import type { MKMediaItem, Release } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

function convertReleaseToMKItem(release: Release): MKMediaItem {
  return {
    id: release.id!,
    type: 'albums',
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
    },
  };
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { setQueue } = usePlayer();
  
  const [recentlyPlayed, setRecentlyPlayed] = useState<MKMediaItem[]>([]);
  const [recommendations, setRecommendations] = useState<MKMediaItem[]>([]);
  const [newReleases, setNewReleases] = useState<MKMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const mk = musicKit.getInstance();
        let recent: MKMediaItem[] = [];
        let recs: MKMediaItem[] = [];
        let releases: MKMediaItem[] = [];

        if (mk) {
          try {
            const recentResponse = await mk.api.music('/v1/me/recent/played', {});
            recent = recentResponse.data || [];
          } catch (e) {
            console.error('Failed to fetch recently played:', e);
          }

          try {
            const recsResponse = await mk.api.music('/v1/me/recommendations', {});
            recs = recsResponse.data?.[0]?.relationships?.contents?.data || [];
          } catch (e) {
            console.error('Failed to fetch recommendations:', e);
          }

          try {
            const releasesResponse = await mk.api.music('/v1/catalog/de/new-releases', {});
            releases = releasesResponse.data?.[0]?.relationships?.albums?.data || [];
          } catch (e) {
            console.error('Failed to fetch new releases:', e);
          }
        }
        
        setRecentlyPlayed(recent.length > 0 ? recent : demoAlbums.slice(0, 6));
        setRecommendations(recs.length > 0 ? recs.slice(0, 6) : demoPlaylists);
        setNewReleases(releases.length > 0 ? releases : demoAlbums);
      } catch (error) {
        console.error('Failed to load home data:', error);
        setRecentlyPlayed(demoAlbums.slice(0, 6));
        setRecommendations(demoPlaylists);
        setNewReleases(demoAlbums);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (dbReleases.length > 0) {
      const convertedDbReleases = dbReleases.map(convertReleaseToMKItem);
      setNewReleases(prev => {
        const mkReleases = prev.filter(item => !convertedDbReleases.find(r => r.id === item.id));
        return [...convertedDbReleases, ...mkReleases];
      });
    }
  }, [dbReleases]);

  const handleItemClick = (item: MKMediaItem) => {
    if (item.type === 'albums') {
      setLocation(`/album/${item.id}`);
    } else if (item.type === 'playlists') {
      setLocation(`/playlist/${item.id}`);
    } else if (item.type === 'artists') {
      setLocation(`/artist/${item.id}`);
    } else if (item.type === 'songs' || item.type === 'music-videos') {
      setQueue([item], 0);
      musicKit.play(item);
    } else {
      console.warn('Unknown item type:', item.type);
    }
  };

  const handleQuickPlay = () => {
    setQueue(demoTracks, 0);
    musicKit.play(demoTracks[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lädt Inhalte...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <section className="mb-8">
        <h1 className="text-heading font-bold mb-6" data-testid="text-welcome">
          Für dich
        </h1>
        <div
          className="relative h-64 rounded-lg glass overflow-hidden cursor-pointer group"
          onClick={handleQuickPlay}
          data-testid="hero-section"
        >
          <img
            src={
              recentlyPlayed[0]?.attributes?.artwork
                ? musicKit.getArtworkURL(recentlyPlayed[0].attributes.artwork, 1200)
                : "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=400&fit=crop"
            }
            alt="Featured Mix"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-sm text-muted-foreground mb-2">Dein Mix</p>
            <h2 className="text-4xl font-bold mb-4">
              {recentlyPlayed[0]?.attributes?.name || 'Rock Classics'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {recentlyPlayed[0]?.attributes?.artistName || 'Die besten Rock-Songs aller Zeiten'}
            </p>
          </div>
        </div>
      </section>

      {/* Recently Played */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold" data-testid="text-section-recent">
            Kürzlich gespielt
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recentlyPlayed.map((item) => (
            <Card
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </section>

      {/* Made For You */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold" data-testid="text-section-for-you">
            Für dich erstellt
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recommendations.map((item) => (
            <Card
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold" data-testid="text-section-new">
            Neuerscheinungen
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {newReleases.map((item) => (
            <Card
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
