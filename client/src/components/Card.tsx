import { Play } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { usePlayer } from '@/store/usePlayer';
import type { MKMediaItem } from '@shared/schema';
import { musicKit } from '@/lib/musickit';

interface CardProps {
  item: MKMediaItem;
  onClick?: () => void;
}

export function Card({ item, onClick }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { setQueue } = usePlayer();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQueue([item], 0);
    musicKit.play(item);
  };

  const artwork = item.attributes.artwork
    ? musicKit.getArtworkURL(item.attributes.artwork, 400)
    : '';

  return (
    <div
      className="group relative p-3 md:p-4 rounded-lg glass card-hover-lift cursor-pointer w-[156px] md:w-[232px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      data-testid={`card-${item.type}-${item.id}`}
    >
      <div 
        className="relative mb-3 md:mb-4 rounded-md overflow-hidden bg-secondary w-[132px] h-[132px] md:w-[200px] md:h-[200px]"
      >
        {artwork && (
          <img
            src={artwork}
            alt={item.attributes.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        
        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 transition-all duration-200" />
        )}

        {/* Play Button - Centered */}
        {isHovered && (
          <Button
            size="icon"
            onClick={handlePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground shadow-lg play-button-scale"
            data-testid={`button-play-${item.id}`}
          >
            <Play size={24} weight="fill" className="md:w-7 md:h-7" />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <h3
          className="font-medium text-foreground truncate text-sm md:text-body"
          data-testid={`text-title-${item.id}`}
        >
          {item.attributes.name}
        </h3>
        <p
          className="text-xs md:text-sm text-muted-foreground truncate"
          data-testid={`text-artist-${item.id}`}
        >
          {item.attributes.artistName}
        </p>
      </div>
    </div>
  );
}
