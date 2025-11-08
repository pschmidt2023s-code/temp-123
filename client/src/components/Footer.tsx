import { Link } from 'wouter';
import { EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react/dist/ssr';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">GlassBeats</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium Musik-Streaming mit 100 Millionen Songs, Lossless Audio und einzigartigen Social Features.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
              <span>100M+ Songs verfügbar</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Produkt</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Preise & Abos
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/live-rooms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Live Music Rooms
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Offline Downloads
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Unternehmen</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  data-testid="button-open-cookie-settings"
                >
                  Cookie-Einstellungen
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <EnvelopeSimple className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@glassbeats.de" className="hover:text-foreground transition-colors">
                  info@glassbeats.de
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+4915012345678" className="hover:text-foreground transition-colors">
                  +49 1501 234 5678
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Musikstraße 42<br />
                  10115 Berlin, Deutschland
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} GlassBeats. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Datenschutz
              </Link>
              <Link href="/agb" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                AGB
              </Link>
              <button
                onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-footer-cookie-settings"
              >
                Cookie-Einstellungen
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
