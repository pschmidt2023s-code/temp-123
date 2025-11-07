# GlassBeats - Pixel-Perfect Spotify Clone mit Apple Music Integration

## Projektübersicht
GlassBeats ist eine pixel-perfekte Nachbildung der Spotify-Oberfläche mit vollständiger Apple Music Integration. Die Anwendung bietet Zugriff auf 100 Millionen Songs, Lossless Audio, Dolby Atmos, Gapless Playback, Crossfade, timed Lyrics und alle modernen Musik-Streaming-Features.

## Design-Spezifikationen

### Exakte Spotify-Farben (Dark Mode Only)
- **Background**: #121212 (0 0% 7.1%)
- **Surface 1**: #181818 (0 0% 9.4%)
- **Surface 2**: #242424 (0 0% 14.1%)
- **Hover**: #2a2a2a (0 0% 16.5%)
- **Accent**: #1DB954 (142 70% 41%) - Spotify Green
- **Text Primary**: #FFFFFF
- **Text Secondary**: #B3B3B3 (0 0% 70%)

### Exakte Layout-Maße
- **Sidebar**: 241px fixed width, 8px padding
- **TopBar**: 64px height, 32px horizontal padding
- **Player Bar**: 90px height, fixed bottom
- **Content Cards**: 200×200px album covers, 16px border radius

### Glassmorphism-Effekte
Alle Cards, Header, Player und Sidebar erhalten Glassmorphism:
- 20px Backdrop Blur mit 180% Saturation
- White overlay at 6% opacity
- 1px border at 8% white opacity
- 16px border radius
- Drop shadow: 0 8px 32px rgba(0,0,0,0.37)

### Typografie
- **Font**: Circular Std (via fonts.cdnfonts.com), Fallback: Helvetica Neue
- **Größen**: 32px (Heading), 24px (Subheading), 16px (Body), 14px (Secondary), 12px (Metadata)

## Technologie-Stack

### Frontend
- React 18 mit TypeScript
- Tailwind CSS mit Custom Design System
- Wouter für Routing
- Phosphor Icons (bold, 24px)
- Zustand für State Management
- TanStack Query für Data Fetching

### Backend
- Express.js
- In-Memory Storage (kann auf PostgreSQL umgestellt werden)
- API-Routen für User-Preferences und Playlists

### Apple Music Integration
- MusicKit JS v3 (über CDN geladen)
- Developer Token wird als VITE_MK_DEV_TOKEN Secret erwartet
- Demo-Modus wenn kein Token vorhanden

## Projekt-Struktur

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI Komponenten
│   │   ├── Sidebar.tsx      # 241px fixed Desktop Navigation (Abos/Familie dynamisch)
│   │   ├── MobileNav.tsx    # Bottom Navigation für Mobile (bottom: 90px)
│   │   ├── TopBar.tsx       # 64px Search & User Menu
│   │   ├── Player.tsx       # 90px Bottom Player (React.memo optimiert)
│   │   ├── FullscreenPlayer.tsx  # Fullscreen Player mit animierten Album-Farben
│   │   ├── Card.tsx         # 200x200px (Desktop) / 132x132px (Mobile) Cards
│   │   └── TrackRow.tsx     # Track List Row
│   ├── pages/
│   │   ├── Home.tsx         # Für dich / Featured
│   │   ├── Search.tsx       # Suche mit Kategorien
│   │   ├── Album.tsx        # Album-Detailansicht
│   │   ├── Playlist.tsx     # Playlist-Detailansicht
│   │   ├── Artist.tsx       # Künstler-Profil
│   │   ├── Liked.tsx        # Lieblingssongs
│   │   ├── Library.tsx      # Bibliothek
│   │   ├── Pricing.tsx      # Subscription-Pläne (3 Tiers)
│   │   ├── LiveRooms.tsx    # Live Music Rooms (WebSocket)
│   │   ├── AdminLogin.tsx   # Admin-Login mit Lock Icon
│   │   └── AdminDashboard.tsx  # Admin-Dashboard mit Tabs (Releases, Links, Services)
│   ├── hooks/
│   │   ├── useSubscription.ts  # Subscription Management
│   │   ├── useLiveRoom.ts      # WebSocket Live Room Hook
│   │   └── useAdminAuth.ts     # Admin Authentication Hook
│   ├── store/
│   │   └── usePlayer.ts     # Zustand Player State
│   ├── lib/
│   │   ├── musickit.ts           # MusicKit Service
│   │   ├── demo-data.ts          # Demo Tracks/Albums
│   │   └── subscription-features.ts  # Feature Access Control
│   └── App.tsx              # Main Layout & Routing (Admin-Routes separiert)
│
shared/
└── schema.ts                # TypeScript Types & Schemas (Subscriptions, Admin, Releases, Coupons)

