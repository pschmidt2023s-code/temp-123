import { MagnifyingGlass, User, SignIn, SignOut } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMKAuth } from '@/hooks/useMKAuth';
import { Badge } from '@/components/ui/badge';

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();
  const { isAuthorized, isLoading, authorize, unauthorize } = useMKAuth();

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

  return (
    <header 
      className="glass fixed top-0 z-50 flex items-center justify-between px-4 md:px-8 border-b border-border left-0 md:left-[241px] right-0"
      style={{ height: '64px' }}
    >
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
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
      </form>

      <div className="flex items-center gap-2 md:gap-4">
        {isAuthorized && (
          <Badge variant="default" className="bg-primary text-primary-foreground hidden md:inline-flex">
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

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-secondary"
          data-testid="button-user-menu"
        >
          <User size={20} weight="bold" />
        </Button>
      </div>
    </header>
  );
}
