# Design Guidelines: Spotify Clone mit Apple Music Integration

## Design Approach
**Reference-Based Design**: Pixel-perfect Spotify clone with exact visual replication of Spotify's interface, enhanced with glassmorphism effects throughout.

## Color Palette (Exact Spotify Colors)
- **Background**: #121212
- **Surface Level 1**: #181818
- **Surface Level 2**: #242424
- **Hover State**: #2a2a2a
- **Accent/Primary**: #1DB954 (Spotify Green)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #B3B3B3
- **Divider**: #282828

**Note**: Dark mode only - no light mode toggle.

## Typography
- **Font Family**: "Circular" (via fonts.cdn), fallback to "Helvetica Neue", sans-serif
- **Font Sizes**: 32px (headings), 24px (subheadings), 16px (body), 14px (secondary text), 12px (metadata)
- **Line Heights**: 24px for navigation items, proportional for content

## Layout System & Measurements

### Fixed Dimensions (Critical - Must Be Exact)
- **Left Sidebar**: 241px fixed width, 8px padding, dark background (#181818)
- **Top Bar**: 64px height, 32px horizontal padding
- **Now Playing Bar**: 90px height, fixed to bottom
- **Content Cards**: 200×200px album covers, 16px border radius, 12px drop shadow
- **Spacing Units**: Use 8px, 16px, 24px, 32px grid system

### Glassmorphism Treatment (Applied Everywhere)
All cards, headers, player, and sidebar receive glassmorphism effect:
- **Backdrop Blur**: 20px blur with 180% saturation
- **Background**: White overlay at 6% opacity (rgba(255,255,255,0.06))
- **Border**: 1px solid white at 8% opacity
- **Border Radius**: 16px on glass elements
- **Shadow**: 0 8px 32px rgba(0,0,0,0.37) + inset highlight at 5% white opacity

## Component Specifications

### Sidebar (241px Fixed)
- Navigation items with icons + labels
- Library section with create/add buttons
- Playlists list with scroll
- German labels: "Start", "Suchen", "Deine Bibliothek"

### Top Bar (64px)
- Search field with category chips
- Navigation arrows (back/forward)
- User menu with profile picture
- Glass background with blur

### Now Playing Bar (90px Bottom Fixed)
- Left: Current track info (64×64px cover, title, artist)
- Center: Playback controls (previous, play/pause, next, shuffle, repeat)
- Progress bar with time stamps
- Right: Volume slider, lyrics button, queue, cast icons
- All controls use Phosphor Icons "bold" variant, 24px

### Content Cards (200×200px)
- Album/playlist artwork fills card
- 16px border radius
- 12px drop shadow
- Title and subtitle below cover
- Floating play button on hover (bottom-right, 48px green circle)

### Track Rows
- Columns: # | Cover (40×40px) | Title + Artist | Album | Date Added | Duration | Heart Icon
- Hover state: #2a2a2a background
- Active/playing: #1DB954 accent color on text

## Hover & Interaction States

### Card Hover
- Apply 20% black overlay on cover
- Lift card 4px upward
- Increase shadow intensity by 20%
- Show play button with scale animation
- All transitions: 200ms ease

### Button Hover
- Brightness increase on green buttons
- Scale 1.05 on play buttons
- Opacity change on secondary buttons

## Icons
- **Library**: Phosphor Icons "bold" weight, 24px size
- **Exact Glyphs**: home, magnifying-glass, books, plus, heart, play, pause, skip-back, skip-forward, shuffle, repeat, speaker-high, queue, quotes, cast-screen
- Green accent (#1DB954) for active states
- White/gray for inactive states

## Page Layouts

### Home Page
- Hero section: "Für dich" personalized mixes
- Horizontal scrolling carousels for: Recent plays, Recommended albums, New releases, Made for you
- Each carousel: 6-8 cards visible, smooth scroll
- Section headings: 24px Circular

### Search Page
- Large search field at top (full width minus sidebar)
- Category chips below (Browse All: Pop, Rock, Hip-Hop, etc.)
- Grid layout: 4 columns of category cards on desktop
- Each category: gradient background, title, 200×200px

### Album/Playlist View
- Large cover image: 232×232px top-left
- Metadata: Title (48px), Artist, Year, Track count, Duration
- Action buttons: Play (green), Heart, More options
- Track table below with alternating row hover states

### Artist View
- Hero banner with artist image (full width, 340px height)
- Popular tracks section (top 5)
- Discography grid
- Similar artists carousel

## Special Features UI

### Lyrics Overlay
- Full-screen modal over player
- Large typography (32px) for current line
- Word-by-word highlighting in sync
- Scrolling lyric sheet
- Semi-transparent dark background (#121212 at 95%)

### Upload Button
- "Datei hochladen" in library section
- Opens file picker for audio files
- Progress indicator during upload
- Appears in library after successful upload

## Language
**Complete German UI** - All labels, buttons, and text in German:
- "Start" (Home)
- "Suchen" (Search)
- "Deine Bibliothek" (Library)
- "Deine Lieblingssongs" (Liked Songs)
- "Neue Playlist" (Create Playlist)
- "Songtexte" (Lyrics)
- "Warteschlange" (Queue)

## Responsive Behavior
- Sidebar collapses to icons-only on tablet (< 1024px)
- Cards adjust to 2 columns on tablet, 1 column on mobile
- Player controls stack vertically on mobile
- Hide secondary metadata on small screens
- Maintain fixed dimensions for desktop (1280px+)

## Images
No hero images required - this is a music streaming interface focused on album artwork and content cards. All imagery comes from album covers, artist photos, and playlist artwork loaded dynamically from Apple Music catalog.