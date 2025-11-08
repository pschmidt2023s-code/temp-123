import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Microphone, Play, Pause, MagnifyingGlass, Equalizer, X } from '@phosphor-icons/react';

const DEMO_SONGS = [
  {
    id: 'song-1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: 'https://picsum.photos/seed/karaoke1/200',
    lyrics: [
      { time: 0, text: 'Is this the real life?' },
      { time: 3, text: 'Is this just fantasy?' },
      { time: 6, text: 'Caught in a landslide' },
      { time: 9, text: 'No escape from reality' },
      { time: 12, text: 'Open your eyes' },
      { time: 15, text: 'Look up to the skies and see' },
    ],
  },
  {
    id: 'song-2',
    title: 'Imagine',
    artist: 'John Lennon',
    albumArt: 'https://picsum.photos/seed/karaoke2/200',
    lyrics: [
      { time: 0, text: 'Imagine there\'s no heaven' },
      { time: 4, text: 'It\'s easy if you try' },
      { time: 8, text: 'No hell below us' },
      { time: 11, text: 'Above us only sky' },
      { time: 14, text: 'Imagine all the people' },
      { time: 17, text: 'Living for today' },
    ],
  },
  {
    id: 'song-3',
    title: 'Someone Like You',
    artist: 'Adele',
    albumArt: 'https://picsum.photos/seed/karaoke3/200',
    lyrics: [
      { time: 0, text: 'I heard that you\'re settled down' },
      { time: 4, text: 'That you found a girl and you\'re married now' },
      { time: 9, text: 'I heard that your dreams came true' },
      { time: 13, text: 'Guess she gave you things I didn\'t give to you' },
    ],
  },
];

export default function Karaoke() {
  const userId = 'demo-user';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<typeof DEMO_SONGS[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  const { data: audioSettings } = useQuery({
    queryKey: ['/api/audio-settings', userId],
    queryFn: async () => {
      const res = await fetch(`/api/audio-settings/${userId}`);
      return res.json();
    },
  });

  const vocalReducerEnabled = audioSettings?.vocalReducerEnabled || false;

  useEffect(() => {
    if (isPlaying && selectedSong) {
      const animate = () => {
        const now = Date.now();
        const delta = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= 225) {
            setIsPlaying(false);
            return 225;
          }
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      lastUpdateRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, selectedSong]);

  const filteredSongs = DEMO_SONGS.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSongSelect = (song: typeof DEMO_SONGS[0]) => {
    setSelectedSong(song);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const getCurrentLyricIndex = () => {
    if (!selectedSong) return -1;
    const lyrics = selectedSong.lyrics;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return -1;
  };

  const currentLyricIndex = getCurrentLyricIndex();

  if (selectedSong) {
    return (
      <div className="relative h-screen w-full bg-gradient-to-br from-background via-background/95 to-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl"
          style={{ backgroundImage: `url(${selectedSong.albumArt})` }}
        />

        <div className="relative z-10 h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedSong(null);
                  setIsPlaying(false);
                }}
                data-testid="button-close-karaoke"
              >
                <X size={24} weight="bold" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold" data-testid="text-song-title">{selectedSong.title}</h2>
                <p className="text-muted-foreground" data-testid="text-artist-name">{selectedSong.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {vocalReducerEnabled && (
                <Badge variant="default" className="flex items-center gap-2" data-testid="badge-vocal-reducer">
                  <Equalizer size={16} weight="bold" />
                  Vocal Reducer aktiv
                </Badge>
              )}
              {!vocalReducerEnabled && (
                <Badge variant="secondary" className="text-muted-foreground" data-testid="badge-vocal-reducer-off">
                  Vocal Reducer aus
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="w-full max-w-4xl space-y-8">
              <div className="aspect-square w-48 h-48 mx-auto rounded-lg overflow-hidden glass border border-white/10 shadow-2xl">
                <img 
                  src={selectedSong.albumArt} 
                  alt={selectedSong.title}
                  className="w-full h-full object-cover"
                  data-testid="img-album-art"
                />
              </div>

              <div className="min-h-[300px] flex flex-col items-center justify-center space-y-6">
                {selectedSong.lyrics.map((line, index) => {
                  const isCurrent = index === currentLyricIndex;
                  const isPast = index < currentLyricIndex;
                  const isNext = index === currentLyricIndex + 1;

                  return (
                    <div
                      key={index}
                      className={`text-center transition-all duration-500 ${
                        isCurrent
                          ? 'text-5xl font-bold text-primary scale-110'
                          : isNext
                          ? 'text-3xl font-semibold text-foreground/80'
                          : isPast
                          ? 'text-2xl text-muted-foreground/50'
                          : 'text-2xl text-muted-foreground/30'
                      }`}
                      data-testid={`lyric-line-${index}`}
                    >
                      {line.text}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="w-20 h-20 rounded-full"
                  data-testid="button-play-pause"
                >
                  {isPlaying ? (
                    <Pause size={32} weight="fill" />
                  ) : (
                    <Play size={32} weight="fill" />
                  )}
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground" data-testid="text-time-display">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 3:45
                </p>
                <Slider
                  min={0}
                  max={225}
                  step={0.1}
                  value={[currentTime]}
                  onValueChange={(val) => {
                    setCurrentTime(val[0]);
                    lastUpdateRef.current = Date.now();
                  }}
                  className="w-full"
                  data-testid="slider-progress"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Microphone size={32} weight="bold" className="text-primary" />
        <h1 className="text-3xl font-bold" data-testid="heading-karaoke">Karaoke-Modus</h1>
      </div>

      {vocalReducerEnabled ? (
        <Card className="p-4 mb-6 bg-primary/10 border-primary/20">
          <div className="flex items-center gap-2">
            <Equalizer size={24} weight="bold" className="text-primary" />
            <p className="font-medium">
              Vocal Reducer ist aktiviert - Perfekt für Karaoke!
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-4 mb-6 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Equalizer size={24} weight="bold" className="text-muted-foreground" />
              <p className="text-muted-foreground">
                Vocal Reducer ist deaktiviert. Aktiviere ihn in den Audio-Einstellungen für das beste Karaoke-Erlebnis.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/audio-settings'}
              data-testid="button-go-to-settings"
            >
              Zu den Einstellungen
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlass 
            size={20} 
            weight="bold" 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Song oder Künstler suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-songs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSongs.map((song) => (
          <Card
            key={song.id}
            className="p-4 hover-elevate cursor-pointer"
            onClick={() => handleSongSelect(song)}
            data-testid={`card-song-${song.id}`}
          >
            <div className="flex gap-4">
              <img
                src={song.albumArt}
                alt={song.title}
                className="w-20 h-20 rounded-md object-cover"
                data-testid={`img-album-art-${song.id}`}
              />
              <div className="flex-1">
                <h3 className="font-semibold mb-1" data-testid={`text-title-${song.id}`}>
                  {song.title}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid={`text-artist-${song.id}`}>
                  {song.artist}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Microphone size={16} weight="bold" className="text-primary" />
                  <span className="text-xs text-primary font-medium">
                    {song.lyrics.length} Zeilen
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-16">
          <Microphone size={48} weight="bold" className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Keine Songs gefunden</h3>
          <p className="text-muted-foreground">
            Versuche es mit einem anderen Suchbegriff
          </p>
        </div>
      )}
    </div>
  );
}
