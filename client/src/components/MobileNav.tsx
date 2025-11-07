import { House, MagnifyingGlass, Books, Heart, Users } from '@phosphor-icons/react/dist/ssr';
import { Link, useLocation } from 'wouter';
import { useSubscription } from '@/hooks/useSubscription';

export function MobileNav() {
  const [location] = useLocation();
  const { subscription } = useSubscription('demo-user');

  const handleFamilyClick = (e: React.MouseEvent) => {
    // Direct navigation to pricing or live-rooms based on subscription
    // No toast message needed
  };

  const familyPath = !subscription || subscription.tier === 'free' ? '/pricing' : '/live-rooms';
  const hasPaidSubscription = subscription && subscription.tier !== 'free';
  const familyLabel = 'Abos';

  const navItems = [
    { path: '/', icon: House, label: 'Start', onClick: undefined, showBadge: false },
    { path: '/search', icon: MagnifyingGlass, label: 'Suchen', onClick: undefined, showBadge: false },
    { path: '/library', icon: Books, label: 'Bibliothek', onClick: undefined, showBadge: false },
    { path: '/liked', icon: Heart, label: 'Favoriten', onClick: undefined, showBadge: false },
    { path: familyPath, icon: Users, label: familyLabel, onClick: handleFamilyClick, showBadge: hasPaidSubscription },
  ];

  return (
    <nav 
      className="md:hidden fixed left-0 right-0 border-t border-border bg-background/95 backdrop-blur-lg shadow-lg"
      style={{ 
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        bottom: 0,
        zIndex: 60
      }}
      data-testid="mobile-nav"
    >
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path} onClick={item.onClick}>
              <button
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors active:scale-95 relative ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon size={24} weight="bold" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.showBadge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-bold bg-primary text-primary-foreground rounded-full">
                    Familie
                  </span>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
