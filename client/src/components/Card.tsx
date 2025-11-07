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
  const { setQueue, play } = usePlayer();

  const handleCardClick = () => {
    setQueue([item], 0);
    play();
    if (onClick) {
      onClick();
    }
  };

  const artwork = item.attributes.artwork
    ? musicKit.getArtworkURL(item.attributes.artwork, 400)
    : '';

  return (
    <div
      className="group relative p-3 md:p-4 rounded-lg glass card-hover-lift cursor-pointer w-[156px] md:w-[232px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
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
