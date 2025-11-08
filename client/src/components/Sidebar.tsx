import { Link, useLocation } from 'wouter';
import { House, MagnifyingGlass, Books, Plus, Heart, Users, Equalizer, Alarm, ChartBar, Gift, UsersFour, MagicWand, Microphone } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export function Sidebar() {
  const [location] = useLocation();
  const { subscription } = useSubscription('demo-user');

  const handleFamilyClick = (e: React.MouseEvent) => {
    // Direct navigation to pricing or live-rooms based on subscription
    // No toast message needed
  };

  const mainNav = [
    { icon: House, label: 'Start', path: '/' },
    { icon: MagnifyingGlass, label: 'Suchen', path: '/search' },
    { icon: Books, label: 'Deine Bibliothek', path: '/library' },
  ];

  const familyPath = !subscription || subscription.tier === 'free' ? '/pricing' : '/live-rooms';
  const hasPaidSubscription = subscription && subscription.tier !== 'free';
  const familyLabel = 'Abos';

  const libraryItems = [
    { icon: Heart, label: 'Deine Lieblingssongs', path: '/liked' },
    { icon: Users, label: familyLabel, path: familyPath, onClick: handleFamilyClick, showBadge: hasPaidSubscription },
  ];

  const settingsItems = [
    { icon: UsersFour, label: 'Freunde', path: '/friends' },
    { icon: MagicWand, label: 'AI Playlists', path: '/ai-playlists' },
    { icon: Microphone, label: 'Karaoke-Modus', path: '/karaoke' },
    { icon: Equalizer, label: 'Audio-Einstellungen', path: '/audio-settings' },
    { icon: Alarm, label: 'Wecker & Timer', path: '/alarms' },
    { icon: ChartBar, label: 'Meine Statistiken', path: '/stats' },
    { icon: Gift, label: 'Geschenke & Codes', path: '/rewards' },
  ];

  return (
    <aside 
      className="h-screen bg-sidebar glass fixed left-0 top-0 flex flex-col overflow-hidden border-r border-sidebar-border"
      style={{ width: '241px' }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary" data-testid="text-logo">GlassBeats</h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-4 h-12 px-4 ${
                    isActive ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground'
                  }`}
                  data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon size={24} weight="bold" />
                  <span className="text-body font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 mb-2 px-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 h-12 px-4 text-muted-foreground hover:text-foreground"
            data-testid="button-create-playlist"
          >
            <Plus size={24} weight="bold" />
            <span className="text-body font-medium">Playlist erstellen</span>
          </Button>
        </div>

        <div className="border-t border-sidebar-border my-4" />

        <div className="space-y-1">
          {libraryItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={item.onClick}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-4 h-12 px-4 ${
                    isActive ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground'
                  }`}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={24} weight="bold" className={isActive ? 'text-primary' : ''} />
                  <span className="text-body font-medium">{item.label}</span>
                  {item.showBadge && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                      Familie
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-sidebar-border my-4" />
        
        <div className="mb-2 px-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Einstellungen</h2>
        </div>

        <div className="space-y-1">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-4 h-12 px-4 ${
                    isActive ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground'
                  }`}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={24} weight="bold" className={isActive ? 'text-primary' : ''} />
                  <span className="text-body font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
