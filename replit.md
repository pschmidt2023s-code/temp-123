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
│   │   ├── Sidebar.tsx      # 241px fixed Navigation
│   │   ├── TopBar.tsx       # 64px Search & User Menu
│   │   ├── Player.tsx       # 90px Bottom Player
│   │   ├── Card.tsx         # 200x200px Album/Playlist Cards
│   │   └── TrackRow.tsx     # Track List Row
│   ├── pages/
│   │   ├── Home.tsx         # Für dich / Featured
│   │   ├── Search.tsx       # Suche mit Kategorien
│   │   ├── Album.tsx        # Album-Detailansicht
│   │   ├── Playlist.tsx     # Playlist-Detailansicht
│   │   ├── Artist.tsx       # Künstler-Profil
│   │   ├── Liked.tsx        # Lieblingssongs
│   │   └── Library.tsx      # Bibliothek
│   ├── store/
│   │   └── usePlayer.ts     # Zustand Player State
│   ├── lib/
│   │   ├── musickit.ts      # MusicKit Service
│   │   └── demo-data.ts     # Demo Tracks/Albums
│   └── App.tsx              # Main Layout & Routing
│
shared/
└── schema.ts                # TypeScript Types & Schemas

server/
├── routes.ts                # API Endpoints
└── storage.ts               # Data Storage Interface
```

## Features

### Implementiert ✅
- Pixel-perfekte Spotify UI mit exakten inline-style Maßen (241px, 64px, 90px)
- Glassmorphism-Effekte auf allen Elementen
- Vollständige Navigation (7 Seiten)
- Player mit allen Controls (Play, Pause, Next, Previous, Shuffle, Repeat)
- Progress Bar & Volume Control
- Card-basiertes Layout mit Hover-Effekten (4px Lift, 20% Overlay)
- Track-Listen mit Spalten
- Responsive Design
- Deutsche UI (komplett)
- **MusicKit Catalog Integration**: Search, Album, Playlist, Artist pages nutzen Live-Daten
- **Apple Music Authentifizierung**: Login/Logout UI im TopBar mit Status-Badge
- **Timed Lyrics Overlay**: Vollbild-Lyrics mit Wort-für-Wort-Synchronisation
- MusicKit Hooks vollständig implementiert (useMKAuth, useMKCatalog, useMKPlayback, useMKLyrics)
- Backend Playlist-Management mit React Query
- PWA Support (Manifest + Service Worker)

### Player Features
- Queue Management
- Shuffle & Repeat Modes
- Volume Control (0-100)
- Current Time & Duration Display
- Play/Pause Toggle
- Skip Forward/Backward

### Hover-Interaktionen
- Card Lift (4px translateY)
- Black Overlay (20% opacity)
- Play Button erscheint
- Shadow Intensität +20%
- Scale Animation auf Play Buttons (1.05)
- Alle Transitions: 200ms ease

## Environment Variables

```
VITE_MK_DEV_TOKEN=<Apple MusicKit Developer Token>
```

**Hinweis**: Ohne Token läuft die App im Demo-Modus mit vordefinierten Tracks.

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

## Zukünftige Features

- Timed Lyrics Overlay
- Cloud Library Upload
- Radio Stationen
- Service Worker für PWA
- Offline-Cache
- Collaborative Playlists
- Crossfade & Gapless Playback (über MusicKit)

## Lizenz

Dieses Projekt ist eine Demo-Anwendung für Bildungszwecke.
