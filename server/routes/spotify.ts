import { Router } from 'express';
import { spotifyService } from '../spotify-service';
import { storage } from '../storage';
import type { InsertTrack, InsertPlaylistTrack } from '@shared/schema';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for Spotify API endpoints
const spotifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: { error: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const importPlaylistSchema = z.object({
  spotifyPlaylistId: z.string().min(1, 'Playlist ID ist erforderlich'),
  userId: z.string().min(1, 'User ID ist erforderlich'),
});

const searchQuerySchema = z.object({
  q: z.string().min(2, 'Suchbegriff muss mindestens 2 Zeichen lang sein'),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const recommendationsParamsSchema = z.object({
  userId: z.string().min(1, 'User ID ist erforderlich'),
});

const recommendationsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
});

/**
 * Import playlist from Spotify
 * POST /api/spotify/import-playlist
 */
router.post('/import-playlist', spotifyLimiter, async (req, res) => {
  try {
    // Validate request body
    const validationResult = importPlaylistSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ungültige Anfrage', 
        details: validationResult.error.errors 
      });
    }

    const { spotifyPlaylistId, userId } = validationResult.data;

    if (!spotifyService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Spotify API nicht konfiguriert. Bitte API-Keys in den Umgebungsvariablen hinzufügen.' 
      });
    }

    // Get playlist from Spotify
    const spotifyPlaylist = await spotifyService.getPlaylist(spotifyPlaylistId);
    const spotifyTracks = await spotifyService.getPlaylistTracks(spotifyPlaylistId);

    // Create playlist in our database
    const newPlaylist = await storage.createPlaylist({
      userId,
      name: spotifyPlaylist.name,
      description: spotifyPlaylist.description || undefined,
      coverUrl: spotifyPlaylist.images[0]?.url,
      spotifyPlaylistId: spotifyPlaylist.id,
      isPublic: true,
    });

    // Import tracks
    const trackIds: string[] = [];
    for (let i = 0; i < spotifyTracks.length; i++) {
      const spotifyTrack = spotifyTracks[i];
      const trackData = spotifyService.convertToInternalTrack(spotifyTrack);

      // Check if track already exists by Spotify ID
      let track = await storage.getTrackBySpotifyId(trackData.spotifyId);
      
      if (!track) {
        // Create new track
        track = await storage.createTrack(trackData);
      }

      // Add track to playlist
      await storage.addTrackToPlaylist({
        playlistId: newPlaylist.id,
        trackId: track.id,
        position: i,
      });

      trackIds.push(track.id);
    }

    res.json({
      playlist: newPlaylist,
      trackCount: trackIds.length,
      message: `Playlist "${spotifyPlaylist.name}" mit ${trackIds.length} Tracks importiert`,
    });
  } catch (error: any) {
    console.error('[Spotify Import Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search Spotify tracks
 * GET /api/spotify/search
 */
router.get('/search', spotifyLimiter, async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = searchQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ungültige Suchparameter', 
        details: validationResult.error.errors 
      });
    }

    const { q, limit } = validationResult.data;

    if (!spotifyService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Spotify API nicht konfiguriert' 
      });
    }

    const tracks = await spotifyService.searchTracks(q, limit);
    const convertedTracks = tracks.map(t => spotifyService.convertToInternalTrack(t));

    res.json({ tracks: convertedTracks });
  } catch (error: any) {
    console.error('[Spotify Search Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get AI recommendations based on user's listening history
 * GET /api/spotify/recommendations/:userId
 */
router.get('/recommendations/:userId', spotifyLimiter, async (req, res) => {
  try {
    // Validate params
    const paramsResult = recommendationsParamsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({ 
        error: 'Ungültige User ID', 
        details: paramsResult.error.errors 
      });
    }

    // Validate query
    const queryResult = recommendationsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ 
        error: 'Ungültige Query-Parameter', 
        details: queryResult.error.errors 
      });
    }

    const { userId } = paramsResult.data;
    const { limit } = queryResult.data;

    if (!spotifyService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Spotify API nicht konfiguriert' 
      });
    }

    // Get user's recent tracks
    const userPlaylists = await storage.getUserPlaylists(userId);
    const allTrackIds: string[] = [];

    for (const playlist of userPlaylists.slice(0, 3)) {
      const tracks = await storage.getPlaylistTracks(playlist.id);
      allTrackIds.push(...tracks.map(t => t.id));
    }

    if (allTrackIds.length === 0) {
      return res.json({ tracks: [], message: 'Keine Hörhistorie gefunden' });
    }

    // Get random tracks as seeds
    const seedTracks = await Promise.all(
      allTrackIds
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(async (id) => {
          const track = await storage.getTrack(id);
          return track?.spotifyId;
        })
    );

    const validSeeds = seedTracks.filter(Boolean) as string[];

    if (validSeeds.length === 0) {
      return res.json({ tracks: [], message: 'Keine Spotify-Tracks in der Historie' });
    }

    // Get recommendations from Spotify
    const recommendations = await spotifyService.getRecommendations(
      validSeeds,
      limit
    );

    const convertedTracks = recommendations.map(t => 
      spotifyService.convertToInternalTrack(t)
    );

    res.json({ 
      tracks: convertedTracks,
      message: `${convertedTracks.length} personalisierte Empfehlungen basierend auf deiner Hörhistorie`,
    });
  } catch (error: any) {
    console.error('[Spotify Recommendations Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check if Spotify is configured
 * GET /api/spotify/status
 */
router.get('/status', (req, res) => {
  res.json({
    configured: spotifyService.isConfigured(),
    message: spotifyService.isConfigured() 
      ? 'Spotify API aktiv' 
      : 'Spotify API-Keys fehlen',
  });
});

export default router;
