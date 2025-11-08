import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/store/usePlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Microphone, Play, Pause, SkipForward, SkipBack, SpeakerHigh, Shuffle } from '@phosphor-icons/react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  command: string;
  description: string;
  examples: string[];
}

const VOICE_COMMANDS: VoiceCommand[] = [
  {
    command: 'play',
    description: 'Musik abspielen',
    examples: ['spiele musik', 'play', 'musik an'],
  },
  {
    command: 'pause',
    description: 'Musik pausieren',
    examples: ['pause', 'stopp', 'musik aus'],
  },
  {
    command: 'next',
    description: 'Nächster Track',
    examples: ['nächster song', 'next', 'skip'],
  },
  {
    command: 'previous',
    description: 'Vorheriger Track',
    examples: ['vorheriger song', 'previous', 'zurück'],
  },
  {
    command: 'shuffle',
    description: 'Shuffle an/aus',
    examples: ['shuffle', 'zufällige wiedergabe'],
  },
  {
    command: 'louder',
    description: 'Lauter',
    examples: ['lauter', 'louder', 'erhöhe lautstärke'],
  },
  {
    command: 'quieter',
    description: 'Leiser',
    examples: ['leiser', 'quieter', 'verringere lautstärke'],
  },
];

export default function VoiceCommands() {
  const { toast } = useToast();
  const { isPlaying, play, pause, next, previous, toggleShuffle, setVolume, volume, queue, currentIndex } = usePlayer();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentTrack = queue[currentIndex];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'de-DE';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      setTranscript(transcript);

      if (event.results[current].isFinal) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const processCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('spiel') || lowerTranscript.includes('play')) {
      play();
      setRecognizedCommand('play');
      toast({ title: 'Befehl erkannt', description: 'Musik wird abgespielt' });
    } else if (lowerTranscript.includes('pause') || lowerTranscript.includes('stopp')) {
      pause();
      setRecognizedCommand('pause');
      toast({ title: 'Befehl erkannt', description: 'Musik pausiert' });
    } else if (lowerTranscript.includes('nächster') || lowerTranscript.includes('next') || lowerTranscript.includes('skip')) {
      next();
      setRecognizedCommand('next');
      toast({ title: 'Befehl erkannt', description: 'Nächster Track' });
    } else if (lowerTranscript.includes('vorheriger') || lowerTranscript.includes('previous') || lowerTranscript.includes('zurück')) {
      previous();
      setRecognizedCommand('previous');
      toast({ title: 'Befehl erkannt', description: 'Vorheriger Track' });
    } else if (lowerTranscript.includes('shuffle') || lowerTranscript.includes('zufällig')) {
      toggleShuffle();
      setRecognizedCommand('shuffle');
      toast({ title: 'Befehl erkannt', description: 'Shuffle umgeschaltet' });
    } else if (lowerTranscript.includes('lauter') || lowerTranscript.includes('louder')) {
      const newVolume = Math.min(100, volume + 10);
      setVolume(newVolume);
      setRecognizedCommand('louder');
      toast({ title: 'Befehl erkannt', description: `Lautstärke: ${newVolume}%` });
    } else if (lowerTranscript.includes('leiser') || lowerTranscript.includes('quieter')) {
      const newVolume = Math.max(0, volume - 10);
      setVolume(newVolume);
      setRecognizedCommand('quieter');
      toast({ title: 'Befehl erkannt', description: `Lautstärke: ${newVolume}%` });
    }

    setTimeout(() => {
      setRecognizedCommand(null);
      setTranscript('');
    }, 2000);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Sprachsteuerung</h1>
        <p className="text-muted-foreground">
          Steuere deine Musik mit deiner Stimme
        </p>
      </div>

      <Card data-testid="card-voice-control">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microphone className="w-6 h-6" />
            Spracherkennung
          </CardTitle>
          <CardDescription>
            {isListening ? 'Hört zu...' : 'Klicke auf den Button um die Spracherkennung zu starten'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Button
              size="icon"
              className={`h-32 w-32 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary'}`}
              onClick={toggleListening}
              data-testid="button-toggle-voice"
            >
              <Microphone className="w-16 h-16" weight={isListening ? 'fill' : 'regular'} />
            </Button>
          </div>

          {transcript && (
            <div className="text-center p-4 bg-muted rounded-lg" data-testid="text-transcript">
              <p className="text-sm text-muted-foreground mb-1">Erkannter Text:</p>
              <p className="text-lg font-medium">{transcript}</p>
            </div>
          )}

          {recognizedCommand && (
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary" data-testid="text-recognized-command">
              <p className="text-sm text-primary mb-1">Befehl ausgeführt:</p>
              <p className="text-lg font-bold text-primary">{recognizedCommand}</p>
            </div>
          )}

          {currentTrack && (
            <div className="text-center p-4 bg-card rounded-lg border" data-testid="card-current-track">
              <p className="text-sm text-muted-foreground mb-2">Aktueller Track:</p>
              <p className="font-bold truncate">{currentTrack.attributes.name}</p>
              <p className="text-sm text-muted-foreground truncate">{currentTrack.attributes.artistName}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant={isPlaying ? 'default' : 'secondary'}>
                  {isPlaying ? 'Spielt' : 'Pausiert'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Befehle</CardTitle>
          <CardDescription>
            Diese Sprachbefehle kannst du verwenden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VOICE_COMMANDS.map((cmd) => (
              <div key={cmd.command} className="p-4 bg-muted rounded-lg" data-testid={`command-${cmd.command}`}>
                <h3 className="font-bold mb-2">{cmd.description}</h3>
                <div className="space-y-1">
                  {cmd.examples.map((example, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      "{example}"
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
