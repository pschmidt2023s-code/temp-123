import { ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'wouter';

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="flex justify-center md:justify-start mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-foreground text-center md:text-left">Datenschutzerklärung</h1>
        
        <div className="text-sm text-muted-foreground mb-8">
          Stand: November 2025
        </div>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
            <div className="space-y-3 text-muted-foreground">
              <h3 className="text-lg font-semibold text-foreground mb-2">Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
                persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen 
                Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Datenerfassung auf dieser Website</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Wer ist verantwortlich für die Datenerfassung?</h3>
                <p>
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
                  können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung 
                  entnehmen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Wie erfassen wir Ihre Daten?</h3>
                <p>
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich 
                  z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder bei der Registrierung angeben.
                </p>
                <p className="mt-2">
                  Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere 
                  IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder 
                  Uhrzeit des Seitenaufrufs).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Wofür nutzen wir Ihre Daten?</h3>
                <p>
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. 
                  Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden, um Ihnen personalisierte 
                  Musikempfehlungen zu geben.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
                <p>
                  Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer 
                  gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung 
                  oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt 
                  haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Verantwortliche Stelle</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="font-medium text-foreground">GlassBeats GmbH</p>
                <p>Musikstraße 42</p>
                <p>10115 Berlin</p>
                <p className="mt-2">
                  Telefon:{' '}
                  <a href="tel:+4915012345678" className="text-primary hover:underline">
                    +49 1501 234 5678
                  </a>
                </p>
                <p>
                  E-Mail:{' '}
                  <a href="mailto:datenschutz@glassbeats.de" className="text-primary hover:underline">
                    datenschutz@glassbeats.de
                  </a>
                </p>
              </div>
              <p className="mt-4">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit 
                anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, 
                E-Mail-Adressen o. Ä.) entscheidet.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Speicherdauer</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, 
                verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.
              </p>
              <p>
                Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung 
                widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die 
                Speicherung Ihrer personenbezogenen Daten haben (z.B. steuer- oder handelsrechtliche Aufbewahrungsfristen).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Allgemeine Hinweise und Pflichtinformationen</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">SSL- bzw. TLS-Verschlüsselung</h3>
                <p>
                  Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine 
                  SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die 
                  Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer 
                  Browserzeile.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Auskunft, Löschung und Berichtigung</h3>
                <p>
                  Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche 
                  Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck 
                  der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Widerspruch gegen Werbe-E-Mails</h3>
                <p>
                  Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von 
                  nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Datenerfassung auf dieser Website</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Cookies</h3>
                <p>
                  Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten 
                  auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung 
                  (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
                </p>
                <p className="mt-2">
                  Wir verwenden folgende Arten von Cookies:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>
                    <strong className="text-foreground">Notwendige Cookies:</strong> Für den Betrieb der Seite 
                    unbedingt erforderlich (z.B. Session-Cookies, CSRF-Schutz)
                  </li>
                  <li>
                    <strong className="text-foreground">Funktionale Cookies:</strong> Speichern Ihre Präferenzen 
                    (z.B. Lautstärke, Playback-Einstellungen)
                  </li>
                  <li>
                    <strong className="text-foreground">Analyse-Cookies:</strong> Helfen uns, die Website-Nutzung 
                    zu verstehen und zu verbessern (nur mit Ihrer Einwilligung)
                  </li>
                </ul>
                <p className="mt-2">
                  Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und 
                  Cookies nur im Einzelfall erlauben.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Server-Log-Dateien</h3>
                <p>
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Browsertyp und Browserversion</li>
                  <li>Verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>
                <p className="mt-2">
                  Diese Daten werden nicht mit anderen Datenquellen zusammengeführt. Die Erfassung dieser Daten erfolgt 
                  auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Registrierung auf dieser Website</h3>
                <p>
                  Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. Die dazu 
                  eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes. Die bei der 
                  Registrierung abgefragten Pflichtangaben müssen vollständig angegeben werden.
                </p>
                <p className="mt-2">
                  Bei der Registrierung werden folgende Daten erhoben:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>E-Mail-Adresse</li>
                  <li>Benutzername</li>
                  <li>Passwort (verschlüsselt gespeichert)</li>
                  <li>Geburtsdatum (zur Altersverifikation)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Kommentarfunktion und Playlists</h3>
                <p>
                  Wenn Sie Kommentare hinterlassen oder Playlists erstellen, werden neben Ihrem Kommentar bzw. Ihrer 
                  Playlist auch Angaben zum Zeitpunkt der Erstellung gespeichert. Diese Daten werden auf Grundlage 
                  Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) gespeichert.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Plugins und Tools</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Apple MusicKit</h3>
                <p>
                  Diese Website nutzt die Apple MusicKit API, um Musikinhalte bereitzustellen. Dabei werden folgende 
                  Daten an Apple Inc. übermittelt:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Ihre IP-Adresse</li>
                  <li>Geräteinformationen</li>
                  <li>Hörverhalten und Musikpräferenzen</li>
                  <li>Suchvorgänge</li>
                </ul>
                <p className="mt-2">
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Weitere Informationen finden Sie in der{' '}
                  <a 
                    href="https://www.apple.com/legal/privacy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Datenschutzerklärung von Apple
                  </a>.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Stripe</h3>
                <p>
                  Für die Zahlungsabwicklung nutzen wir den Zahlungsdienstleister Stripe. Anbieter ist Stripe, Inc., 
                  510 Townsend Street, San Francisco, CA 94103, USA.
                </p>
                <p className="mt-2">
                  Details entnehmen Sie der Datenschutzerklärung von Stripe:{' '}
                  <a 
                    href="https://stripe.com/de/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://stripe.com/de/privacy
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">PayPal</h3>
                <p>
                  Auf dieser Website bieten wir u.a. die Bezahlung via PayPal an. Anbieter dieses Zahlungsdienstes 
                  ist die PayPal (Europe) S.à.r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg.
                </p>
                <p className="mt-2">
                  Details entnehmen Sie der Datenschutzerklärung von PayPal:{' '}
                  <a 
                    href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://www.paypal.com/de/webapps/mpp/ua/privacy-full
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Eigene Dienste</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Verarbeitung von Nutzungsdaten</h3>
                <p>
                  Wir verarbeiten Daten über Ihre Nutzung unseres Dienstes, um:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Personalisierte Musikempfehlungen zu erstellen</li>
                  <li>Ihre Hörstatistiken zu berechnen</li>
                  <li>AI-Playlists basierend auf Ihrem Geschmack zu generieren</li>
                  <li>Die Dienste zu verbessern und weiterzuentwickeln</li>
                </ul>
                <p className="mt-2">
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und lit. f DSGVO (berechtigtes Interesse).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Live Music Rooms</h3>
                <p>
                  In Live Music Rooms werden folgende Daten verarbeitet:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Ihr Benutzername und Profilbild</li>
                  <li>Ihre Chat-Nachrichten</li>
                  <li>Zeitstempel Ihrer Aktivitäten</li>
                  <li>Die von Ihnen abgespielte Musik</li>
                </ul>
                <p className="mt-2">
                  Diese Daten sind für andere Teilnehmer des Rooms sichtbar. Rechtsgrundlage ist Ihre Einwilligung 
                  (Art. 6 Abs. 1 lit. a DSGVO).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Offline-Downloads</h3>
                <p>
                  Heruntergeladene Musiktitel werden lokal auf Ihrem Gerät gespeichert. Wir speichern Informationen 
                  darüber, welche Titel Sie heruntergeladen haben, um die Download-Limits Ihres Abonnements zu verwalten.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Ihre Rechte</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-foreground">Recht auf Auskunft:</strong> Sie können Auskunft über Ihre 
                  gespeicherten personenbezogenen Daten verlangen.
                </li>
                <li>
                  <strong className="text-foreground">Recht auf Berichtigung:</strong> Sie können die Berichtigung 
                  unrichtiger Daten verlangen.
                </li>
                <li>
                  <strong className="text-foreground">Recht auf Löschung:</strong> Sie können die Löschung Ihrer 
                  Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
                </li>
                <li>
                  <strong className="text-foreground">Recht auf Einschränkung der Verarbeitung:</strong> Sie können 
                  verlangen, dass die Verarbeitung Ihrer Daten eingeschränkt wird.
                </li>
                <li>
                  <strong className="text-foreground">Recht auf Datenübertragbarkeit:</strong> Sie können verlangen, 
                  dass wir Ihre Daten in einem strukturierten, gängigen Format an Sie oder einen anderen Verantwortlichen 
                  übermitteln.
                </li>
                <li>
                  <strong className="text-foreground">Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer 
                  Daten aus Gründen widersprechen, die sich aus Ihrer besonderen Situation ergeben.
                </li>
                <li>
                  <strong className="text-foreground">Widerruf der Einwilligung:</strong> Sofern die Verarbeitung auf 
                  Ihrer Einwilligung beruht, können Sie diese jederzeit widerrufen.
                </li>
              </ul>
              <p className="mt-4">
                Zur Ausübung dieser Rechte wenden Sie sich bitte an:{' '}
                <a href="mailto:datenschutz@glassbeats.de" className="text-primary hover:underline">
                  datenschutz@glassbeats.de
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Beschwerderecht bei der Aufsichtsbehörde</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über unsere Verarbeitung 
                personenbezogener Daten zu beschweren. Die für uns zuständige Aufsichtsbehörde ist:
              </p>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="font-medium text-foreground">Berliner Beauftragte für Datenschutz und Informationsfreiheit</p>
                <p>Friedrichstraße 219</p>
                <p>10969 Berlin</p>
                <p className="mt-2">
                  Telefon: +49 30 13889-0
                </p>
                <p>
                  E-Mail: mailbox@datenschutz-berlin.de
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-semibold mb-4">Kontakt Datenschutz</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Bei Fragen zum Datenschutz kontaktieren Sie uns gerne:</p>
              <p>
                E-Mail:{' '}
                <a href="mailto:datenschutz@glassbeats.de" className="text-primary hover:underline">
                  datenschutz@glassbeats.de
                </a>
              </p>
              <p>
                Telefon:{' '}
                <a href="tel:+4915012345678" className="hover:text-primary transition-colors">
                  +49 1501 234 5678
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
