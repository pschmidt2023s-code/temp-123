import { MagnifyingGlass, User, SignIn, SignOut, Crown, Gear, Microphone } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMKAuth } from '@/hooks/useMKAuth';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();
  const { isAuthorized, isLoading, authorize, unauthorize } = useMKAuth();
  const { subscription } = useSubscription('demo-user');
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAuthToggle = async () => {
    if (isAuthorized) {
      await unauthorize();
    } else {
      await authorize();
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Nicht unterstützt',
        description: 'Sprachsuche wird in diesem Browser nicht unterstützt',
        variant: 'destructive',
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: 'Hört zu...',
        description: 'Sage deinen Suchbegriff',
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setLocation(`/search?q=${encodeURIComponent(transcript)}`);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: 'Fehler',
        description: 'Sprachsuche fehlgeschlagen',
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <header 
      className="glass fixed top-0 z-50 flex items-center justify-between px-4 md:px-8 border-b border-border left-0 md:left-[241px] right-0"
      style={{ height: '64px' }}
    >
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={20}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Wonach möchtest du hören?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0 h-10 text-body"
              data-testid="input-search"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceSearch}
            className={`h-10 w-10 ${isListening ? 'text-primary' : ''}`}
            data-testid="button-voice-search"
            title="Sprachsuche"
          >
            <Microphone size={20} weight={isListening ? 'fill' : 'bold'} />
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Subscription Badge & Upgrade Button */}
        {subscription ? (
          <Badge 
            variant="default" 
            className="bg-primary text-primary-foreground hidden md:inline-flex gap-1"
          >
            <Crown size={14} weight="fill" />
            {subscription.tier === 'plus' && 'Plus'}
            {subscription.tier === 'premium' && 'Premium'}
            {subscription.tier === 'family' && 'Family'}
          </Badge>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setLocation('/pricing')}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hidden md:flex"
            data-testid="button-upgrade-desktop"
          >
            <Crown size={16} weight="fill" />
            Premium holen
          </Button>
        )}
        
        {/* Mobile Upgrade Icon */}
        {!subscription && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/pricing')}
            className="md:hidden text-primary"
            data-testid="button-upgrade-mobile"
          >
            <Crown size={20} weight="fill" />
          </Button>
        )}
        
        {isAuthorized && (
          <Badge variant="outline" className="hidden md:inline-flex">
            Apple Music
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="default"
          onClick={handleAuthToggle}
          disabled={isLoading}
          className="gap-2 hidden md:flex"
          data-testid="button-auth"
        >
          {isLoading ? (
            'Lädt...'
          ) : isAuthorized ? (
            <>
              <SignOut size={18} weight="bold" />
              Abmelden
            </>
          ) : (
            <>
              <SignIn size={18} weight="bold" />
              Mit Apple Music anmelden
            </>
          )}
        </Button>
        
        {/* Mobile Auth Icon Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAuthToggle}
          disabled={isLoading}
          className="md:hidden"
          data-testid="button-auth-mobile"
        >
          {isAuthorized ? (
            <SignOut size={20} weight="bold" />
          ) : (
            <SignIn size={20} weight="bold" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-secondary"
              data-testid="button-user-menu"
            >
              <User size={20} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {localStorage.getItem('userId') ? (
              <>
                <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-item-settings">
                  <Gear size={16} weight="bold" className="mr-2" />
                  Einstellungen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    localStorage.removeItem('userId');
                    localStorage.removeItem('username');
                    setLocation('/login');
                  }}
                  data-testid="menu-item-logout"
                >
                  <SignOut size={16} weight="bold" className="mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => setLocation('/login')} data-testid="menu-item-login">
                  <SignIn size={16} weight="bold" className="mr-2" />
                  Anmelden
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/register')} data-testid="menu-item-register">
                  <User size={16} weight="bold" className="mr-2" />
                  Registrieren
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
