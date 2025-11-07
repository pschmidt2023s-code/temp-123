import { House, MagnifyingGlass, Books, Heart, User } from '@phosphor-icons/react/dist/ssr';
import { Link, useLocation } from 'wouter';

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: House, label: 'Start' },
    { path: '/search', icon: MagnifyingGlass, label: 'Suchen' },
    { path: '/library', icon: Books, label: 'Bibliothek' },
    { path: '/liked', icon: Heart, label: 'Favoriten' },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border"
      style={{ height: '64px', marginBottom: '90px' }}
    >
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
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