server/
├── routes.ts                # API Endpoints (User, Playlists, Subscriptions, Admin, Coupons, Payments)
├── storage.ts               # Data Storage Interface (inkl. Admin-Daten, Coupon-Management)
├── rooms.ts                 # WebSocket Server für Live Rooms
└── paypal.ts                # PayPal SDK Integration (optional)
```

## Features

### Implementiert ✅

#### Core UI & Design
- Pixel-perfekte Spotify UI mit exakten inline-style Maßen (241px, 64px, 90px)
- Glassmorphism-Effekte auf allen Elementen mit backdrop-blur (GPU-beschleunigt)
- Vollständige Navigation (8 Seiten inkl. Pricing & Live Rooms)
- Deutsche UI (komplett)
- **Responsive Mobile Design**: Bottom Navigation (bündig über Player bei bottom: 90px), optimierte Card-Größen (132×132px), Touch-optimierte Controls
- **Performance-Optimiert**: React.memo für Player, requestAnimationFrame für Animationen, backdrop-blur für GPU-Beschleunigung

#### Player & Playback
- Player mit allen Controls (Play, Pause, Next, Previous, Shuffle, Repeat)
- Progress Bar & Volume Control
- Queue Management
- Shuffle & Repeat Modes
- Current Time & Duration Display mit Timer-Synchronisation
- **Fullscreen Player** ✨: Großer Bildschirm-füllender Player
  - Dynamische Farbextraktion aus Album-Covers (Canvas API)
  - Animierte Hintergrund-Gradients mit Album-Farben
  - Beat-Pulsation: Farben und Album-Cover pulsieren im Takt (requestAnimationFrame)
  - Smooth Animationen (60 FPS, GPU-beschleunigt)
  - Mobile & Desktop optimiert

#### Apple Music Integration
- **MusicKit Catalog Integration**: Alle Pages (Home, Search, Album, Playlist, Artist) nutzen Live-Daten
- **Home Page Live-Daten**: Recently Played, Recommendations, New Releases aus MusicKit Catalog
- **Radio Stations**: "Radio starten" Buttons auf Album/Artist Pages für MusicKit Stations
- **Apple Music Authentifizierung**: Login/Logout UI im TopBar mit Status-Badge
- **Timed Lyrics Overlay**: Vollbild-Lyrics mit Wort-für-Wort-Synchronisation
- MusicKit Hooks vollständig implementiert (useMKAuth, useMKCatalog, useMKPlayback, useMKLyrics)

#### Subscription System
- **3-Tier Subscription Model**:
  - **Plus** (4,99€): Werbefrei, Offline-Downloads
  - **Premium** (9,99€): Plus + Dolby Atmos, Lossless Audio, Unbegrenzte Skips
  - **Family** (14,99€): Premium + Live Music Rooms, bis zu 6 Accounts
- Backend API-Routen: GET/POST/PATCH für Subscriptions
- Feature Access Control mit `getFeatureAccess()` Helper
- Pricing Page mit interaktiven Tier-Cards
- Upgrade/Downgrade Flows mit Toast-Notifications
- **Navigation**: "Abos" Punkt ändert sich zu "Familie" nach Abo-Abschluss
- **Feature Gating**: Upgrade-Prompts für Nicht-Family-Tier bei Live Rooms-Zugriff
- **Gutschein-Integration** 💰:
  - Gutscheincode-Eingabe auf Pricing Page
  - Real-time Validierung vor Checkout
  - Rabatt-Visualisierung (durchgestrichener Preis)
  - Stripe-Coupon-Integration für automatische Rabatt-Anwendung
  - Tier-spezifische Gutschein-Gültigkeit
  - Automatisches Usage-Tracking bei erfolgreicher Zahlung
- **Payment Options**:
  - Stripe Checkout (Kreditkarte)
  - PayPal Integration (optional, nur mit Secrets)

#### Admin Dashboard 🔐
- **Sichere Authentifizierung**: bcrypt Password-Hashing, Session-Token-basiert
- **Release-Management**: 
  - Releases anlegen, bearbeiten, löschen
  - Status-Verwaltung (pending, approved, published, rejected)
  - ISRC, UPC, Catalog ID Unterstützung
- **Künstler-Registrierung**:
  - Einmalige Registrierungslinks generieren
  - 7 Tage Gültigkeit
  - Link-Status-Tracking (aktiv, verwendet, abgelaufen)
  - E-Mail & Künstlername optional speicherbar
- **Streaming-Service-Management**:
  - Services hinzufügen, bearbeiten, löschen
  - Status-Verwaltung (active, maintenance, disabled)
  - API-Endpoint-Konfiguration
- **Gutschein-System** ✨:
  - CRUD-Interface für Rabatt-Gutscheine
  - Prozentuale oder Festpreis-Rabatte
  - Tier-spezifische Gutscheine (Plus/Premium/Family)
  - Verwendungslimits & Ablaufdatum
  - Automatisches Usage-Tracking
  - Real-time Validierung beim Checkout
- **Admin-Credentials**: Gesichert als ADMIN_USERNAME & ADMIN_PASSWORD Secrets
- **Zugriff**: `/admin/login` und `/admin` Routen, separates Layout ohne Player/Navigation

#### Live Music Rooms (EINZIGARTIGES FEATURE) ✨
- **WebSocket-basierte Echtzeit-Synchronisation** (ws Package)
- **Room Management**: Erstellen, Beitreten, Verlassen
- **Synchronisiertes Playback**: Alle Teilnehmer hören gleichzeitig
- **Live-Chat**: Nachrichten in Echtzeit während des Hörens
- **Teilnehmer-Anzeige**: Wer ist aktuell im Room?
- **Feature Gating**: Nur für Family-Abonnenten zugänglich
- **Bis zu 6 Teilnehmer** pro Room (Family-Tier)

#### Weitere Features
- Backend Playlist-Management mit React Query
- PWA Support (Manifest + Service Worker)
- Card-basiertes Layout mit Hover-Effekten (4px Lift, 20% Overlay)

### Player Features
- Queue Management
- Shuffle & Repeat Modes
- Volume Control (0-100)
- Current Time & Duration Display
- Play/Pause Toggle
- Skip Forward/Backward

### Hover-Interaktionen & Performance
- Card Lift (4px translateY)
- Black Overlay (20% opacity)
- Play Button erscheint
- Shadow Intensität +20%
- Scale Animation auf Play Buttons (1.05)
- Alle Transitions: 200ms ease
- **Active States**: active:scale-95 für Touch-Feedback
- **GPU-Beschleunigung**: backdrop-blur für Hardware-Rendering
- **Akku-Sparsamkeit**: requestAnimationFrame statt setInterval für Animationen
- **React Performance**: React.memo für häufig re-rendernde Komponenten

## Environment Variables

```
VITE_MK_DEV_TOKEN=<Apple MusicKit Developer Token>
ADMIN_USERNAME=<Kryptischer Admin-Benutzername>
ADMIN_PASSWORD=<Sicheres Admin-Passwort>
STRIPE_SECRET_KEY=<Stripe Secret Key>
VITE_STRIPE_PUBLIC_KEY=<Stripe Public Key>
SESSION_SECRET=<Session Secret für Express>
PAYPAL_CLIENT_ID=<PayPal Client ID> (optional)
PAYPAL_CLIENT_SECRET=<PayPal Client Secret> (optional)
```

**Hinweise**: 
- Ohne VITE_MK_DEV_TOKEN läuft die App im Demo-Modus
- ADMIN_PASSWORD unterstützt sowohl bcrypt-Hashes als auch Klartext (für Dev)
- Stripe-Keys erforderlich für Zahlungs-Integration
- PayPal-Keys optional - App läuft auch ohne PayPal-Integration

## Apple MusicKit Setup

1. Besuchen Sie https://developer.apple.com
2. Melden Sie sich mit Ihrer Apple ID an
3. Navigieren Sie zu "Certificates, Identifiers & Profiles"
4. Erstellen Sie einen MusicKit Identifier
5. Generieren Sie einen Developer Token
6. Fügen Sie den Token als VITE_MK_DEV_TOKEN Secret hinzu

## Entwicklung

```bash
npm install
npm run dev
```

Die Anwendung startet auf Port 5000 und ist über die Replit-URL erreichbar.

## Deutsche UI Labels

Alle Texte sind auf Deutsch:
- Start (Home)
- Suchen (Search)
- Deine Bibliothek (Library)
- Deine Lieblingssongs (Liked Songs)
- Playlist erstellen (Create Playlist)
- Songtexte (Lyrics)
- Warteschlange (Queue)
- Für dich (For You)
- Kürzlich gespielt (Recently Played)
- Neuerscheinungen (New Releases)

## Performance-Optimierungen

- Lazy Loading für Bilder
- Optimierte Artwork-URLs (400x400 für Cards, 64x64 für Player)
- Smooth Scroll für Carousels
- Debounced Search
- Minimal Re-renders durch Zustand

## Design-Compliance

✅ Sidebar exakt 241px
✅ TopBar exakt 64px
✅ Player exakt 90px
✅ Cards exakt 200x200px
✅ Glass-Blur 20px sichtbar
✅ Hover-Animationen (4px Lift + Shadow)
✅ Phosphor Icons bold, 24px
✅ Circular Font geladen
✅ Spotify Green (#1DB954) für Akzente
✅ Alle Maße pixel-genau

## Aktuelle Implementierung (November 2025)

### Phase 1: MusicKit Integration (✅ Abgeschlossen)
- ✅ Home Page: Recently Played, Recommendations, New Releases
- ✅ Search Page: Debounced catalog search mit URL sync
- ✅ Album/Playlist/Artist Pages: Live catalog data mit Tracks
- ✅ Radio Stations: Create & play MusicKit stations
- ✅ Timed Lyrics: Fullscreen overlay mit word-sync
- ✅ Authentication: Login/Logout flow im TopBar
- ✅ Alle 6 Resource Types: albums, playlists, artists, songs, music-videos, stations

### Phase 2: Responsive Mobile & Subscriptions (✅ NEU)
- ✅ **Responsive Design**: Mobile Bottom Navigation, optimierte Card-Größen (132×132px), Touch-Controls
- ✅ **Subscription Backend**: Schema erweitert, API-Routen implementiert (GET/POST/PATCH)
- ✅ **Pricing Page**: 3 Tier-Cards (Plus/Premium/Family) mit Feature-Liste
- ✅ **Feature Access Control**: `getFeatureAccess()` Helper für Tier-basierte Features
- ✅ **Live Music Rooms Backend**: WebSocket Server mit Room-Management
- ✅ **Live Music Rooms Frontend**: Room-Erstellung, Chat, Teilnehmer-Liste, synchronisierte Controls
- ✅ **Feature Gating**: Live Rooms nur für Family-Tier mit Upgrade-Prompt

### Demo-Modus Fallback
- App läuft ohne VITE_MK_DEV_TOKEN mit vordefinierten Tracks
- Nahtloser Übergang zu Live-Daten sobald authentifiziert
- Subscription-System funktioniert mit Demo-User

## Alleinstellungsmerkmale

**Live Music Rooms** ist ein einzigartiges Feature, das bei keinem aktuellen Musik-Streaming-Dienst verfügbar ist:
- **Spotify**: Kein synchronisiertes Hören mit Freunden
- **Apple Music**: SharePlay nur für FaceTime, kein eigenständiges Feature
- **YouTube Music**: Keine Live-Rooms oder Synchronisation
- **Tidal**: Keine Social-Listening-Features
- **GlassBeats**: ✨ **Live Music Rooms mit WebSocket-Echtzeit-Sync, Chat und gemeinsamer Queue!**

## Zukünftige Features (Roadmap)

- Cloud Library Upload
- Offline-Cache mit Service Worker (für Plus+)
- Collaborative Playlists (für Premium+)
- Crossfade & Gapless Playback (über MusicKit)
- Screen Sharing in Live Rooms (Video-Integration)
- Voice Chat in Live Rooms (WebRTC)

## Lizenz

Dieses Projekt ist eine Demo-Anwendung für Bildungszwecke.
