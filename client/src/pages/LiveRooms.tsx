import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Play, Pause, PaperPlaneTilt, MusicNotes } from '@phosphor-icons/react/dist/ssr';
import { useLiveRoom } from '@/hooks/useLiveRoom';
import { usePlayer } from '@/store/usePlayer';
import { useEffect } from 'react';
import { musicKit } from '@/lib/musickit';

export default function LiveRooms() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));
  const [username] = useState('User-' + Math.random().toString(36).substr(2, 5));

  const { isConnected, roomState, messages, sendMessage, playTrack, pause } = useLiveRoom(
    roomId,
    userId,
    username
  );

  const { currentTime, isPlaying: localIsPlaying } = usePlayer();

  // Sync room state with local player
  useEffect(() => {
    if (!roomState) return;

    // Sync playback state
    if (roomState.isPlaying !== localIsPlaying) {
      if (roomState.isPlaying && roomState.currentTrack) {
        musicKit.play(roomState.currentTrack);
      } else {
        musicKit.pause();
      }
    }
  }, [roomState, localIsPlaying]);

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    const id = 'room-' + Date.now();
    setRoomId(id);
    setNewRoomName('');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  const handlePlayPause = () => {
    if (!roomState) return;
    
    if (roomState.isPlaying) {
      pause(currentTime);
    } else if (roomState.currentTrack) {
      playTrack(roomState.currentTrack, currentTime);
    }
  };

  if (!roomId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Live Music Rooms ✨
          </h1>
          <p className="text-lg text-muted-foreground">
            Höre Musik synchron mit deinen Freunden in Echtzeit
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <MusicNotes size={48} weight="bold" className="text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Erstelle deinen Room</h2>
              <p className="text-sm text-muted-foreground">
                Teile Musik in Echtzeit mit Freunden
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Room Name eingeben..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              className="text-lg h-12"
              data-testid="input-room-name"
            />
            <Button
              onClick={handleCreateRoom}
              className="w-full h-12 text-lg"
              disabled={!newRoomName.trim()}
              data-testid="button-create-room"
            >
              Room erstellen
            </Button>
          </div>

          <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Features:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🎵 Synchronisiertes Playback - Alle hören gleichzeitig</li>
              <li>💬 Live-Chat während des Hörens</li>
              <li>👥 Gemeinsame Queue-Verwaltung</li>
              <li>🎨 Nur für Premium & Family verfügbar</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-154px)] md:h-[calc(100vh-154px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{roomState?.name || 'Live Music Room'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Verbunden' : 'Getrennt'}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users size={16} weight="bold" />
              <span>{roomState?.participants.length || 0} Teilnehmer</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setRoomId(null)} data-testid="button-leave-room">
          Room verlassen
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* Left: Current Track & Controls */}
        <Card className="p-4 md:col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Aktueller Track</h2>
          
          {roomState?.currentTrack ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                {roomState.currentTrack.attributes.artwork && (
                  <img
                    src={musicKit.getArtworkURL(roomState.currentTrack.attributes.artwork, 120)}
                    alt={roomState.currentTrack.attributes.name}
                    className="w-20 h-20 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {roomState.currentTrack.attributes.name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {roomState.currentTrack.attributes.artistName}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-auto">
                <Button
                  size="icon"
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full bg-primary"
                  data-testid="button-play-pause-room"
                >
                  {roomState.isPlaying ? (
                    <Pause size={24} weight="fill" />
                  ) : (
                    <Play size={24} weight="fill" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Kein Track ausgewählt
            </div>
          )}
        </Card>

        {/* Right: Chat & Participants */}
        <Card className="p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Chat</h2>
          
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${
                    msg.userId === 'system'
                      ? 'bg-secondary/50 text-center text-xs'
                      : msg.userId === userId
                      ? 'bg-primary/10 ml-4'
                      : 'bg-secondary mr-4'
                  }`}
                >
                  {msg.userId !== 'system' && (
                    <div className="text-xs font-semibold text-primary mb-1">
                      {msg.username}
                    </div>
                  )}
                  <div className="text-sm">{msg.message}</div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Nachricht eingeben..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              data-testid="button-send-message"
            >
              <PaperPlaneTilt size={20} weight="bold" />
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Teilnehmer ({roomState?.participants.length || 0})
            </div>
            <div className="space-y-1">
              {roomState?.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className={p.id === userId ? 'font-semibold text-primary' : ''}>
                    {p.username}
                    {p.id === userId && ' (Du)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
