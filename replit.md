# GlassBeats - Pixel-Perfect Spotify Clone mit Apple Music Integration

## Overview
GlassBeats is a pixel-perfect Spotify UI clone with full Apple Music integration, offering access to 100 million songs, Lossless Audio, Dolby Atmos, Gapless Playback, Crossfade, and timed lyrics. It aims to replicate the modern music streaming experience while introducing unique features like "Live Music Rooms" for real-time social listening, offline downloads, custom radio stations, car mode, and voice commands. The project focuses on a high-fidelity user experience, performance optimization, and a robust subscription system, positioning itself as a premium music streaming platform with innovative social interaction capabilities.

**Project Status:** All Tier 2 and Tier 3 features complete (31 pages total). Production-ready with comprehensive gamification, social features, creator tools, smart home integration, and bonus features.

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
- **Audio Settings**: Advanced audio controls (crossfade, gapless, normalization)
- **Karaoke Mode**: Lyrics display with microphone integration
- **Rewards**: Gift cards and referral program
- **Car Mode**: Fullscreen driver-friendly UI with large controls (NEW)
- **Voice Commands**: Speech Recognition API integration for hands-free control (NEW)

## External Dependencies
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