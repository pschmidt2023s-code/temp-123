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
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { 
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { 
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server/esm/deps';
import multer from "multer";
import path from "path";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

// Configure multer for file uploads
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/covers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilddateien (JPEG, PNG, WebP) sind erlaubt'));
    }
  }
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/wav', 'audio/x-wav', 'audio/wave'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.wav')) {
      cb(null, true);
    } else {
      cb(new Error('Nur WAV-Audiodateien sind erlaubt'));
    }
  }
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
  
  // Public Releases Route (for published releases)
  app.get('/api/releases', async (req, res) => {
    try {
      const status = req.query.status as string || 'published';
      const releases = await storage.getPublishedReleases(status);
      res.json(releases);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

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

  // Stripe Checkout Session for Subscriptions
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { tier, userId, isUpgrade } = req.body;
      
      if (!tier || !userId) {
        return res.status(400).json({ error: 'Tier and userId required' });
      }

      // Get price ID based on tier
      const priceIdMap: Record<string, string | undefined> = {
        plus: process.env.STRIPE_PRICE_ID_PLUS,
        premium: process.env.STRIPE_PRICE_ID_PREMIUM,
        family: process.env.STRIPE_PRICE_ID_FAMILY,
      };

      const priceId = priceIdMap[tier];
      if (!priceId) {
        return res.status(400).json({ error: 'Invalid tier or missing price ID' });
      }

      // Get or create user
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({ username: userId });
      }

      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId },
        });
        customerId = customer.id;
        user = await storage.updateUser(userId, { stripeCustomerId: customerId }) || user;
      }

      // If upgrading existing subscription
      if (isUpgrade && user.stripeSubscriptionId) {
        try {
          // Get current subscription from storage
          const currentSubscription = await storage.getUserSubscription(userId);
          if (!currentSubscription) {
            throw new Error('No active subscription found in storage');
          }

          // Get current subscription from Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          // Update subscription with new price (proration enabled by default)
          const updatedSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
            items: [{
              id: stripeSubscription.items.data[0].id,
              price: priceId,
            }],
            proration_behavior: 'create_prorations', // Charge/credit difference immediately
            metadata: {
              userId,
              tier,
            },
          });

          // Update subscription tier in storage using subscription ID
          await storage.updateSubscription(currentSubscription.id, { 
            tier,
            status: 'active',
          });

          // Return success without redirect (subscription updated directly)
          return res.json({ 
            success: true, 
            message: 'Subscription upgraded successfully',
            subscriptionId: updatedSubscription.id 
          });
        } catch (upgradeError: any) {
          console.error('Subscription upgrade error:', upgradeError);
          // If upgrade fails, fall through to create new checkout session
        }
      }

      // Create Stripe Checkout Session for new subscriptions
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin || 'http://localhost:5000'}?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/pricing?canceled=true`,
        metadata: {
          userId,
          tier,
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout session error:', error);
      res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
  });

  // Stripe Webhook for handling subscription events
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('No signature');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const { userId, tier } = session.metadata || {};
          
          if (userId && tier) {
            // Check if subscription already exists
            const existing = await storage.getUserSubscription(userId);
            
            if (existing) {
              // Update existing subscription
              await storage.updateSubscription(existing.id, {
                tier,
                status: 'active',
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
              });
            } else {
              // Create new subscription
              await storage.createSubscription({
                userId,
                tier,
                status: 'active',
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
              });
            }

            // Update user's Stripe subscription ID if available
            if (session.subscription) {
              await storage.updateUser(userId, {
                stripeSubscriptionId: session.subscription as string,
              });
            }
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            const userSub = await storage.getUserSubscription(userId);
            if (userSub) {
              await storage.updateSubscription(userSub.id, {
                status: subscription.status === 'active' ? 'active' : 'cancelled',
              });
            }
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // User Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        passwordHash,
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        return res.json({
          requiresTwoFactor: true,
          userId: user.id,
        });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        requiresTwoFactor: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2FA verify code (TOTP or backup code)
  app.post('/api/auth/verify-2fa', async (req, res) => {
    try {
      const { userId, token } = req.body;
      
      if (!userId || !token) {
        return res.status(400).json({ error: 'User ID and token required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(401).json({ error: 'Invalid request' });
      }

      let isValid = false;

      // Check if it's a TOTP code (6 digits)
      if (/^\d{6}$/.test(token)) {
        isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token,
          window: 2,
        });
      }
      // Check if it's a backup code (8 alphanumeric)
      else if (user.backupCodes && user.backupCodes.length > 0) {
        const normalizedToken = token.toUpperCase().replace(/\s/g, '');
        const codeIndex = user.backupCodes.indexOf(normalizedToken);
        
        if (codeIndex !== -1) {
          isValid = true;
          // Remove used backup code
          const updatedCodes = [...user.backupCodes];
          updatedCodes.splice(codeIndex, 1);
          await storage.updateUser(user.id, { backupCodes: updatedCodes });
        }
      }

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid code' });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2FA setup - generate secret
  app.post('/api/auth/2fa/setup', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const secret = speakeasy.generateSecret({
        name: `GlassBeats (${user.username})`,
        length: 32,
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        randomBytes(4).toString('hex').toUpperCase()
      );

      // Temporarily store secret (not enabled yet)
      await storage.updateUser(userId, { 
        twoFactorSecret: secret.base32,
        backupCodes,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      res.json({
        secret: secret.base32,
        qrCode,
        backupCodes,
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2FA enable - verify and activate
  app.post('/api/auth/2fa/enable', async (req, res) => {
    try {
      const { userId, token } = req.body;
      
      if (!userId || !token) {
        return res.status(400).json({ error: 'User ID and token required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: 'Setup 2FA first' });
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid code' });
      }

      await storage.updateUser(userId, { twoFactorEnabled: true });

      res.json({ success: true });
    } catch (error) {
      console.error('2FA enable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2FA disable
  app.post('/api/auth/2fa/disable', async (req, res) => {
    try {
      const { userId, password } = req.body;
      
      if (!userId || !password) {
        return res.status(400).json({ error: 'User ID and password required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      await storage.updateUser(userId, { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // WebAuthn - Generate registration options
  app.post('/api/auth/webauthn/register-options', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingCredentials = await storage.getWebAuthnCredentialsByUser(userId);

      const options = await generateRegistrationOptions({
        rpName: 'GlassBeats',
        rpID: new URL(process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000').hostname,
        userID: user.id,
        userName: user.username,
        userDisplayName: user.username,
        attestationType: 'none',
        excludeCredentials: existingCredentials.map(cred => ({
          id: Buffer.from(cred.credentialId, 'base64'),
          type: 'public-key',
          transports: cred.transports as any,
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      res.json(options);
    } catch (error) {
      console.error('WebAuthn registration options error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // WebAuthn - Verify registration
  app.post('/api/auth/webauthn/register-verify', async (req, res) => {
    try {
      const { userId, response, deviceName } = req.body;
      
      if (!userId || !response) {
        return res.status(400).json({ error: 'User ID and response required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const verification = await verifyRegistrationResponse({
        response: response as RegistrationResponseJSON,
        expectedChallenge: response.challenge || '',
        expectedOrigin: process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000',
        expectedRPID: new URL(process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000').hostname,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return res.status(400).json({ error: 'Verification failed' });
      }

      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      await storage.createWebAuthnCredential({
        id: randomBytes(16).toString('hex'),
        userId: user.id,
        credentialId: Buffer.from(credentialID).toString('base64'),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
        counter,
        deviceName: deviceName || 'Unknown Device',
        transports: response.response?.transports || [],
      });

      res.json({ verified: true });
    } catch (error) {
      console.error('WebAuthn registration verify error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // WebAuthn - Generate authentication options
  app.post('/api/auth/webauthn/login-options', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const credentials = await storage.getWebAuthnCredentialsByUser(user.id);

      if (credentials.length === 0) {
        return res.status(400).json({ error: 'No passkeys registered' });
      }

      const options = await generateAuthenticationOptions({
        rpID: new URL(process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000').hostname,
        allowCredentials: credentials.map(cred => ({
          id: Buffer.from(cred.credentialId, 'base64'),
          type: 'public-key',
          transports: cred.transports as any,
        })),
        userVerification: 'preferred',
      });

      res.json({ ...options, userId: user.id });
    } catch (error) {
      console.error('WebAuthn login options error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // WebAuthn - Verify authentication
  app.post('/api/auth/webauthn/login-verify', async (req, res) => {
    try {
      const { userId, response } = req.body;
      
      if (!userId || !response) {
        return res.status(400).json({ error: 'User ID and response required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const credentialId = Buffer.from(response.id, 'base64url').toString('base64');
      const credential = await storage.getWebAuthnCredential(credentialId);

      if (!credential || credential.userId !== userId) {
        return res.status(401).json({ error: 'Invalid credential' });
      }

      const verification = await verifyAuthenticationResponse({
        response: response as AuthenticationResponseJSON,
        expectedChallenge: response.challenge || '',
        expectedOrigin: process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000',
        expectedRPID: new URL(process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000').hostname,
        authenticator: {
          credentialPublicKey: Buffer.from(credential.credentialPublicKey, 'base64'),
          credentialID: Buffer.from(credential.credentialId, 'base64'),
          counter: credential.counter,
        },
      });

      if (!verification.verified) {
        return res.status(401).json({ error: 'Verification failed' });
      }

      // Update counter and last used
      await storage.updateWebAuthnCredential(credential.id, {
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      });

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error('WebAuthn login verify error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user's passkeys
  app.get('/api/auth/webauthn/credentials/:userId', async (req, res) => {
    try {
      const credentials = await storage.getWebAuthnCredentialsByUser(req.params.userId);
      
      // Don't send sensitive data
      const safeCredentials = credentials.map(({ credentialPublicKey, ...cred }) => cred);
      
      res.json(safeCredentials);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete passkey
  app.delete('/api/auth/webauthn/credentials/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteWebAuthnCredential(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      res.json({ success: true });
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

  // Admin User Management Routes (Protected)
  app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send password hashes to client
      const safeUsers = users.map(({ passwordHash, twoFactorSecret, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/users/:id', requireAdminAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Delete user's subscription first
      const subscription = await storage.getUserSubscription(req.params.id);
      if (subscription) {
        await storage.cancelSubscription(subscription.id);
      }
      
      // Delete the user
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }
      
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // File Upload Routes (Protected)
  app.post('/api/admin/upload/cover', requireAdminAuth, uploadCover.single('cover'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
      }
      const filePath = `/uploads/covers/${req.file.filename}`;
      res.json({ success: true, filePath });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Upload fehlgeschlagen' });
    }
  });

  app.post('/api/admin/upload/audio', requireAdminAuth, uploadAudio.single('audio'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
      }
      const filePath = `/uploads/audio/${req.file.filename}`;
      res.json({ success: true, filePath });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Upload fehlgeschlagen' });
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
      console.log('Received release data:', JSON.stringify(req.body, null, 2));
      const result = insertReleaseSchema.safeParse(req.body);
      if (!result.success) {
        console.error('Validation failed:', JSON.stringify(result.error.issues, null, 2));
        return res.status(400).json({ error: 'Invalid release data', details: result.error.issues });
      }
      const release = await storage.createRelease(result.data);
      res.status(201).json(release);
    } catch (error) {
      console.error('Release creation error:', error);
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
