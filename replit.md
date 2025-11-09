# GlassBeats - Pixel-Perfect Spotify Clone mit Apple Music Integration

## Overview
GlassBeats is a pixel-perfect Spotify UI clone with full Apple Music integration, offering access to 100 million songs, Lossless Audio, Dolby Atmos, Gapless Playback, Crossfade, and timed lyrics. It aims to replicate the modern music streaming experience while introducing unique features like "Live Music Rooms" for real-time social listening, offline downloads, custom radio stations, car mode, and voice commands. The project focuses on a high-fidelity user experience, performance optimization, and a robust subscription system, positioning itself as a premium music streaming platform with innovative social interaction capabilities.

**Project Status:** All Tier 2 and Tier 3 features complete (31 pages total). Production-ready with comprehensive gamification, social features, creator tools, smart home integration, and bonus features.

**Recent Updates (Nov 9, 2025):**
- **Freemium Model Implementation**: Complete tier-based system with 30s preview for free users, tier-based advertising (Free=always, Plus=every 5h/20s, Premium/Family=ad-free), AdOverlay & PreviewLimitOverlay components
- **AI-Powered Personalization**: useAIPersonalization hook analyzes user listening history to personalize "Neuerscheinungen" based on favorite genres/artists, with visual "Für dich" badge
- **Listening History Tracking**: Automatic tracking of play duration, completion percentage, track type (youtube/apple_music/local), and user behavior for AI analysis
- **Video/MP3 Toggle**: Player includes toggle button to switch between video and audio modes
- **UI Improvements**: YouTube videos in vertical list format without branding, integrated as "Weitere Ergebnisse" and "Neue Musikvideos"
- **Freemium Hooks**: useFreemium hook manages preview limits, ad timing, listening history tracking; automatic 30s playback stop for free tier

**Previous Updates (Nov 8, 2025):**
- **YouTube Music Integration**: Complete playback system using YouTube Data API v3 with intelligent quota management (10k/day limit protection), embedded IFrame Player, search functionality, track matching, and ad monetization
- **UX Reorganization**: Consolidated features into unified Account page (/account) with 5 tabs: Profil, Freunde, Downloads, Audio-Einstellungen, Statistiken
- **Karaoke Integration**: Moved Karaoke mode from standalone page into FullscreenPlayer dropdown menu with 0-100% vocal reduction slider
- **Voice Search**: Added microphone icon to TopBar search field with Web Speech API integration for hands-free search (de-DE)
- **Referral System**: Fixed code generation to use SV-XXXXXX format (6-digit numbers only), in-memory storage with Map-based persistence
- Enhanced Audio Settings: 5-band custom equalizer (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz), Crossfade slider (0-12s), Mono Audio toggle
- Extended Subscription System: Monthly/Yearly billing toggle with 17% discount on annual plans

## User Preferences
Not specified. The agent should infer preferences from the project description.

## System Architecture

### UI/UX Decisions
- **Color Scheme**: Exact Spotify dark mode colors (`#121212`, `#181818`, `#242424`, `#2a2a2a`, `#1DB954` for accent, `FFFFFF` for primary text, `#B3B3B3` for secondary text).
- **Layout**: Pixel-exact dimensions for Sidebar (241px), TopBar (64px), Player Bar (90px), and Content Cards (200x200px, 16px border-radius).
- **Glassmorphism**: Applied to all Cards, Header, Player, and Sidebar with 20px backdrop-blur, 180% saturation, 6% white overlay, 1px border (8% white opacity), 16px border-radius, and a specific drop shadow (`0 8px 32px rgba(0,0,0,0.37)`).
- **Typography**: Circular Std font (via cdnfonts.com) with Helvetica Neue fallback, specific sizes for headings (32px, 24px), body (16px), secondary (14px), and metadata (12px).
- **Icons**: Phosphor Icons (bold, 24px).
- **Responsiveness**: Fully responsive mobile design with bottom navigation, optimized card sizes (132x132px), and touch-optimized controls.
- **Animations & Transitions**: Smooth page transitions, hover effects (scale, transform), image zoom on hover, staggered animations for lists, and custom easing curves (`cubic-bezier(0.4, 0, 0.2, 1)`).
- **Fullscreen Player**: Dynamically extracts colors from album covers for animated background gradients and beat pulsation effects using the Canvas API and `requestAnimationFrame`.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Tailwind CSS (custom design system), Wouter for routing, Zustand for state management, TanStack Query for data fetching.
- **Backend**: Express.js with in-memory storage (upgradeable to PostgreSQL).
- **Performance**: `React.memo` for key components, lazy loading and `decoding="async"` for images, `requestAnimationFrame` for animations (60 FPS), `will-change` for GPU acceleration, touch optimizations.
- **Subscription System**: 3-tier model (Plus €4.99, Premium €9.99, Family €14.99) with feature access control, pricing page, upgrade/downgrade flows, and coupon integration.
- **Admin Dashboard**: Secure authentication (bcrypt, session-token), management for releases, artist registration, streaming services, coupons, and lyrics.
- **Live Music Rooms**: WebSocket (ws package) for real-time synchronized playback, live chat, participant display (Family tier exclusive).
- **Offline Downloads**: Download tracking with storage quota management and file size monitoring.
- **Custom Radio Stations**: User-created stations from seed tracks/artists/albums with play count tracking.
- **Car Mode**: Fullscreen driver-friendly interface with oversized controls and real-time clock.
- **Voice Commands**: Speech Recognition API integration for hands-free music control (German + English).

