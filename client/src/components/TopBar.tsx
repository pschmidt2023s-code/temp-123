import { MagnifyingGlass, User } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useLocation } from 'wouter';

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header 
      className="glass fixed top-0 z-50 flex items-center justify-between px-8 border-b border-border"
      style={{ height: '64px', left: '241px', right: '0' }}
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

      <div className="flex items-center gap-4">
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
