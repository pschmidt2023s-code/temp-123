import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  appleToken: text("apple_token"),
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
  status: text("status").notNull().default('active'), // 'active', 'cancelled', 'expired'
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

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
