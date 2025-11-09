import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Building, Music, Mic, Church } from 'lucide-react';
import { ResponsiveSectionHeader } from '@/components/ResponsivePageHeader';
import { useToast } from '@/hooks/use-toast';

interface AudioRoom {
  id: string;
  name: string;
  icon: any;
  description: string;
  reverb: number;
  delay: number;
  color: string;
}

const audioRooms: AudioRoom[] = [
  {
    id: 'studio',
    name: 'Recording Studio',
    icon: Music,
    description: 'Kristallklare, professionelle Studioakustik',
    reverb: 0.2,
    delay: 0.05,
    color: '#3B82F6',
  },
  {
    id: 'arena',
    name: 'Arena',
    icon: Building,
    description: 'Massive Konzertarena mit epischem Hall',
    reverb: 0.8,
    delay: 0.3,
    color: '#EF4444',
  },
  {
    id: 'jazz-club',
    name: 'Jazz Club',
    icon: Mic,
    description: 'Intimer Club mit warmer Atmosphäre',
    reverb: 0.4,
    delay: 0.1,
    color: '#F59E0B',
  },
  {
    id: 'cathedral',
    name: 'Kathedrale',
    icon: Church,
    description: 'Majestätischer Kirchenraum mit langem Nachhall',
    reverb: 0.95,
    delay: 0.5,
    color: '#8B5CF6',
  },
];

export default function VirtualConcertHall() {
  const [selectedRoom, setSelectedRoom] = useState<AudioRoom>(audioRooms[0]);
  const [intensity, setIntensity] = useState<number>(50);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      applyAudioEffect();
    }
  }, [selectedRoom, intensity, isEnabled]);

  const applyAudioEffect = () => {
    // Web Audio API implementation würde hier erfolgen
    // Für diese Demo zeigen wir nur die UI
    console.log('Applying audio effect:', {
      room: selectedRoom.name,
      reverb: selectedRoom.reverb * (intensity / 100),
      delay: selectedRoom.delay * (intensity / 100),
    });
  };

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
    toast({
      title: isEnabled ? 'Virtual Concert Hall deaktiviert' : 'Virtual Concert Hall aktiviert',
      description: isEnabled 
        ? 'Standard Audio wiederhergestellt'
        : `${selectedRoom.name} Akustik wird angewendet`,
    });
  };

  return (
    <div className="min-h-screen pb-32">
      <ResponsiveSectionHeader title="Virtual Concert Hall" />
      
      <p className="text-muted-foreground mb-8">
        Erlebe deine Musik in verschiedenen virtuellen Räumen mit 3D Spatial Audio
      </p>

      {/* Enable Toggle */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">3D Audio aktivieren</h3>
            <p className="text-sm text-muted-foreground">
              {isEnabled ? `Aktueller Raum: ${selectedRoom.name}` : 'Standard Audio'}
            </p>
          </div>
          <Button
            onClick={handleToggle}
            variant={isEnabled ? 'default' : 'outline'}
            data-testid="button-toggle-3d-audio"
          >
            {isEnabled ? 'Deaktivieren' : 'Aktivieren'}
          </Button>
        </div>
      </Card>

      {/* Room Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {audioRooms.map((room) => {
          const Icon = room.icon;
          return (
            <Card
              key={room.id}
              className={`p-6 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                selectedRoom.id === room.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRoom(room)}
              data-testid={`card-room-${room.id}`}
            >
              <div className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: room.color + '20' }}
                >
                  <Icon 
                    className="w-8 h-8" 
                    style={{ color: room.color }}
                  />
                </div>
                <h3 className="font-bold mb-2">{room.name}</h3>
                <p className="text-xs text-muted-foreground">{room.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Intensity Slider */}
      <Card className="p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">Effekt-Intensität</h3>
        <div className="space-y-4">
          <Slider
            value={[intensity]}
            onValueChange={(value) => setIntensity(value[0])}
            max={100}
            step={1}
            disabled={!isEnabled}
            data-testid="slider-intensity"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtil</span>
            <span className="font-medium text-foreground">{intensity}%</span>
            <span>Intensiv</span>
          </div>
        </div>
      </Card>

      {/* Room Details */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-3">Raum-Details: {selectedRoom.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Nachhall</p>
            <p className="font-medium">{Math.round(selectedRoom.reverb * 100)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Delay</p>
            <p className="font-medium">{Math.round(selectedRoom.delay * 1000)}ms</p>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          {selectedRoom.description}
        </p>
      </Card>
    </div>
  );
}
