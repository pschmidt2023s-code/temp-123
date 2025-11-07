import { House, MagnifyingGlass, Books, Heart, Crown } from '@phosphor-icons/react/dist/ssr';
import { Link, useLocation } from 'wouter';
import { useSubscription } from '@/hooks/useSubscription';

export function MobileNav() {
  const [location] = useLocation();
  const { subscription } = useSubscription('demo-user');

  const navItems = [
    { path: '/', icon: House, label: 'Start' },
    { path: '/search', icon: MagnifyingGlass, label: 'Suchen' },
    { path: '/library', icon: Books, label: 'Bibliothek' },
    { path: '/liked', icon: Heart, label: 'Favoriten' },
    { path: '/pricing', icon: Crown, label: subscription ? subscription.tier === 'plus' ? 'Plus' : subscription.tier === 'premium' ? 'Premium' : 'Family' : 'Premium' },
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
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors active:scale-95 ${
                  isActive 
                    ? item.icon === Crown && subscription 
                      ? 'text-primary' 
                      : 'text-primary'
                    : item.icon === Crown && !subscription
                      ? 'text-primary'
                      : 'text-muted-foreground'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon size={24} weight={item.icon === Crown && subscription ? 'fill' : 'bold'} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
