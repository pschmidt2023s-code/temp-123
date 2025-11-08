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
                <a href="#impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Impressum
                </a>
              </li>
              <li>
                <a href="#datenschutz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Datenschutz
                </a>
              </li>
              <li>
                <a href="#agb" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AGB
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie-Richtlinie
                </a>
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
              <a href="#impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Impressum
              </a>
              <a href="#datenschutz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Datenschutz
              </a>
              <a href="#agb" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                AGB
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="impressum" className="hidden">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Impressum</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Angaben gemäß § 5 TMG</h3>
              <p>GlassBeats GmbH</p>
              <p>Musikstraße 42</p>
              <p>10115 Berlin</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Vertreten durch</h3>
              <p>Geschäftsführer: Max Mustermann</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Kontakt</h3>
              <p>Telefon: +49 1501 234 5678</p>
              <p>E-Mail: info@glassbeats.de</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Registereintrag</h3>
              <p>Eintragung im Handelsregister</p>
              <p>Registergericht: Amtsgericht Berlin-Charlottenburg</p>
              <p>Registernummer: HRB 123456 B</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Umsatzsteuer-ID</h3>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
              <p>DE123456789</p>
            </div>
          </div>
        </div>
      </div>

      <div id="datenschutz" className="hidden">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Datenschutzerklärung</h2>
          <div className="space-y-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Datenschutz auf einen Blick</h3>
              <p className="mb-2">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
                wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
                werden können.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Datenerfassung auf dieser Website</h3>
              <p className="mb-2">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie 
                dem Impressum dieser Website entnehmen.
              </p>
              <p className="mb-2">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten 
                handeln, die Sie in ein Kontaktformular eingeben.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Analyse-Tools und Tools von Drittanbietern</h3>
              <p className="mb-2">
                Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das geschieht vor allem 
                mit sogenannten Analyseprogrammen. Detaillierte Informationen zu diesen Analyseprogrammen finden Sie in der 
                folgenden Datenschutzerklärung.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Apple Music Integration</h3>
              <p className="mb-2">
                Diese Website nutzt die Apple MusicKit API zur Bereitstellung von Musikinhalten. Dabei werden Daten an Apple 
                übermittelt. Weitere Informationen finden Sie in der Datenschutzerklärung von Apple.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Zahlungsanbieter</h3>
              <p className="mb-2">
                Wir nutzen Stripe und PayPal als Zahlungsdienstleister. Diese verarbeiten Ihre Zahlungsdaten gemäß ihren 
                eigenen Datenschutzbestimmungen.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="agb" className="hidden">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Allgemeine Geschäftsbedingungen (AGB)</h2>
          <div className="space-y-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Geltungsbereich</h3>
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Nutzung der GlassBeats-Plattform 
                zwischen der GlassBeats GmbH (nachfolgend "Anbieter") und dem Nutzer.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Leistungsumfang</h3>
              <p className="mb-2">
                GlassBeats bietet verschiedene Abonnement-Modelle an:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Plus (€4,99/Monat) - Basis-Features</li>
                <li>Premium (€9,99/Monat) - Erweiterte Features</li>
                <li>Family (€14,99/Monat) - Alle Features inkl. Live Music Rooms</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Vertragsschluss</h3>
              <p>
                Der Vertrag kommt durch die Registrierung und Auswahl eines Abonnements zustande. Nach erfolgreicher Zahlung 
                erhalten Sie eine Bestätigungs-E-Mail.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Kündigung</h3>
              <p>
                Das Abonnement kann jederzeit zum Ende des laufenden Zahlungszeitraums gekündigt werden. Die Kündigung erfolgt 
                über die Konto-Einstellungen.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Haftung</h3>
              <p>
                Der Anbieter haftet nicht für Unterbrechungen des Dienstes aufgrund technischer Probleme oder höherer Gewalt.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="cookies" className="hidden">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Cookie-Richtlinie</h2>
          <div className="space-y-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Was sind Cookies?</h3>
              <p>
                Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie eine Website besuchen. 
                Sie helfen uns, Ihre Präferenzen zu speichern und die Website-Nutzung zu analysieren.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Welche Cookies verwenden wir?</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Notwendige Cookies:</strong> Für die Funktion der Website erforderlich (Session, Authentifizierung)</li>
                <li><strong>Funktionale Cookies:</strong> Speichern Ihre Einstellungen und Präferenzen</li>
                <li><strong>Analyse-Cookies:</strong> Helfen uns, die Website-Nutzung zu verstehen und zu verbessern</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Cookies verwalten</h3>
              <p>
                Sie können Cookies in Ihren Browser-Einstellungen jederzeit löschen oder blockieren. Bitte beachten Sie, 
                dass dies die Funktionalität der Website beeinträchtigen kann.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
