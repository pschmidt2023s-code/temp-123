import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// ========== LISTENING HISTORY ==========

/**
 * Record a listening event
 * POST /api/personalization/listening-history
 */
router.post('/listening-history', async (req, res) => {
  try {
    const schema = z.object({
      userId: z.string(),
      trackId: z.string(),
      trackType: z.enum(['youtube', 'apple_music', 'spotify', 'local']),
      trackTitle: z.string(),
      trackArtist: z.string(),
      trackGenre: z.string().optional(),
      playDurationSeconds: z.number(),
      completedPercentage: z.number().min(0).max(100),
      skipped: z.boolean().default(false),
      source: z.string(),
    });

    const data = schema.parse(req.body);
    const history = await storage.recordListeningHistory(data);
    
    res.json({ success: true, history });
  } catch (error: any) {
    console.error('[Record Listening History Error]:', error);
    res.status(400).json({ error: error.message || 'Failed to record listening history' });
  }
});

/**
 * Get user's listening history
 * GET /api/personalization/listening-history/:userId
 */
router.get('/listening-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const history = await storage.getUserListeningHistory(userId, limit);
    res.json({ history, count: history.length });
  } catch (error: any) {
    console.error('[Get Listening History Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch listening history' });
  }
});

// ========== AD TRACKING ==========

/**
 * Record an ad view
 * POST /api/personalization/ad-view
 */
router.post('/ad-view', async (req, res) => {
  try {
    const schema = z.object({
      userId: z.string(),
      adType: z.enum(['audio', 'video', 'banner']),
      tier: z.string(),
      adDurationSeconds: z.number(),
      skipped: z.boolean().default(false),
      completed: z.boolean().default(false),
    });

    const data = schema.parse(req.body);
    const adView = await storage.recordAdView(data);
    
    res.json({ success: true, adView });
  } catch (error: any) {
    console.error('[Record Ad View Error]:', error);
    res.status(400).json({ error: error.message || 'Failed to record ad view' });
  }
});

/**
 * Check if ad should be shown
 * GET /api/personalization/should-show-ad/:userId
 */
router.get('/should-show-ad/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user subscription
    const subscription = await storage.getUserSubscription(userId);
    const tier = subscription?.tier || 'free';
    
    const shouldShow = await storage.shouldShowAd(userId, tier);
    const stats = await storage.getUserAdStats(userId);
    
    res.json({ 
      shouldShowAd: shouldShow,
      tier,
      stats,
      adDuration: tier === 'free' ? 30 : tier === 'plus' ? 20 : 0, // Free: 30s, Plus: 20s, Premium/Family: 0s
    });
  } catch (error: any) {
    console.error('[Should Show Ad Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to check ad status' });
  }
});

// ========== AI PREFERENCES ==========

/**
 * Get user's AI preferences
 * GET /api/personalization/ai-preferences/:userId
 */
router.get('/ai-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await storage.getUserAiPreferences(userId);
    
    if (!preferences) {
      // Analyze behavior and create preferences
      const analyzed = await storage.analyzeUserBehavior(userId);
      return res.json({ preferences: analyzed, isNew: true });
    }
    
    res.json({ preferences, isNew: false });
  } catch (error: any) {
    console.error('[Get AI Preferences Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch AI preferences' });
  }
});

/**
 * Analyze user behavior and update preferences
 * POST /api/personalization/analyze-behavior/:userId
 */
router.post('/analyze-behavior/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await storage.analyzeUserBehavior(userId);
    
    res.json({ 
      success: true, 
      preferences,
      message: 'Behavior analyzed and preferences updated'
    });
  } catch (error: any) {
    console.error('[Analyze Behavior Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze behavior' });
  }
});

/**
 * Get personalized recommendations
 * GET /api/personalization/recommendations/:userId
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const recommendations = await storage.getPersonalizedRecommendations(userId, limit);
    
    res.json({ recommendations, count: recommendations.length });
  } catch (error: any) {
    console.error('[Get Recommendations Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch recommendations' });
  }
});

export default router;
