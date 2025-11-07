import { TrackRow } from '@/components/TrackRow';
import { Button } from '@/components/ui/button';
import { Play, Heart } from '@phosphor-icons/react/dist/ssr';
import { demoTracks } from '@/lib/demo-data';
import { usePlayer } from '@/store/usePlayer';
import { musicKit } from '@/lib/musickit';

export default function Liked() {
  const { setQueue, queue, currentIndex, isPlaying } = usePlayer();

  const likedTracks = demoTracks;

  const handlePlayAll = () => {
    setQueue(likedTracks, 0);
    musicKit.play(likedTracks[0]);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="flex gap-6 mb-8">
        <div className="shrink-0">
          <div className="w-[232px] h-[232px] rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-card">
            <Heart size={96} weight="fill" color="white" />
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <p className="text-sm text-muted-foreground mb-2">Playlist</p>
          <h1 className="text-5xl font-bold mb-4" data-testid="text-liked-title">
            Deine Lieblingssongs
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">GlassBeats</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground" data-testid="text-liked-count">
              {likedTracks.length} Songs
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
          data-testid="button-play-liked"
        >
          <Play size={24} weight="fill" />
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

        {likedTracks.map((track, index) => {
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
