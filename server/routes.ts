import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlaylistSchema, insertSubscriptionSchema, SUBSCRIPTION_TIERS } from "@shared/schema";
import { setupWebSocket } from "./rooms";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get('/api/user/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/user/:id/apple-token', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Token required' });
      }
      const user = await storage.updateUserAppleToken(req.params.id, token);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Playlist routes
  app.get('/api/playlists', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      const playlists = await storage.getPlaylistsByUser(userId);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/playlists/:id', async (req, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/playlists', async (req, res) => {
    try {
      const result = insertPlaylistSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid playlist data', details: result.error });
      }
      const playlist = await storage.createPlaylist(result.data);
      res.status(201).json(playlist);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/playlists/:id', async (req, res) => {
    try {
      const playlist = await storage.updatePlaylist(req.params.id, req.body);
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/playlists/:id', async (req, res) => {
    try {
      const deleted = await storage.deletePlaylist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Subscription routes
  app.get('/api/subscription-tiers', async (req, res) => {
    try {
      res.json(SUBSCRIPTION_TIERS);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/subscriptions/user/:userId', async (req, res) => {
    try {
      const subscription = await storage.getUserSubscription(req.params.userId);
      if (!subscription) {
        return res.json({
          tier: 'free',
          status: 'active',
          features: SUBSCRIPTION_TIERS.free.features,
        });
      }
      const tierInfo = SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS];
      res.json({
        ...subscription,
        features: tierInfo?.features || SUBSCRIPTION_TIERS.free.features,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/subscriptions', async (req, res) => {
    try {
      const result = insertSubscriptionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid subscription data', details: result.error });
      }
      
      // Check if user already has active subscription
      const existing = await storage.getUserSubscription(result.data.userId);
      if (existing) {
        return res.status(409).json({ error: 'User already has active subscription' });
      }
      
      const subscription = await storage.createSubscription(result.data);
      const tierInfo = SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS];
      res.status(201).json({
        ...subscription,
        features: tierInfo?.features || SUBSCRIPTION_TIERS.free.features,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/subscriptions/:id', async (req, res) => {
    try {
      const subscription = await storage.updateSubscription(req.params.id, req.body);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      const tierInfo = SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS];
      res.json({
        ...subscription,
        features: tierInfo?.features || SUBSCRIPTION_TIERS.free.features,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/subscriptions/:id/cancel', async (req, res) => {
    try {
      const cancelled = await storage.cancelSubscription(req.params.id);
      if (!cancelled) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      res.json({ success: true, message: 'Subscription cancelled' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for Live Music Rooms
  setupWebSocket(httpServer);

  return httpServer;
}