### Feature Specifications

**Core UI & Design (8 pages):**
- Pixel-perfect Spotify UI with Glassmorphism effects
- German UI throughout
- Fully responsive mobile design
- Performance-optimized (React.memo, lazy loading, 60 FPS animations)
- Smooth transitions and animations

**Player & Playback:**
- Full controls (play, pause, shuffle, repeat, volume)
- Queue management with visual display
- Progress bar with seek functionality
- Current time/duration display
- Fullscreen player with dynamic album art color extraction
- Beat pulsation effects using Canvas API

**YouTube Music Integration (Primary Playback):**
- YouTube Data API v3 for video search and metadata (100M+ songs)
- Intelligent quota management system (10k/day limit protection)
- Atomic quota reservation prevents race conditions
- Pre-charging ensures quota alignment with YouTube billing
- YouTube IFrame Player API for embedded playback
- Custom player controls (play/pause, volume, seek, mute)
- Automatic ad monetization (revenue-generating)
- Track matching: Artist + Title → YouTube video
- Live quota status display with 30-second refresh
- Warning system when >90% quota used
- Rate limiting: 30 requests/minute per IP (increased for concurrent loads)
- **Seamless UX Integration**: YouTube videos appear in main search results and home page "Neue Musikvideos" section
- **Error Handling**: User-friendly 429 rate limit messages displayed in glass cards
- **Player Store Integration**: currentVideoId field tracks YouTube playback state
- **Hidden Navigation**: Dedicated YouTube Music page (/youtube) still accessible but removed from sidebar

**Spotify Integration (Metadata Only):**
- Search, playlists, and recommendations
- No Premium subscription required
- Metadata import for track information

**Apple Music Integration:**
- MusicKit Catalog for live data (100M songs)
- Search across all content types
- Album, Playlist, Artist detail pages
- Radio Stations integration
- Apple Music authentication
- Timed lyrics overlay with word-by-word sync

**Subscription Management (3-Tier Model):**
- Plus (€4.99/month): Basic features
- Premium (€9.99/month): Advanced features
- Family (€14.99/month): All features + Live Music Rooms
- Backend API routes for subscription management
- Feature access control based on tier
- Pricing page with upgrade/downgrade flows
- Coupon integration with validation
- Payment options: Stripe Checkout + PayPal (optional)

**Admin Dashboard:**
- Secure authentication (bcrypt + session tokens)
- Release management (status, ISRC, UPC, Catalog ID)
- Artist registration link generation
- Streaming service management
- CRUD operations for discount coupons
- Lyrics management
- User management

**TIER 2 Features - Gamification & Advanced:**
- **Leaderboards**: Global, Weekly, Friends leaderboards with listening stats
- **Music Quizzes**: Interactive quizzes with scoring
- **Dashboard**: Personal stats and achievements
- **AI Playlists**: Mood-based intelligent playlist generation
- **Offline Downloads**: Track downloads with storage quota tracking (NEW)
- **Custom Radio Stations**: User-created stations from songs/artists/albums (NEW)

**TIER 3 Features - Smart Home:**
- **Alarms**: Music-based wake-up alarms
- **Sleep Timer**: Auto-stop playback timer

**TIER 3 Features - Social:**
- **Friends System**: Friend requests, acceptance, activity feeds
- **Live Music Rooms**: WebSocket-based synchronized playback with live chat (Family tier exclusive)

**TIER 3 Features - Creator Tools:**
- **Artist Portal**: Release analytics, streaming stats, profile editing
- **Artist Registration**: Unique registration links for artist onboarding

**TIER 3 Features - Bonus:**
- **Audio Settings**: Advanced audio controls in Account page (5-band EQ, crossfade 0-12s, mono audio, gapless, normalization)
- **Karaoke Mode**: Integrated into FullscreenPlayer dropdown with vocal reduction slider (0-100%)
- **Rewards**: Gift cards and referral program with SV-XXXXXX code generation
- **Car Mode**: Fullscreen driver-friendly UI with large controls
- **Voice Search**: Microphone button in TopBar using Web Speech API (de-DE) for hands-free search

## External Dependencies
- **YouTube Data API v3**: Primary music playback system with quota management (10k/day). Requires `YOUTUBE_API_KEY`.
- **YouTube IFrame Player API**: Embedded player for music streaming with automatic ad monetization.
- **Spotify Web API**: Metadata-only integration for playlists, search, and recommendations. Requires `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
- **Apple MusicKit JS v3**: Loaded via CDN for Apple Music integration. Requires `VITE_MK_DEV_TOKEN`.
- **Tailwind CSS**: For styling and custom design system.
- **Wouter**: For client-side routing.
- **Phosphor Icons**: For UI iconography.
- **Zustand**: For global state management.
- **TanStack Query**: For data fetching and caching.
- **Express.js**: For the backend server.
- **ws package**: For WebSocket communication in Live Music Rooms.
- **bcrypt**: For password hashing in the Admin Dashboard.
- **Stripe Checkout**: For credit card payments. Requires `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY`.
- **PayPal SDK**: Optional integration for PayPal payments. Requires `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
- **cdnfonts.com**: To load Circular Std font.