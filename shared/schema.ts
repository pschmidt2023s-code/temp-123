import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash"),
  appleToken: text("apple_token"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  backupCodes: text("backup_codes").array(),
});

export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  credentialId: text("credential_id").notNull().unique(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  deviceName: text("device_name"),
  transports: text("transports").array(),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
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
  releaseType: text("release_type").notNull(), // 'single', 'ep', 'album'
  genre: text("genre").notNull(),
  
  // Preorder settings
  preorderEnabled: boolean("preorder_enabled").default(false),
  preorderDate: timestamp("preorder_date"),
  
  // Preview settings
  previewEnabled: boolean("preview_enabled").default(false),
  previewDurationSeconds: integer("preview_duration_seconds"), // max 30
  
  // File storage paths
  coverFilePath: text("cover_file_path"),
  audioFilePath: text("audio_file_path"),
  
  // Legacy/external fields
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

export const adminSessions = pgTable("admin_sessions", {
  token: text("token").primaryKey(),
  username: text("username").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  dataSaver: boolean("data_saver").default(false),
  downloadOverCellular: boolean("download_over_cellular").default(false),
  pictureInPicture: boolean("picture_in_picture").default(true),
  fadeInOut: boolean("fade_in_out").default(true),
  autoDj: boolean("auto_dj").default(false),
  audioNormalization: boolean("audio_normalization").default(true),
  monoAudio: boolean("mono_audio").default(false),
  equalizer: text("equalizer").default('off'), // 'off', 'acoustic', 'bass_boost', 'treble_boost', 'vocal_boost', 'custom'
  streamQuality: text("stream_quality").default('high'), // 'low', 'normal', 'high', 'best', 'lossless'
  cellularQuality: text("cellular_quality").default('normal'),
  autoBandwidthAdjust: boolean("auto_bandwidth_adjust").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  artistName: text("artist_name").notNull(),
  songId: text("song_id").notNull(),
  songTitle: text("song_title").notNull(),
  playCount: integer("play_count").default(0),
  totalMinutes: integer("total_minutes").default(0),
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'minutes_listened', 'songs_played', 'artists_discovered'
  milestone: integer("milestone").notNull(), // 1000, 10000, 100000
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  isShared: boolean("is_shared").default(false),
});

export const artistProfiles = pgTable("artist_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  artistName: text("artist_name").notNull().unique(),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lyrics = pgTable("lyrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  releaseId: varchar("release_id").references(() => releases.id).notNull(),
  content: text("content").notNull(), // Full lyrics text
  timedLines: text("timed_lines"), // JSON array of {startTime, endTime, text, words: [{word, startTime, endTime}]}
  language: text("language").default('de'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // 'percentage', 'fixed'
  discountValue: integer("discount_value").notNull(), // percentage (1-100) or cents
  maxUses: integer("max_uses").default(1),
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  applicableTiers: text("applicable_tiers").array(), // ['plus', 'premium', 'family'] or null for all
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => adminUsers.id),
});

export const couponUsages = pgTable("coupon_usages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").references(() => coupons.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  usedAt: timestamp("used_at").defaultNow(),
});

export const streamingEvents = pgTable("streaming_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  releaseId: varchar("release_id").references(() => releases.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  country: text("country"),
  city: text("city"),
  platform: text("platform").notNull(), // 'web', 'mobile', 'desktop'
  durationSeconds: integer("duration_seconds").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// ========== TIER 1: AI PLAYLISTS & DISCOVERY ==========

export const generatedPlaylists = pgTable("generated_playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(), // "Daily Mix 1", "Discover Weekly", "Workout Mix"
  type: text("type").notNull(), // 'daily_mix', 'discover_weekly', 'mood_based', 'ai_generated'
  mood: text("mood"), // 'happy', 'sad', 'energetic', 'calm', 'workout', 'focus'
  tracks: text("tracks").array().notNull(), // Array of MusicKit song IDs
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // For weekly/daily playlists
  lastRefreshedAt: timestamp("last_refreshed_at"),
});

// ========== TIER 1: SOCIAL FEATURES ==========

