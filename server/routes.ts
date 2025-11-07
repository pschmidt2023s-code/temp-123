import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlaylistSchema, 
  insertSubscriptionSchema, 
  insertReleaseSchema,
  insertArtistRegistrationLinkSchema,
  insertStreamingServiceSchema,
  SUBSCRIPTION_TIERS 
} from "@shared/schema";
import { setupWebSocket } from "./rooms";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

// Admin authentication middleware
async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const isValid = await storage.validateAdminSession(token);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  next();
}

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

  // Admin Authentication Routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        return res.status(500).json({ error: 'Admin credentials not configured' });
      }

      if (username !== adminUsername) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Support both hashed and plaintext passwords for flexibility
      let isPasswordValid = false;
      if (adminPassword.startsWith('$2b$') || adminPassword.startsWith('$2a$')) {
        // Password is already hashed
        isPasswordValid = await bcrypt.compare(password, adminPassword);
      } else {
        // Password is plaintext (less secure but simpler for demo)
        isPasswordValid = password === adminPassword;
      }

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const sessionToken = randomBytes(32).toString('hex');
      
      // Store session in server
      await storage.createAdminSession(sessionToken, adminUsername);
      
      res.json({ 
        success: true, 
        token: sessionToken,
        username: adminUsername 
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin logout route
  app.post('/api/admin/logout', requireAdminAuth, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.substring(7);
        await storage.invalidateAdminSession(token);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Release Management Routes (Protected)
  app.get('/api/admin/releases', requireAdminAuth, async (req, res) => {
    try {
      const releases = await storage.getAllReleases();
      res.json(releases);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/releases/:id', requireAdminAuth, async (req, res) => {
    try {
      const release = await storage.getRelease(req.params.id);
      if (!release) {
        return res.status(404).json({ error: 'Release not found' });
      }
      res.json(release);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/releases', requireAdminAuth, async (req, res) => {
    try {
      const result = insertReleaseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid release data', details: result.error });
      }
      const release = await storage.createRelease(result.data);
      res.status(201).json(release);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/releases/:id', requireAdminAuth, async (req, res) => {
    try {
      const release = await storage.updateRelease(req.params.id, req.body);
      if (!release) {
        return res.status(404).json({ error: 'Release not found' });
      }
      res.json(release);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/releases/:id', requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteRelease(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Release not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Artist Registration Link Routes (Protected)
  app.get('/api/admin/artist-links', requireAdminAuth, async (req, res) => {
    try {
      const links = await storage.getAllArtistLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/artist-links', requireAdminAuth, async (req, res) => {
    try {
      const linkCode = randomBytes(16).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
      
      const result = insertArtistRegistrationLinkSchema.safeParse({
        ...req.body,
        linkCode,
        expiresAt,
        isUsed: false,
      });
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid link data', details: result.error });
      }
      
      const link = await storage.createArtistLink(result.data);
      res.status(201).json(link);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/artist-register/:code', async (req, res) => {
    try {
      const link = await storage.getArtistLinkByCode(req.params.code);
      if (!link) {
        return res.status(404).json({ error: 'Invalid registration link' });
      }
      
      if (link.isUsed) {
        return res.status(410).json({ error: 'Registration link already used' });
      }
      
      if (new Date() > link.expiresAt) {
        return res.status(410).json({ error: 'Registration link expired' });
      }
      
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/artist-register/:code/use', async (req, res) => {
    try {
      const link = await storage.getArtistLinkByCode(req.params.code);
      if (!link) {
        return res.status(404).json({ error: 'Invalid registration link' });
      }
      
      await storage.markArtistLinkUsed(link.id);
      res.json({ success: true, message: 'Registration completed' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/artist-links/:id', requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteArtistLink(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Link not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Streaming Service Management Routes (Protected)
  app.get('/api/admin/services', requireAdminAuth, async (req, res) => {
    try {
      const services = await storage.getAllStreamingServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/services', requireAdminAuth, async (req, res) => {
    try {
      const result = insertStreamingServiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid service data', details: result.error });
      }
      const service = await storage.createStreamingService(result.data);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/admin/services/:id', requireAdminAuth, async (req, res) => {
    try {
      const service = await storage.updateStreamingService(req.params.id, req.body);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/services/:id', requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteStreamingService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for Live Music Rooms
  setupWebSocket(httpServer);

  return httpServer;
}
