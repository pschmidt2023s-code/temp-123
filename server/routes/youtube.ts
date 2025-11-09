import { Router } from 'express';
import { youtubeService } from '../youtube-service';
import { youtubeQuota } from '../youtube-quota';
import { storage } from '../storage';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for YouTube API endpoints
// Limit: 30 search requests per minute per IP (search costs 100 units)
// More lenient to allow concurrent page loads and searches
// Global quota manager enforces the real 10k/day limit
const youtubeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: { error: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().min(2, 'Suchbegriff muss mindestens 2 Zeichen lang sein'),
  maxResults: z.coerce.number().min(1).max(50).default(10),
});

const findTrackSchema = z.object({
  artist: z.string().min(1, 'Artist ist erforderlich'),
  title: z.string().min(1, 'Titel ist erforderlich'),
});

const videoIdSchema = z.object({
  videoId: z.string().min(1, 'Video ID ist erforderlich'),
});

/**
 * Search YouTube for music videos
 * GET /api/youtube/search
 */
router.get('/search', youtubeLimiter, async (req, res) => {
  try {
    const validationResult = searchQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ungültige Suchparameter', 
        details: validationResult.error.errors 
      });
    }

    const { q, maxResults } = validationResult.data;

    if (!youtubeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'YouTube API nicht konfiguriert. Bitte API-Key in den Umgebungsvariablen hinzufügen.' 
      });
    }

    // Reserve quota atomically before making request
    if (!youtubeQuota.reserveQuota('search')) {
      const stats = youtubeQuota.getUsageStats();
      return res.status(429).json({ 
        error: 'YouTube API Quota erschöpft für heute',
        quota: stats,
        message: `Tägliches Limit erreicht. Versuche es morgen wieder (${stats.unitsUsed}/${stats.dailyQuota} Units verwendet).`
      });
    }

    // Quota is now reserved - proceed with API call
    // Note: Quota is charged even if this fails (aligns with YouTube's accounting)
    const results = await youtubeService.searchVideos(q, maxResults);

    res.json({ 
      videos: results,
      count: results.length,
      quota: youtubeQuota.getUsageStats(),
    });
  } catch (error: any) {
    console.error('[YouTube Search Error]:', error);
    res.status(500).json({ error: error.message || 'Suche fehlgeschlagen' });
  }
});

/**
 * Find YouTube video for a specific track (artist + title)
 * POST /api/youtube/find-track
 */
router.post('/find-track', youtubeLimiter, async (req, res) => {
  try {
    const validationResult = findTrackSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ungültige Anfrage', 
        details: validationResult.error.errors 
      });
    }

    const { artist, title } = validationResult.data;

    if (!youtubeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'YouTube API nicht konfiguriert' 
      });
    }

    // Reserve quota atomically before making request
    if (!youtubeQuota.reserveQuota('search')) {
      const stats = youtubeQuota.getUsageStats();
      return res.status(429).json({ 
        error: 'YouTube API Quota erschöpft für heute',
        quota: stats,
      });
    }

    // Quota is now reserved - proceed with API call
    const video = await youtubeService.findTrack(artist, title);

    if (!video) {
      return res.json({ 
        found: false,
        message: `Kein Video gefunden für "${artist} - ${title}"`,
        quota: youtubeQuota.getUsageStats(),
      });
    }

    res.json({ 
      found: true,
      video,
      quota: youtubeQuota.getUsageStats(),
    });
  } catch (error: any) {
    console.error('[YouTube Find Track Error]:', error);
    res.status(500).json({ error: error.message || 'Track konnte nicht gefunden werden' });
  }
});

/**
 * Get detailed video information
 * GET /api/youtube/video/:videoId
 */
router.get('/video/:videoId', youtubeLimiter, async (req, res) => {
  try {
    const validationResult = videoIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Ungültige Video ID', 
        details: validationResult.error.errors 
      });
    }

    const { videoId } = validationResult.data;

    if (!youtubeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'YouTube API nicht konfiguriert' 
      });
    }

    // Reserve quota atomically before making request
    if (!youtubeQuota.reserveQuota('videoDetails')) {
      const stats = youtubeQuota.getUsageStats();
      return res.status(429).json({ 
        error: 'YouTube API Quota erschöpft für heute',
        quota: stats,
      });
    }

    // Quota is now reserved - proceed with API call
    const video = await youtubeService.getVideoDetails(videoId);

    res.json({ 
      video,
      durationSeconds: youtubeService.parseDuration(video.duration),
      quota: youtubeQuota.getUsageStats(),
    });
  } catch (error: any) {
    console.error('[YouTube Video Details Error]:', error);
    res.status(500).json({ error: error.message || 'Video-Details konnten nicht geladen werden' });
  }
});

/**
 * Match Spotify track to YouTube video and update database
 * POST /api/youtube/match-track/:trackId
 */
router.post('/match-track/:trackId', youtubeLimiter, async (req, res) => {
  try {
    const { trackId } = req.params;

    if (!trackId) {
      return res.status(400).json({ error: 'Track ID ist erforderlich' });
    }

    if (!youtubeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'YouTube API nicht konfiguriert' 
      });
    }

    // Get track from database
    const track = await storage.getTrack(trackId);

    if (!track) {
      return res.status(404).json({ error: 'Track nicht gefunden' });
    }

    // Reserve quota atomically before making request
    if (!youtubeQuota.reserveQuota('search')) {
      const stats = youtubeQuota.getUsageStats();
      return res.status(429).json({ 
        error: 'YouTube API Quota erschöpft für heute',
        quota: stats,
      });
    }

    // Quota is now reserved - proceed with API call
    const youtubeVideo = await youtubeService.findTrack(track.artist, track.title);

    if (!youtubeVideo) {
      return res.json({ 
        matched: false,
        message: `Kein YouTube Video gefunden für "${track.artist} - ${track.title}"`,
        quota: youtubeQuota.getUsageStats(),
      });
    }

    // Update track with YouTube video ID
    // Note: We need to add youtubeVideoId column to tracks table
    // For now, just return the match
    res.json({ 
      matched: true,
      track: {
        id: track.id,
        artist: track.artist,
        title: track.title,
      },
      youtube: youtubeVideo,
      message: `Match gefunden: ${youtubeVideo.title}`,
      quota: youtubeQuota.getUsageStats(),
    });
  } catch (error: any) {
    console.error('[YouTube Match Track Error]:', error);
    res.status(500).json({ error: error.message || 'Track-Matching fehlgeschlagen' });
  }
});

/**
 * Check if YouTube is configured and get quota usage
 * GET /api/youtube/status
 */
router.get('/status', (req, res) => {
  const configured = youtubeService.isConfigured();
  const quota = youtubeQuota.getUsageStats();
  
  res.json({
    configured,
    message: configured 
      ? 'YouTube API aktiv' 
      : 'YouTube API-Key fehlt',
    quota: configured ? quota : undefined,
    searchesRemaining: configured ? youtubeQuota.getEstimatedSearchesRemaining() : 0,
  });
});

export default router;
