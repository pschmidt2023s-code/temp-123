import { House, MagnifyingGlass, Books, Heart, Users } from '@phosphor-icons/react/dist/ssr';
import { Link, useLocation } from 'wouter';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const [location] = useLocation();
  const { subscription } = useSubscription('demo-user');
  const { toast } = useToast();

  const handleFamilyClick = (e: React.MouseEvent) => {
    if (!subscription) {
      return;
    }
    
    if (subscription.tier !== 'family') {
      e.preventDefault();
      toast({
        title: "Family-Tier erforderlich",
        description: "Live Music Rooms sind nur im Family-Abo (€14,99/Monat) verfügbar. Upgrade für synchronisiertes Hören mit bis zu 6 Freunden!",
        action: (
          <Button 
            size="sm" 
            onClick={() => window.location.href = '/pricing'}
            data-testid="button-upgrade-to-family"
          >
            Jetzt upgraden
          </Button>
        ),
      });
    }
  };

  const familyPath = !subscription ? '/pricing' : '/live-rooms';
  const familyLabel = !subscription ? 'Abos' : 'Familie';

  const navItems = [
    { path: '/', icon: House, label: 'Start', onClick: undefined },
    { path: '/search', icon: MagnifyingGlass, label: 'Suchen', onClick: undefined },
    { path: '/library', icon: Books, label: 'Bibliothek', onClick: undefined },
    { path: '/liked', icon: Heart, label: 'Favoriten', onClick: undefined },
    { path: familyPath, icon: Users, label: familyLabel, onClick: handleFamilyClick },
  ];

  return (
    <nav 
      className="md:hidden fixed left-0 right-0 border-t border-border bg-background/95 backdrop-blur-lg shadow-lg"
      style={{ 
        height: '64px',
        bottom: '90px',
        zIndex: 60
      }}
    >
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path} onClick={item.onClick}>
              <button
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors active:scale-95 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon size={24} weight="bold" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
