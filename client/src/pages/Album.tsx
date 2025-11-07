import { useRoute } from 'wouter';
import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';
import { Play, Heart, DotsThree } from '@phosphor-icons/react/dist/ssr';
import { demoTracks } from '@/lib/demo-data';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';

export default function Album() {
  const [, params] = useRoute('/album/:id');
  const { setQueue, queue, currentIndex, isPlaying } = usePlayer();

  const albumTracks = demoTracks.slice(0, 8);
  const album = albumTracks[0];

  const handlePlayAll = () => {
    setQueue(albumTracks, 0);
    musicKit.play(albumTracks[0]);
  };

  const totalDuration = albumTracks.reduce(
    (acc, track) => acc + (track.attributes.durationInMillis || 0),
    0
  );

  const formatTotalDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} Min.`;
  };

  const artwork = album?.attributes.artwork
    ? musicKit.getArtworkURL(album.attributes.artwork, 232)
    : '';

  return (
    <div className="min-h-screen pb-32">
      {/* Album Header */}
      <div className="flex gap-6 mb-8">
        <div className="shrink-0">
          {artwork && (
            <img
              src={artwork}
              alt={album?.attributes.name}
              className="w-[232px] h-[232px] rounded-lg shadow-card"
              data-testid="img-album-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-end">
          <p className="text-sm text-muted-foreground mb-2">Album</p>
          <h1 className="text-5xl font-bold mb-4" data-testid="text-album-title">
            {album?.attributes.albumName || 'Album'}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" data-testid="text-album-artist">
              {album?.attributes.artistName}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{album?.attributes.releaseDate}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground" data-testid="text-album-info">
              {albumTracks.length} Songs, {formatTotalDuration(totalDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          size="lg"
          onClick={handlePlayAll}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-14 h-14 play-button-scale"
          data-testid="button-play-album"
        >
          <Play size={24} weight="fill" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10" data-testid="button-like-album">
          <Heart size={28} weight="bold" className="text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10" data-testid="button-album-menu">
          <DotsThree size={28} weight="bold" className="text-muted-foreground" />
        </Button>
      </div>

      {/* Track List */}
      <div className="space-y-1">
        <div className="grid grid-cols-[auto_40px_1fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-border text-sm text-muted-foreground">
          <div className="w-8 text-center">#</div>
          <div></div>
          <div>Titel</div>
          <div className="hidden md:block">Album</div>
          <div className="hidden lg:block">Datum hinzugefügt</div>
          <div className="text-right">⏱</div>
        </div>

        {albumTracks.map((track, index) => {
          const isCurrentTrack =
            queue[currentIndex]?.id === track.id && isPlaying;
          return (
            <TrackRow
              key={track.id}
              track={track}
              index={index}
              isPlaying={isCurrentTrack}
            />
          );
        })}
      </div>
    </div>
  );
}
