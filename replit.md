# GlassBeats - Pixel-Perfect Spotify Clone mit Apple Music Integration

## Overview
GlassBeats is a pixel-perfect Spotify UI clone with full Apple Music integration, offering access to 100 million songs, Lossless Audio, Dolby Atmos, Gapless Playback, Crossfade, and timed lyrics. It aims to replicate the modern music streaming experience while introducing a unique "Live Music Rooms" feature for real-time social listening. The project focuses on a high-fidelity user experience, performance optimization, and a robust subscription system, positioning itself as a premium music streaming platform with innovative social interaction capabilities.

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
- **Subscription System**: 3-tier model (Plus, Premium, Family) with feature access control, pricing page, upgrade/downgrade flows, and coupon integration.
- **Admin Dashboard**: Secure authentication (bcrypt, session-token), management for releases, artist registration, streaming services, and coupons.
- **Live Music Rooms**: Unique feature utilizing WebSocket (ws package) for real-time synchronized playback, live chat, participant display, and feature gating (Family tier only).

### Feature Specifications
- **Core UI & Design**: Pixel-perfect Spotify UI, Glassmorphism, comprehensive navigation (8 pages), German UI, responsive mobile design, performance-optimized, smooth transitions and animations.
- **Player & Playback**: Full controls (play, pause, shuffle, repeat, volume), queue management, progress bar, current time/duration display, fullscreen player with dynamic album art colors and beat pulsation.
- **Apple Music Integration**: MusicKit Catalog for live data across all pages (Home, Search, Album, Playlist, Artist), Radio Stations, Apple Music authentication, timed lyrics overlay, custom MusicKit hooks.
- **Subscription Management**: 3-tier model, backend API routes, feature access control, pricing page, coupon integration, payment options (Stripe Checkout, optional PayPal).
- **Admin Dashboard**: Secure authentication, release management (status, ISRC, UPC, Catalog ID), artist registration links, streaming service management, CRUD for discount coupons.
- **Live Music Rooms**: WebSocket-based real-time sync, room management, synchronized playback, live chat, participant display (Family tier exclusive).

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