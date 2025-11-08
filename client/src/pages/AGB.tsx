import { ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'wouter';

export default function AGB() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-foreground text-center md:text-left">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="text-sm text-muted-foreground mb-8">
          Stand: November 2025
        </div>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 1 Geltungsbereich</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge über die 
                Nutzung des Musik-Streaming-Dienstes GlassBeats zwischen der GlassBeats GmbH (nachfolgend „Anbieter" 
                oder „wir") und dem Nutzer (nachfolgend „Nutzer" oder „Sie").
              </p>
              <p>
                (2) Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der Anbieter stimmt 
                ihrer Geltung ausdrücklich schriftlich zu.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 2 Leistungsumfang</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) GlassBeats bietet einen Musik-Streaming-Dienst mit Zugang zu über 100 Millionen Songs, Playlists, 
                Radio-Stationen und weiteren Funktionen.
              </p>
              <p>
                (2) Der Dienst wird in verschiedenen Abonnement-Modellen angeboten:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-foreground">Plus (€4,99/Monat):</strong> Basis-Features inkl. Werbefreiheit, 
                  unbegrenzte Skips, Offline-Modus (limitiert)
                </li>
                <li>
                  <strong className="text-foreground">Premium (€9,99/Monat):</strong> Erweiterte Features inkl. 
                  Lossless Audio, Dolby Atmos, AI-Playlists, Custom Radio, unbegrenzte Downloads
                </li>
                <li>
                  <strong className="text-foreground">Family (€14,99/Monat):</strong> Alle Premium-Features plus 
                  Live Music Rooms, bis zu 6 Familienkonten, gemeinsame Playlists
                </li>
              </ul>
              <p>
                (3) Der konkrete Leistungsumfang des jeweiligen Abonnements ergibt sich aus der aktuellen 
                Leistungsbeschreibung auf unserer Website unter{' '}
                <Link href="/pricing" className="text-primary hover:underline">
                  www.glassbeats.de/pricing
                </Link>.
              </p>
              <p>
                (4) Der Anbieter behält sich vor, den Dienst weiterzuentwickeln und zu verbessern. Änderungen am 
                Leistungsumfang, die für den Nutzer nicht nachteilig sind, sind jederzeit möglich.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 3 Vertragsschluss und Registrierung</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Die Darstellung der Abonnements auf unserer Website stellt kein bindendes Angebot dar, sondern 
                eine Aufforderung zur Abgabe eines Angebots.
              </p>
              <p>
                (2) Durch Anklicken des Buttons „Jetzt abonnieren" bzw. „Kaufen" gibt der Nutzer ein verbindliches 
                Angebot zum Abschluss eines Abonnementvertrages ab.
              </p>
              <p>
                (3) Der Vertrag kommt zustande, wenn der Anbieter das Angebot des Nutzers durch Zusendung einer 
                Auftragsbestätigung per E-Mail oder durch Freischaltung des Zugangs annimmt.
              </p>
              <p>
                (4) Für die Nutzung des Dienstes ist eine Registrierung erforderlich. Der Nutzer verpflichtet sich, 
                bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen und diese aktuell zu halten.
              </p>
              <p>
                (5) Der Nutzer ist verpflichtet, seine Zugangsdaten geheim zu halten und nicht an Dritte weiterzugeben. 
                Bei Verdacht auf Missbrauch ist der Anbieter unverzüglich zu informieren.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 4 Preise und Zahlungsbedingungen</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Es gelten die zum Zeitpunkt der Bestellung auf unserer Website angezeigten Preise. Alle Preise 
                verstehen sich einschließlich der gesetzlichen Umsatzsteuer.
              </p>
              <p>
                (2) Die Zahlung erfolgt monatlich im Voraus über die vom Nutzer gewählte Zahlungsmethode 
                (Kreditkarte, PayPal, SEPA-Lastschrift).
              </p>
              <p>
                (3) Bei Zahlung per Kreditkarte oder PayPal wird das Entgelt automatisch zum Beginn jedes 
                Abrechnungszeitraums eingezogen. Bei SEPA-Lastschrift erfolgt der Einzug nach Ankündigung.
              </p>
              <p>
                (4) Schlägt die Zahlung fehl, ist der Anbieter berechtigt, den Zugang bis zur erfolgreichen Zahlung 
                zu sperren. Der Nutzer bleibt zur Zahlung verpflichtet.
              </p>
              <p>
                (5) Der Anbieter behält sich vor, die Preise mit einer Ankündigungsfrist von 4 Wochen anzupassen. 
                Der Nutzer hat in diesem Fall ein Sonderkündigungsrecht.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 5 Vertragslaufzeit und Kündigung</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Das Abonnement wird auf unbestimmte Zeit geschlossen und verlängert sich automatisch um jeweils 
                einen Monat, sofern es nicht gekündigt wird.
              </p>
              <p>
                (2) Der Vertrag kann von beiden Seiten jederzeit zum Ende des laufenden Abrechnungszeitraums 
                gekündigt werden.
              </p>
              <p>
                (3) Die Kündigung erfolgt über die Kontoeinstellungen auf der Website oder per E-Mail an 
                <a href="mailto:kuendigung@glassbeats.de" className="text-primary hover:underline ml-1">
                  kuendigung@glassbeats.de
                </a>.
              </p>
              <p>
                (4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
              </p>
              <p>
                (5) Nach Kündigung kann der Nutzer den Dienst bis zum Ende des bereits bezahlten Zeitraums weiter nutzen. 
                Eine anteilige Erstattung erfolgt nicht.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 6 Widerrufsrecht für Verbraucher</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die Widerrufsfrist beträgt vierzehn Tage ab 
                dem Tag des Vertragsschlusses.
              </p>
              <p>
                (2) Um das Widerrufsrecht auszuüben, muss der Nutzer uns mittels einer eindeutigen Erklärung 
                (z.B. per E-Mail an{' '}
                <a href="mailto:widerruf@glassbeats.de" className="text-primary hover:underline">
                  widerruf@glassbeats.de
                </a>) über seinen Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>
              <p>
                (3) Das Widerrufsrecht erlischt vorzeitig, wenn der Nutzer ausdrücklich zugestimmt hat, dass wir mit 
                der Ausführung des Vertrages vor Ablauf der Widerrufsfrist beginnen, und seine Kenntnis davon bestätigt 
                hat, dass er durch seine Zustimmung mit Beginn der Ausführung des Vertrages sein Widerrufsrecht verliert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 7 Nutzungsrechte und Pflichten</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Der Nutzer erhält ein nicht ausschließliches, nicht übertragbares Recht zur privaten Nutzung des 
                Dienstes für die Dauer des Abonnements.
              </p>
              <p>
                (2) Der Nutzer ist nicht berechtigt:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Den Dienst gewerblich zu nutzen oder öffentlich wiederzugeben</li>
                <li>Inhalte zu kopieren, herunterzuladen (außer im Offline-Modus), zu verkaufen oder weiterzuverbreiten</li>
                <li>Technische Schutzmaßnahmen zu umgehen oder zu entfernen</li>
                <li>Den Dienst für rechtswidrige Zwecke zu nutzen</li>
                <li>Die Rechte Dritter zu verletzen</li>
              </ul>
              <p>
                (3) Der Nutzer verpflichtet sich, keine automatisierten Systeme (Bots, Scraper) zur Nutzung des 
                Dienstes einzusetzen.
              </p>
              <p>
                (4) Bei Verstoß gegen diese Nutzungsbedingungen kann der Anbieter den Zugang sperren und den Vertrag 
                fristlos kündigen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 8 Verfügbarkeit und Haftung</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Der Anbieter bemüht sich um eine möglichst hohe Verfügbarkeit des Dienstes. Eine Verfügbarkeit 
                von 100% kann technisch nicht gewährleistet werden.
              </p>
              <p>
                (2) Wartungsarbeiten können zu vorübergehenden Einschränkungen führen. Diese werden nach Möglichkeit 
                angekündigt.
              </p>
              <p>
                (3) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der 
                Verletzung des Lebens, des Körpers oder der Gesundheit.
              </p>
              <p>
                (4) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten 
                (Kardinalpflichten). In diesem Fall ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden 
                begrenzt.
              </p>
              <p>
                (5) Der Anbieter haftet nicht für Inhalte, die von Dritten (z.B. Apple Music, Plattenlabels) 
                bereitgestellt werden.
              </p>
              <p>
                (6) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 9 Datenschutz</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Details zur Datenverarbeitung finden 
                Sie in unserer{' '}
                <Link href="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>.
              </p>
              <p>
                (2) Durch Nutzung des Dienstes stimmen Sie der Verarbeitung Ihrer Daten gemäß der Datenschutzerklärung zu.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 10 Änderungen der AGB</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Der Anbieter behält sich vor, diese AGB zu ändern. Änderungen werden dem Nutzer spätestens 
                vier Wochen vor ihrem Inkrafttreten per E-Mail mitgeteilt.
              </p>
              <p>
                (2) Widerspricht der Nutzer der Geltung der neuen AGB nicht innerhalb von vier Wochen nach Zugang 
                der Mitteilung, gelten die geänderten AGB als angenommen.
              </p>
              <p>
                (3) Der Anbieter wird den Nutzer in der Änderungsmitteilung auf sein Widerspruchsrecht und die 
                Bedeutung der Widerspruchsfrist besonders hinweisen.
              </p>
              <p>
                (4) Widerspricht der Nutzer, hat der Anbieter das Recht, den Vertrag ordentlich zu kündigen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">§ 11 Schlussbestimmungen</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
              </p>
              <p>
                (2) Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches 
                Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag Berlin.
              </p>
              <p>
                (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der 
                übrigen Bestimmungen davon unberührt.
              </p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Bei Fragen zu unseren AGB kontaktieren Sie uns gerne:</p>
              <p>
                E-Mail:{' '}
                <a href="mailto:agb@glassbeats.de" className="text-primary hover:underline">
                  agb@glassbeats.de
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