export const friends = pgTable("friends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  friendId: varchar("friend_id").references(() => users.id).notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

export const friendActivity = pgTable("friend_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trackId: text("track_id").notNull(),
  trackName: text("track_name").notNull(),
  artistName: text("artist_name").notNull(),
  albumArt: text("album_art"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const collaborativePlaylists = pgTable("collaborative_playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(), // Collaborator
  permission: text("permission").notNull().default('edit'), // 'view', 'edit', 'admin'
  addedAt: timestamp("added_at").defaultNow(),
});

export const musicStories = pgTable("music_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trackId: text("track_id").notNull(),
  trackName: text("track_name").notNull(),
  artistName: text("artist_name").notNull(),
  albumArt: text("album_art"),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours
  viewCount: integer("view_count").default(0),
});

export const storyViews = pgTable("story_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").references(() => musicStories.id).notNull(),
  viewerId: varchar("viewer_id").references(() => users.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// ========== TIER 2: AUDIO SETTINGS ==========

export const audioSettings = pgTable("audio_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  eqPreset: text("eq_preset").default('off'), // 'off', 'rock', 'pop', 'jazz', 'bass_boost', 'treble_boost', 'custom'
  customEqBands: text("custom_eq_bands"), // JSON: [60Hz, 170Hz, 310Hz, 600Hz, 1kHz, 3kHz, 6kHz, 12kHz, 14kHz, 16kHz]
  crossfadeEnabled: boolean("crossfade_enabled").default(false),
  crossfadeDuration: integer("crossfade_duration").default(0), // 0-12 seconds
  normalizationEnabled: boolean("normalization_enabled").default(true),
  spatialAudioEnabled: boolean("spatial_audio_enabled").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== TIER 2: OFFLINE DOWNLOADS ==========

export const offlineDownloads = pgTable("offline_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trackId: text("track_id").notNull(),
  trackName: text("track_name").notNull(),
  artistName: text("artist_name").notNull(),
  albumName: text("album_name"),
  albumArt: text("album_art"),
  quality: text("quality").notNull(), // 'lossless', 'high', 'medium', 'low'
  fileSizeBytes: integer("file_size_bytes"),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
});

// ========== TIER 3: GAMIFICATION & ENGAGEMENT ==========

export const musicQuizzes = pgTable("music_quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  tracks: text("tracks").array().notNull(), // Array of track IDs
  createdAt: timestamp("created_at").defaultNow(),
  playCount: integer("play_count").default(0),
});

export const quizScores = pgTable("quiz_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").references(() => musicQuizzes.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const leaderboards = pgTable("leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  artistId: text("artist_id").notNull(),
  artistName: text("artist_name").notNull(),
  totalMinutes: integer("total_minutes").notNull(),
  rank: integer("rank"),
  period: text("period").notNull(), // 'weekly', 'monthly', 'all_time'
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========== TIER 3: SMART HOME & CONVENIENCE ==========

export const alarms = pgTable("alarms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name"),
  time: text("time").notNull(), // "07:30"
  days: text("days").array().notNull(), // ['mon', 'tue', 'wed', 'thu', 'fri']
  playlistId: varchar("playlist_id").references(() => playlists.id),
  trackId: text("track_id"),
  volume: integer("volume").default(50),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sleepTimers = pgTable("sleep_timers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  durationMinutes: integer("duration_minutes").notNull(), // 15, 30, 45, 60
  fadeOutMinutes: integer("fade_out_minutes").default(5),
  startedAt: timestamp("started_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// ========== BONUS: MONETIZATION ==========

export const giftCards = pgTable("gift_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  tier: text("tier").notNull(), // 'plus', 'premium', 'family'
  durationMonths: integer("duration_months").notNull(), // 1, 3, 6, 12
  isRedeemed: boolean("is_redeemed").default(false),
  redeemedBy: varchar("redeemed_by").references(() => users.id),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").references(() => users.id).notNull(),
  referredId: varchar("referred_id").references(() => users.id),
  referralCode: text("referral_code").notNull().unique(),
  status: text("status").notNull().default('pending'), // 'pending', 'completed', 'expired'
  rewardType: text("reward_type").notNull(), // 'free_month', 'discount_percentage'
  rewardValue: integer("reward_value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const studentDiscounts = pgTable("student_discounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  verificationMethod: text("verification_method").notNull(), // 'email', 'sheerid', 'manual'
  studentEmail: text("student_email"),
  university: text("university"),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
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

// Release Type and Genre enums
export const releaseTypeEnum = z.enum(['single', 'ep', 'album']);
export type ReleaseType = z.infer<typeof releaseTypeEnum>;

export const insertReleaseSchema = createInsertSchema(releases).omit({
  id: true,
  createdAt: true,
}).extend({
  releaseType: releaseTypeEnum,
  releaseDate: z.coerce.date(),
  preorderDate: z.coerce.date().optional().nullable(),
  previewDurationSeconds: z.number().int().min(0).max(30).optional().nullable(),
}).refine(
  (data) => {
    if (data.preorderEnabled && !data.preorderDate) {
      return false;
    }
    if (data.previewEnabled && !data.previewDurationSeconds) {
      return false;
    }
    return true;
  },
  {
    message: "Wenn Vorbestellung oder Preview aktiviert ist, muss das jeweilige Feld ausgefüllt werden",
  }
);

export const insertArtistRegistrationLinkSchema = createInsertSchema(artistRegistrationLinks).omit({
  id: true,
  createdAt: true,
});

export const insertStreamingServiceSchema = createInsertSchema(streamingServices).omit({
  id: true,
  createdAt: true,
  lastChecked: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  lastPlayedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertArtistProfileSchema = createInsertSchema(artistProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertLyricsSchema = createInsertSchema(lyrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStreamingEventSchema = createInsertSchema(streamingEvents).omit({
  id: true,
  timestamp: true,
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
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertArtistProfile = z.infer<typeof insertArtistProfileSchema>;
export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type InsertLyrics = z.infer<typeof insertLyricsSchema>;
export type Lyrics = typeof lyrics.$inferSelect;
export type InsertStreamingEvent = z.infer<typeof insertStreamingEventSchema>;
export type StreamingEvent = typeof streamingEvents.$inferSelect;

export const insertWebAuthnCredentialSchema = createInsertSchema(webauthnCredentials).omit({
  createdAt: true,
  lastUsedAt: true,
});

export type InsertWebAuthnCredential = z.infer<typeof insertWebAuthnCredentialSchema>;
export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;

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
    url?: string;
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

// Coupon Types
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type CouponUsage = typeof couponUsages.$inferSelect;
export type InsertCouponUsage = z.infer<typeof insertCouponUsageSchema>;

// Coupon Schemas
export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true, usedCount: true });
export const insertCouponUsageSchema = createInsertSchema(couponUsages).omit({ id: true, usedAt: true });

// ========== NEW FEATURE SCHEMAS ==========

// AI Playlists
export const insertGeneratedPlaylistSchema = createInsertSchema(generatedPlaylists).omit({ id: true, createdAt: true });
export type GeneratedPlaylist = typeof generatedPlaylists.$inferSelect;
export type InsertGeneratedPlaylist = z.infer<typeof insertGeneratedPlaylistSchema>;

// Social Features
export const insertFriendSchema = createInsertSchema(friends).omit({ id: true, createdAt: true });
export const insertFriendActivitySchema = createInsertSchema(friendActivity).omit({ id: true, timestamp: true });
export const insertCollaborativePlaylistSchema = createInsertSchema(collaborativePlaylists).omit({ id: true, addedAt: true });
export const insertMusicStorySchema = createInsertSchema(musicStories).omit({ id: true, createdAt: true, viewCount: true });
export const insertStoryViewSchema = createInsertSchema(storyViews).omit({ id: true, viewedAt: true });

export type Friend = typeof friends.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type FriendActivity = typeof friendActivity.$inferSelect;
export type InsertFriendActivity = z.infer<typeof insertFriendActivitySchema>;
export type CollaborativePlaylist = typeof collaborativePlaylists.$inferSelect;
export type InsertCollaborativePlaylist = z.infer<typeof insertCollaborativePlaylistSchema>;
export type MusicStory = typeof musicStories.$inferSelect;
export type InsertMusicStory = z.infer<typeof insertMusicStorySchema>;
export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = z.infer<typeof insertStoryViewSchema>;

// Audio Settings
export const insertAudioSettingsSchema = createInsertSchema(audioSettings).omit({ id: true, updatedAt: true });
export type AudioSettings = typeof audioSettings.$inferSelect;
export type InsertAudioSettings = z.infer<typeof insertAudioSettingsSchema>;

// Offline Downloads
export const insertOfflineDownloadSchema = createInsertSchema(offlineDownloads).omit({ id: true, downloadedAt: true });
export type OfflineDownload = typeof offlineDownloads.$inferSelect;
export type InsertOfflineDownload = z.infer<typeof insertOfflineDownloadSchema>;

// Gamification
export const insertMusicQuizSchema = createInsertSchema(musicQuizzes).omit({ id: true, createdAt: true, playCount: true });
export const insertQuizScoreSchema = createInsertSchema(quizScores).omit({ id: true, completedAt: true });
export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({ id: true, updatedAt: true });

export type MusicQuiz = typeof musicQuizzes.$inferSelect;
export type InsertMusicQuiz = z.infer<typeof insertMusicQuizSchema>;
export type QuizScore = typeof quizScores.$inferSelect;
export type InsertQuizScore = z.infer<typeof insertQuizScoreSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;

// Smart Home
export const insertAlarmSchema = createInsertSchema(alarms).omit({ id: true, createdAt: true });
export const insertSleepTimerSchema = createInsertSchema(sleepTimers).omit({ id: true, startedAt: true });

export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = z.infer<typeof insertAlarmSchema>;
export type SleepTimer = typeof sleepTimers.$inferSelect;
export type InsertSleepTimer = z.infer<typeof insertSleepTimerSchema>;

// Monetization
export const insertGiftCardSchema = createInsertSchema(giftCards).omit({ id: true, createdAt: true, isRedeemed: true });
export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true });
export const insertStudentDiscountSchema = createInsertSchema(studentDiscounts).omit({ id: true, createdAt: true, isVerified: true });

export type GiftCard = typeof giftCards.$inferSelect;
export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type StudentDiscount = typeof studentDiscounts.$inferSelect;
export type InsertStudentDiscount = z.infer<typeof insertStudentDiscountSchema>;
