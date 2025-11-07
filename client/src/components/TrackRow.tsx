import { Play, Pause } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/store/usePlayer';
import type { MKMediaItem } from '@shared/schema';
import { musicKit } from '@/lib/musickit';

interface TrackRowProps {
  track: MKMediaItem;
  index: number;
  isPlaying?: boolean;
}

export function TrackRow({ track, index, isPlaying = false }: TrackRowProps) {
  const { setQueue, pause } = usePlayer();

  const handlePlay = () => {
    if (isPlaying) {
      pause();
      musicKit.pause();
    } else {
      setQueue([track], 0);
      musicKit.play(track);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-:--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const artwork = track.attributes.artwork
    ? musicKit.getArtworkURL(track.attributes.artwork, 40)
    : '';

  return (
    <div
      className="group grid grid-cols-[auto_40px_1fr_1fr_auto_auto] gap-4 items-center px-4 py-2 rounded hover:bg-sidebar-accent transition-colors"
      data-testid={`row-track-${track.id}`}
    >
      {/* Track Number / Play Button */}
      <div className="w-8 text-center">
        <span className="group-hover:hidden text-muted-foreground text-secondary">
          {index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlay}
          className="hidden group-hover:flex w-8 h-8"
          data-testid={`button-play-track-${track.id}`}
        >
          {isPlaying ? (
            <Pause size={16} weight="fill" className="text-foreground" />
          ) : (
            <Play size={16} weight="fill" className="text-foreground" />
          )}
        </Button>
      </div>

      {/* Cover */}
      {artwork && (
        <img
          src={artwork}
          alt={track.attributes.name}
          className="w-10 h-10 rounded object-cover"
          data-testid={`img-track-${track.id}`}
        />
      )}

      {/* Title & Artist */}
      <div className="min-w-0">
        <div
          className={`text-body truncate ${isPlaying ? 'text-primary' : 'text-foreground'}`}
          data-testid={`text-track-title-${track.id}`}
        >
          {track.attributes.name}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {track.attributes.artistName}
        </div>
      </div>

      {/* Album */}
      <div className="text-sm text-muted-foreground truncate hidden md:block">
        {track.attributes.albumName || '-'}
      </div>

      {/* Date Added */}
      <div className="text-sm text-muted-foreground hidden lg:block">
        {track.attributes.releaseDate || '-'}
      </div>

      {/* Duration */}
      <div className="text-sm text-muted-foreground text-right" data-testid={`text-duration-${track.id}`}>
        {formatDuration(track.attributes.durationInMillis)}
      </div>
    </div>
  );
}
