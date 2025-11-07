import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email"),
  appleToken: text("apple_token"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  isPublic: boolean("is_public").default(true),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  tier: text("tier").notNull(), // 'free', 'plus', 'premium', 'family'
  status: text("status").notNull().default('active'), // 'active', 'cancelled', 'expired', 'pending'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default('admin'), // 'admin', 'super_admin'
  createdAt: timestamp("created_at").defaultNow(),
});

export const releases = pgTable("releases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artistName: text("artist_name").notNull(),
  releaseDate: timestamp("release_date").notNull(),
  coverUrl: text("cover_url"),
  trackCount: integer("track_count").default(0),
  catalogId: text("catalog_id"), // Apple Music Catalog ID
  isrc: text("isrc"), // International Standard Recording Code
  upc: text("upc"), // Universal Product Code
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'published', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const artistRegistrationLinks = pgTable("artist_registration_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  linkCode: text("link_code").notNull().unique(),
  artistName: text("artist_name"),
  email: text("email"),
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streamingServices = pgTable("streaming_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default('active'), // 'active', 'maintenance', 'disabled'
  apiEndpoint: text("api_endpoint"),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  startDate: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export const insertReleaseSchema = createInsertSchema(releases).omit({
  id: true,
  createdAt: true,
});

export const insertArtistRegistrationLinkSchema = createInsertSchema(artistRegistrationLinks).omit({
  id: true,
  createdAt: true,
});

export const insertStreamingServiceSchema = createInsertSchema(streamingServices).omit({
  id: true,
  createdAt: true,
  lastChecked: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releases.$inferSelect;
export type InsertArtistRegistrationLink = z.infer<typeof insertArtistRegistrationLinkSchema>;
export type ArtistRegistrationLink = typeof artistRegistrationLinks.$inferSelect;
export type InsertStreamingService = z.infer<typeof insertStreamingServiceSchema>;
export type StreamingService = typeof streamingServices.$inferSelect;

export type SubscriptionTier = 'free' | 'plus' | 'premium' | 'family';

export interface SubscriptionFeatures {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: {
    adFree: boolean;
    offlineDownloads: boolean;
    dolbyAtmos: boolean;
    losslessAudio: boolean;
    unlimitedSkips: boolean;
    liveRooms: boolean;
    maxAccounts: number;
  };
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    features: {
      adFree: false,
      offlineDownloads: false,
      dolbyAtmos: false,
      losslessAudio: false,
      unlimitedSkips: false,
      liveRooms: false,
      maxAccounts: 1,
    },
  },
  plus: {
    tier: 'plus',
    name: 'Plus',
    price: 4.99,
    features: {
      adFree: true,
      offlineDownloads: true,
      dolbyAtmos: false,
      losslessAudio: false,
      unlimitedSkips: true,
      liveRooms: false,
      maxAccounts: 1,
    },
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: 9.99,
    features: {
      adFree: true,
      offlineDownloads: true,
      dolbyAtmos: true,
      losslessAudio: true,
      unlimitedSkips: true,
      liveRooms: true,
      maxAccounts: 1,
    },
  },
  family: {
    tier: 'family',
    name: 'Family',
    price: 14.99,
    features: {
      adFree: true,
      offlineDownloads: true,
      dolbyAtmos: true,
      losslessAudio: true,
      unlimitedSkips: true,
      liveRooms: true,
      maxAccounts: 6,
    },
  },
};

export interface MKMediaItem {
  id: string;
  type: 'songs' | 'albums' | 'playlists' | 'stations' | 'artists' | 'music-videos';
  attributes: {
    name: string;
    artistName?: string;
    albumName?: string;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    durationInMillis?: number;
    genreNames?: string[];
    releaseDate?: string;
    trackNumber?: number;
  };
  relationships?: any;
}

export interface PlayerState {
  queue: MKMediaItem[];
  currentIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  volume: number;
  currentTime: number;
  duration: number;
}

export interface LyricLine {
  startTime: number;
  endTime: number;
  text: string;
  words?: Array<{
    word: string;
    startTime: number;
    endTime: number;
  }>;
}
