import { 
  type User, type InsertUser, 
  type Playlist, type InsertPlaylist, 
  type Subscription, type InsertSubscription,
  type AdminUser, type InsertAdminUser,
  type Release, type InsertRelease,
  type ArtistRegistrationLink, type InsertArtistRegistrationLink,
  type StreamingService, type InsertStreamingService,
  type WebAuthnCredential, type InsertWebAuthnCredential,
  type UserSettings, type InsertUserSettings,
  type UserStats, type InsertUserStats,
  type Achievement, type InsertAchievement,
  type ArtistProfile, type InsertArtistProfile,
  type Lyrics, type InsertLyrics,
  type StreamingEvent, type InsertStreamingEvent,
  type Coupon, type InsertCoupon,
  type CouponUsage, type InsertCouponUsage,
  type MusicQuiz, type InsertMusicQuiz,
  type OfflineDownload, type InsertOfflineDownload,
  type Leaderboard, type InsertLeaderboard
} from "@shared/schema";
import { randomUUID } from "crypto";

// Helper functions for period boundaries
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getPeriodStart(period: string): Date | null {
  if (period === 'weekly') return getWeekStart();
  if (period === 'monthly') return getMonthStart();
  return null; // all_time has no period boundary
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  updateUserAppleToken(userId: string, token: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // WebAuthn Credentials
  createWebAuthnCredential(credential: InsertWebAuthnCredential): Promise<WebAuthnCredential>;
  getWebAuthnCredential(credentialId: string): Promise<WebAuthnCredential | undefined>;
  getWebAuthnCredentialsByUser(userId: string): Promise<WebAuthnCredential[]>;
  updateWebAuthnCredential(id: string, data: Partial<WebAuthnCredential>): Promise<WebAuthnCredential | undefined>;
  deleteWebAuthnCredential(id: string): Promise<boolean>;
  
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getPlaylistsByUser(userId: string): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, data: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
  
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: string): Promise<boolean>;
  
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  
  getAllReleases(): Promise<Release[]>;
  getPublishedReleases(status: string): Promise<Release[]>;
  getRelease(id: string): Promise<Release | undefined>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, data: Partial<Release>): Promise<Release | undefined>;
  deleteRelease(id: string): Promise<boolean>;
  
  getAllArtistLinks(): Promise<ArtistRegistrationLink[]>;
  getArtistLinkByCode(code: string): Promise<ArtistRegistrationLink | undefined>;
  createArtistLink(link: InsertArtistRegistrationLink): Promise<ArtistRegistrationLink>;
  markArtistLinkUsed(id: string): Promise<boolean>;
  deleteArtistLink(id: string): Promise<boolean>;
  
  getAllStreamingServices(): Promise<StreamingService[]>;
  getStreamingService(id: string): Promise<StreamingService | undefined>;
  createStreamingService(service: InsertStreamingService): Promise<StreamingService>;
  updateStreamingService(id: string, data: Partial<StreamingService>): Promise<StreamingService | undefined>;
  deleteStreamingService(id: string): Promise<boolean>;
  
  // User Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings | undefined>;
  
  // User Stats
  getUserStats(userId: string): Promise<UserStats[]>;
  getTopArtists(userId: string, limit?: number): Promise<UserStats[]>;
  recordPlayback(userId: string, artistName: string, songId: string, songTitle: string, durationMinutes: number): Promise<void>;
  
  // Achievements
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  markAchievementShared(achievementId: string): Promise<boolean>;
  
  // Artist Profiles
  getArtistProfile(userId: string): Promise<ArtistProfile | undefined>;
  getArtistProfileByName(artistName: string): Promise<ArtistProfile | undefined>;
  createArtistProfile(profile: InsertArtistProfile): Promise<ArtistProfile>;
  updateArtistProfile(id: string, data: Partial<ArtistProfile>): Promise<ArtistProfile | undefined>;
  
  // Lyrics
  getLyricsByReleaseId(releaseId: string): Promise<Lyrics | undefined>;
  getAllLyrics(): Promise<Lyrics[]>;
  createLyrics(lyrics: InsertLyrics): Promise<Lyrics>;
  updateLyrics(id: string, data: Partial<Lyrics>): Promise<Lyrics | undefined>;
  deleteLyrics(id: string): Promise<boolean>;
  
  // Streaming Events
  recordStreamingEvent(event: InsertStreamingEvent): Promise<StreamingEvent>;
  getStreamingEventsByRelease(releaseId: string): Promise<StreamingEvent[]>;
  getStreamingAnalytics(releaseId: string): Promise<{
    totalStreams: number;
    totalMinutes: number;
    topCountries: Array<{ country: string; streams: number }>;
    topCities: Array<{ city: string; streams: number }>;
    platformBreakdown: Array<{ platform: string; streams: number }>;
  }>;
  
  // Coupons
  getAllCoupons(): Promise<Coupon[]>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
  validateCoupon(code: string, tier: string, userId: string): Promise<{ valid: boolean; coupon?: Coupon; error?: string }>;
  useCoupon(couponId: string, userId: string, subscriptionId: string): Promise<CouponUsage>;
  getCouponUsages(couponId: string): Promise<CouponUsage[]>;
  
  // ========== PHASE 1 NEW METHODS ==========
  
  // Audio Settings
  getAudioSettings(userId: string): Promise<any>;
  createOrUpdateAudioSettings(settings: any): Promise<any>;
  
  // Alarms
  getAlarms(userId: string): Promise<any[]>;
  createAlarm(alarm: any): Promise<any>;
  updateAlarm(id: string, data: any): Promise<any>;
  deleteAlarm(id: string): Promise<boolean>;
  
  // Sleep Timer
  getActiveSleepTimer(userId: string): Promise<any | null>;
  createSleepTimer(timer: any): Promise<any>;
  deleteSleepTimer(id: string): Promise<boolean>;
  
  // Gift Cards
  redeemGiftCard(code: string, userId: string): Promise<any>;
  createGiftCard(giftCard: any): Promise<any>;
  getAllGiftCards(): Promise<any[]>;
  
  // Referrals
  getReferralsByUser(userId: string): Promise<any[]>;
  createReferral(referral: any): Promise<any>;
  applyReferralCode(code: string, userId: string): Promise<any>;
  
  // User Stats (Enhanced)
  getTotalListeningTime(userId: string): Promise<number>;
  trackSongPlay(userId: string, songId: string, songTitle: string, artistName: string, durationMinutes: number): Promise<void>;
  
  // ========== PHASE 2.1: FRIEND SYSTEM ==========
  getFriends(userId: string): Promise<any[]>;
  getPendingFriendRequests(userId: string): Promise<any[]>;
  sendFriendRequest(userId: string, friendId: string): Promise<any>;
  acceptFriendRequest(requestId: string): Promise<any>;
  rejectFriendRequest(requestId: string): Promise<boolean>;
  removeFriend(friendshipId: string): Promise<boolean>;
  getFriendActivity(userId: string, limit?: number): Promise<any[]>;
  recordFriendActivity(userId: string, trackId: string, trackName: string, artistName: string, albumArt?: string): Promise<any>;

  // ========== PHASE 2.2: AI PLAYLISTS ==========
  getGeneratedPlaylists(userId: string): Promise<any[]>;
  getGeneratedPlaylist(id: string): Promise<any | undefined>;
  createGeneratedPlaylist(data: any): Promise<any>;
  deleteGeneratedPlaylist(id: string): Promise<boolean>;
  refreshGeneratedPlaylist(id: string): Promise<any>;

  // ========== PHASE 2.4: MUSIC QUIZZES ==========
  getAllQuizzes(): Promise<MusicQuiz[]>;
  getQuiz(id: string): Promise<MusicQuiz | undefined>;
  createQuiz(quiz: InsertMusicQuiz): Promise<MusicQuiz>;
  incrementQuizPlayCount(id: string): Promise<void>;
  submitQuizScore(quizId: string, userId: string, score: number, maxScore: number): Promise<any>;
  getQuizScores(quizId: string): Promise<any[]>;
  getUserQuizScores(userId: string): Promise<any[]>;

  // ========== PHASE 2.5: LEADERBOARDS & ACHIEVEMENTS ==========
  getLeaderboards(artistId: string, period: string, limit?: number): Promise<Leaderboard[]>;
  getUserLeaderboardPosition(userId: string, artistId: string, period: string): Promise<Leaderboard | undefined>;
  updateUserListeningStats(userId: string, artistId: string, artistName: string, minutes: number): Promise<void>;
  recalculateLeaderboardRanks(artistId: string, period: string): Promise<void>;
  checkAndUnlockAchievements(userId: string): Promise<Achievement[]>;

  // ========== PHASE 2.6: OFFLINE DOWNLOADS ==========
  getUserDownloads(userId: string): Promise<any[]>;
  createDownload(download: any): Promise<any>;
  deleteDownload(id: string): Promise<boolean>;
  getUserStorageUsage(userId: string): Promise<number>;

  // ========== PHASE 2.7: CUSTOM RADIO STATIONS ==========
  getUserRadioStations(userId: string): Promise<any[]>;
  createRadioStation(station: any): Promise<any>;
  deleteRadioStation(id: string): Promise<boolean>;
  updateRadioStationPlayCount(id: string): Promise<void>;
}

export class MemStorage {
  private users: Map<string, User>;
  private playlists: Map<string, Playlist>;
  private subscriptions: Map<string, Subscription>;
  private admins: Map<string, AdminUser>;
  private releases: Map<string, Release>;
  private artistLinks: Map<string, ArtistRegistrationLink>;
  private streamingServices: Map<string, StreamingService>;
  private adminSessions: Map<string, { username: string; expiresAt: Date }>;
  private webauthnCredentials: Map<string, WebAuthnCredential>;
  private userSettings: Map<string, UserSettings>;
  private userStats: Map<string, UserStats>;
  private achievements: Map<string, Achievement>;
  private artistProfiles: Map<string, ArtistProfile>;
  private lyrics: Map<string, Lyrics>;
  private streamingEvents: Map<string, StreamingEvent>;
  private coupons: Map<string, Coupon>;
  private couponUsages: Map<string, CouponUsage>;

  constructor() {
    this.users = new Map();
    this.playlists = new Map();
    this.subscriptions = new Map();
    this.admins = new Map();
    this.releases = new Map();
    this.artistLinks = new Map();
    this.streamingServices = new Map();
    this.adminSessions = new Map();
    this.webauthnCredentials = new Map();
    this.userSettings = new Map();
    this.userStats = new Map();
    this.achievements = new Map();
    this.artistProfiles = new Map();
    this.lyrics = new Map();
    this.streamingEvents = new Map();
    this.coupons = new Map();
    this.couponUsages = new Map();
  }

  async createAdminSession(token: string, username: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session
    this.adminSessions.set(token, { username, expiresAt });
  }

  async validateAdminSession(token: string): Promise<boolean> {
    const session = this.adminSessions.get(token);
    if (!session) return false;
    if (new Date() > session.expiresAt) {
      this.adminSessions.delete(token);
      return false;
    }
    return true;
  }

  async invalidateAdminSession(token: string): Promise<void> {
    this.adminSessions.delete(token);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id, 
      email: insertUser.email || null,
      passwordHash: insertUser.passwordHash || null,
      appleToken: insertUser.appleToken || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      createdAt: new Date(),
      lastLoginAt: null,
      twoFactorSecret: null,
      twoFactorEnabled: false,
      backupCodes: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async updateUserAppleToken(userId: string, token: string): Promise<User | undefined> {
    return this.updateUser(userId, { appleToken: token });
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getPlaylistsByUser(userId: string): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      (playlist) => playlist.userId === userId,
    );
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = randomUUID();
    const playlist: Playlist = { 
      ...insertPlaylist,
      userId: insertPlaylist.userId || null,
      description: insertPlaylist.description || null,
      coverUrl: insertPlaylist.coverUrl || null,
      id,
      isPublic: insertPlaylist.isPublic ?? true,
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: string, data: Partial<Playlist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    const updated = { ...playlist, ...data };
    this.playlists.set(id, updated);
    return updated;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    return this.playlists.delete(id);
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId && sub.status === 'active',
    );
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      startDate: new Date(),
      endDate: insertSubscription.endDate || null,
      autoRenew: insertSubscription.autoRenew ?? true,
      status: insertSubscription.status || 'active',
      stripeCheckoutSessionId: insertSubscription.stripeCheckoutSessionId || null,
      stripePaymentIntentId: insertSubscription.stripePaymentIntentId || null,
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    const updated = { ...subscription, ...data };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async cancelSubscription(id: string): Promise<boolean> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return false;
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    this.subscriptions.set(id, subscription);
    return true;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username,
    );
  }

  async createAdmin(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const admin: AdminUser = {
      ...insertAdmin,
      id,
      role: insertAdmin.role || 'admin',
      createdAt: new Date(),
    };
    this.admins.set(id, admin);
    return admin;
  }

  async getAllReleases(): Promise<Release[]> {
    return Array.from(this.releases.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getPublishedReleases(status: string = 'published'): Promise<Release[]> {
    return Array.from(this.releases.values())
      .filter(release => release.status === status)
      .sort(
        (a, b) => (b.releaseDate?.getTime() || 0) - (a.releaseDate?.getTime() || 0)
      );
  }

  async getRelease(id: string): Promise<Release | undefined> {
    return this.releases.get(id);
  }

  async createRelease(insertRelease: InsertRelease): Promise<Release> {
    const id = randomUUID();
    const release: Release = {
      ...insertRelease,
      id,
      audioFilePath: insertRelease.audioFilePath || null,
      coverFilePath: insertRelease.coverFilePath || null,
      preorderEnabled: insertRelease.preorderEnabled || false,
      preorderDate: insertRelease.preorderDate || null,
      previewEnabled: insertRelease.previewEnabled || false,
      previewDurationSeconds: insertRelease.previewDurationSeconds || null,
      catalogId: insertRelease.catalogId || null,
      isrc: insertRelease.isrc || null,
      upc: insertRelease.upc || null,
      coverUrl: insertRelease.coverUrl || null,
      trackCount: insertRelease.trackCount || 0,
      status: insertRelease.status || 'pending',
      createdAt: new Date(),
    };
    this.releases.set(id, release);
    return release;
  }

  async updateRelease(id: string, data: Partial<Release>): Promise<Release | undefined> {
    const release = this.releases.get(id);
    if (!release) return undefined;
    const updated = { ...release, ...data };
    this.releases.set(id, updated);
    return updated;
  }

  async deleteRelease(id: string): Promise<boolean> {
    return this.releases.delete(id);
  }

  async getAllArtistLinks(): Promise<ArtistRegistrationLink[]> {
    return Array.from(this.artistLinks.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getArtistLinkByCode(code: string): Promise<ArtistRegistrationLink | undefined> {
    return Array.from(this.artistLinks.values()).find(
      (link) => link.linkCode === code,
    );
  }

  async createArtistLink(insertLink: InsertArtistRegistrationLink): Promise<ArtistRegistrationLink> {
    const id = randomUUID();
    const link: ArtistRegistrationLink = {
      ...insertLink,
      id,
      artistName: insertLink.artistName || null,
      email: insertLink.email || null,
      isUsed: insertLink.isUsed ?? false,
      usedAt: null,
      createdAt: new Date(),
    };
    this.artistLinks.set(id, link);
    return link;
  }

  async markArtistLinkUsed(id: string): Promise<boolean> {
    const link = this.artistLinks.get(id);
    if (!link) return false;
    link.isUsed = true;
    link.usedAt = new Date();
    this.artistLinks.set(id, link);
    return true;
  }

  async deleteArtistLink(id: string): Promise<boolean> {
    return this.artistLinks.delete(id);
  }

  async getAllStreamingServices(): Promise<StreamingService[]> {
    return Array.from(this.streamingServices.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }

  async getStreamingService(id: string): Promise<StreamingService | undefined> {
    return this.streamingServices.get(id);
  }

  async createStreamingService(insertService: InsertStreamingService): Promise<StreamingService> {
    const id = randomUUID();
    const service: StreamingService = {
      ...insertService,
      id,
      status: insertService.status || 'active',
      apiEndpoint: insertService.apiEndpoint || null,
      lastChecked: null,
      createdAt: new Date(),
    };
    this.streamingServices.set(id, service);
    return service;
  }

  async updateStreamingService(id: string, data: Partial<StreamingService>): Promise<StreamingService | undefined> {
    const service = this.streamingServices.get(id);
    if (!service) return undefined;
    const updated = { ...service, ...data };
    this.streamingServices.set(id, updated);
    return updated;
  }

  async deleteStreamingService(id: string): Promise<boolean> {
    return this.streamingServices.delete(id);
  }

  // WebAuthn Credentials Methods
  async createWebAuthnCredential(credential: InsertWebAuthnCredential): Promise<WebAuthnCredential> {
    const id = credential.id || randomUUID();
    const webauthnCred: WebAuthnCredential = {
      ...credential,
      id,
      counter: credential.counter || 0,
      deviceName: credential.deviceName || null,
      transports: credential.transports || null,
      createdAt: new Date(),
      lastUsedAt: null,
    };
    this.webauthnCredentials.set(id, webauthnCred);
    return webauthnCred;
  }

  async getWebAuthnCredential(credentialId: string): Promise<WebAuthnCredential | undefined> {
    return Array.from(this.webauthnCredentials.values()).find(
      (cred) => cred.credentialId === credentialId
    );
  }

  async getWebAuthnCredentialsByUser(userId: string): Promise<WebAuthnCredential[]> {
    return Array.from(this.webauthnCredentials.values()).filter(
      (cred) => cred.userId === userId
    );
  }

  async updateWebAuthnCredential(id: string, data: Partial<WebAuthnCredential>): Promise<WebAuthnCredential | undefined> {
    const credential = this.webauthnCredentials.get(id);
    if (!credential) return undefined;
    const updated = { ...credential, ...data };
    this.webauthnCredentials.set(id, updated);
    return updated;
  }

  async deleteWebAuthnCredential(id: string): Promise<boolean> {
    return this.webauthnCredentials.delete(id);
  }

  // ========== PHASE 2: FRIEND SYSTEM STUBS ==========
  async getFriends(userId: string): Promise<any[]> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  async getPendingFriendRequests(userId: string): Promise<any[]> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<any> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  async acceptFriendRequest(requestId: string): Promise<any> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  async rejectFriendRequest(requestId: string): Promise<boolean> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  async removeFriend(friendshipId: string): Promise<boolean> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  async getFriendActivity(userId: string, limit?: number): Promise<any[]> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  async recordFriendActivity(userId: string, trackId: string, trackName: string, artistName: string, albumArt?: string): Promise<any> {
    throw new Error('Friend system not implemented in MemStorage');
  }

  // ========== PHASE 2.2: AI PLAYLISTS STUBS ==========
  async getGeneratedPlaylists(userId: string): Promise<any[]> {
    throw new Error('AI Playlists not implemented in MemStorage');
  }

  async getGeneratedPlaylist(id: string): Promise<any | undefined> {
    throw new Error('AI Playlists not implemented in MemStorage');
  }

  async createGeneratedPlaylist(data: any): Promise<any> {
    throw new Error('AI Playlists not implemented in MemStorage');
  }

  async deleteGeneratedPlaylist(id: string): Promise<boolean> {
    throw new Error('AI Playlists not implemented in MemStorage');
  }

  async refreshGeneratedPlaylist(id: string): Promise<any> {
    throw new Error('AI Playlists not implemented in MemStorage');
  }

  // ========== PHASE 2.4: MUSIC QUIZZES STUBS ==========
  async getAllQuizzes(): Promise<MusicQuiz[]> {
    throw new Error('Music Quizzes not implemented in MemStorage');
  }

  async getQuiz(id: string): Promise<MusicQuiz | undefined> {
    throw new Error('Music Quizzes not implemented in MemStorage');
  }

  async createQuiz(quiz: InsertMusicQuiz): Promise<MusicQuiz> {
    throw new Error('Music Quizzes not implemented in MemStorage');
  }

  async incrementQuizPlayCount(id: string): Promise<void> {
    throw new Error('Music Quizzes not implemented in MemStorage');
  }

  async submitQuizScore(quizId: string, userId: string, score: number, maxScore: number): Promise<any> {
    throw new Error('Music Quizzes not implemented in MemStorage');
  }

  async getQuizScores(quizId: string): Promise<any[]> {
    throw new Error('Music Quizzes not implemented in MemStorage');
  }

  async getUserQuizScores(userId: string): Promise<any[]> {
    throw new Error('Music Quizzes not implemented in MemStorage');
  }
}

import { db } from './db';
import { eq, sql, desc, and, or, inArray } from 'drizzle-orm';
import {
  users,
  playlists,
  subscriptions,
  adminUsers,
  releases,
  artistRegistrationLinks,
  streamingServices,
  webauthnCredentials,
  adminSessions,
  userSettings,
  userStats,
  achievements,
  artistProfiles,
  lyrics,
  streamingEvents,
  coupons,
  couponUsages,
  audioSettings,
  alarms,
  sleepTimers,
  giftCards,
  referrals,
  friends,
  friendActivity,
  musicQuizzes,
  quizScores,
  generatedPlaylists,
  offlineDownloads,
  customRadioStations,
  leaderboards
} from '@shared/schema';

class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async updateUserAppleToken(userId: string, token: string): Promise<User | undefined> {
    const result = await db.update(users).set({ appleToken: token }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const result = await db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
    return result[0];
  }

  async getPlaylistsByUser(userId: string): Promise<Playlist[]> {
    return db.select().from(playlists).where(eq(playlists.userId, userId));
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const result = await db.insert(playlists).values(playlist).returning();
    return result[0];
  }

  async updatePlaylist(id: string, data: Partial<Playlist>): Promise<Playlist | undefined> {
    const result = await db.update(playlists).set(data).where(eq(playlists.id, id)).returning();
    return result[0];
  }

  async deletePlaylist(id: string): Promise<boolean> {
    const result = await db.delete(playlists).where(eq(playlists.id, id));
    return result.rowCount > 0;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  async cancelSubscription(id: string): Promise<boolean> {
    const result = await db.update(subscriptions).set({ status: 'cancelled' }).where(eq(subscriptions.id, id));
    return result.rowCount > 0;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result[0];
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const result = await db.insert(adminUsers).values(admin).returning();
    return result[0];
  }

  async getAllReleases(): Promise<Release[]> {
    return db.select().from(releases).orderBy(releases.createdAt);
  }

  async getPublishedReleases(status: string = 'published'): Promise<Release[]> {
    return db.select().from(releases).where(eq(releases.status, status)).orderBy(releases.releaseDate);
  }

  async getRelease(id: string): Promise<Release | undefined> {
    const result = await db.select().from(releases).where(eq(releases.id, id)).limit(1);
    return result[0];
  }

  async createRelease(release: InsertRelease): Promise<Release> {
    const result = await db.insert(releases).values(release).returning();
    return result[0];
  }

  async updateRelease(id: string, data: Partial<Release>): Promise<Release | undefined> {
    const result = await db.update(releases).set(data).where(eq(releases.id, id)).returning();
    return result[0];
  }

  async deleteRelease(id: string): Promise<boolean> {
    const result = await db.delete(releases).where(eq(releases.id, id));
    return result.rowCount > 0;
  }

  async getAllArtistLinks(): Promise<ArtistRegistrationLink[]> {
    return db.select().from(artistRegistrationLinks);
  }

  async getArtistLinkByCode(code: string): Promise<ArtistRegistrationLink | undefined> {
    const result = await db.select().from(artistRegistrationLinks).where(eq(artistRegistrationLinks.linkCode, code)).limit(1);
    return result[0];
  }

  async createArtistLink(link: InsertArtistRegistrationLink): Promise<ArtistRegistrationLink> {
    const result = await db.insert(artistRegistrationLinks).values(link).returning();
    return result[0];
  }

  async markArtistLinkUsed(id: string): Promise<boolean> {
    const result = await db.update(artistRegistrationLinks).set({ isUsed: true, usedAt: new Date() }).where(eq(artistRegistrationLinks.id, id));
    return result.rowCount > 0;
  }

  async deleteArtistLink(id: string): Promise<boolean> {
    const result = await db.delete(artistRegistrationLinks).where(eq(artistRegistrationLinks.id, id));
    return result.rowCount > 0;
  }

  async getAllStreamingServices(): Promise<StreamingService[]> {
    return db.select().from(streamingServices);
  }

  async getStreamingService(id: string): Promise<StreamingService | undefined> {
    const result = await db.select().from(streamingServices).where(eq(streamingServices.id, id)).limit(1);
    return result[0];
  }

  async createStreamingService(service: InsertStreamingService): Promise<StreamingService> {
    const result = await db.insert(streamingServices).values(service).returning();
    return result[0];
  }

  async updateStreamingService(id: string, data: Partial<StreamingService>): Promise<StreamingService | undefined> {
    const result = await db.update(streamingServices).set(data).where(eq(streamingServices.id, id)).returning();
    return result[0];
  }

  async deleteStreamingService(id: string): Promise<boolean> {
    const result = await db.delete(streamingServices).where(eq(streamingServices.id, id));
    return result.rowCount > 0;
  }

  async createAdminSession(token: string, username: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await db.insert(adminSessions).values({ token, username, expiresAt });
  }

  async validateAdminSession(token: string): Promise<boolean> {
    const result = await db.select().from(adminSessions).where(eq(adminSessions.token, token)).limit(1);
    if (!result[0]) return false;
    if (new Date() > result[0].expiresAt) {
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
      return false;
    }
    return true;
  }

  async invalidateAdminSession(token: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }

  async createWebAuthnCredential(credential: InsertWebAuthnCredential): Promise<WebAuthnCredential> {
    const result = await db.insert(webauthnCredentials).values(credential).returning();
    return result[0];
  }

  async getWebAuthnCredential(credentialId: string): Promise<WebAuthnCredential | undefined> {
    const result = await db.select().from(webauthnCredentials).where(eq(webauthnCredentials.credentialId, credentialId)).limit(1);
    return result[0];
  }

  async getWebAuthnCredentialsByUser(userId: string): Promise<WebAuthnCredential[]> {
    return db.select().from(webauthnCredentials).where(eq(webauthnCredentials.userId, userId));
  }

  async updateWebAuthnCredential(id: string, data: Partial<WebAuthnCredential>): Promise<WebAuthnCredential | undefined> {
    const result = await db.update(webauthnCredentials).set(data).where(eq(webauthnCredentials.id, id)).returning();
    return result[0];
  }

  async deleteWebAuthnCredential(id: string): Promise<boolean> {
    const result = await db.delete(webauthnCredentials).where(eq(webauthnCredentials.id, id));
    return result.rowCount > 0;
  }

  // User Settings
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    return result[0];
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const result = await db.insert(userSettings).values(settings).returning();
    return result[0];
  }

  async updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const result = await db.update(userSettings).set({ ...data, updatedAt: new Date() }).where(eq(userSettings.userId, userId)).returning();
    return result[0];
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats[]> {
    return db.select().from(userStats).where(eq(userStats.userId, userId));
  }

  async getTopArtists(userId: string, limit: number = 10): Promise<UserStats[]> {
    return db.select().from(userStats).where(eq(userStats.userId, userId)).orderBy(desc(userStats.totalMinutes)).limit(limit);
  }

  async recordPlayback(userId: string, artistName: string, songId: string, songTitle: string, durationMinutes: number): Promise<void> {
    const existing = await db.select().from(userStats)
      .where(and(
        eq(userStats.userId, userId),
        eq(userStats.songId, songId)
      ))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      await db.update(userStats)
        .set({
          playCount: (existing[0].playCount || 0) + 1,
          totalMinutes: (existing[0].totalMinutes || 0) + durationMinutes,
          lastPlayedAt: new Date()
        })
        .where(eq(userStats.id, existing[0].id));
    } else {
      await db.insert(userStats).values({
        userId,
        artistName,
        songId,
        songTitle,
        playCount: 1,
        totalMinutes: durationMinutes
      });
    }
  }

  // Achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.unlockedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const result = await db.insert(achievements).values(achievement).returning();
    return result[0];
  }

  async markAchievementShared(achievementId: string): Promise<boolean> {
    // isShared field doesn't exist in schema, skip this operation
    return true;
  }

  // Artist Profiles
  async getArtistProfile(userId: string): Promise<ArtistProfile | undefined> {
    const result = await db.select().from(artistProfiles).where(eq(artistProfiles.userId, userId)).limit(1);
    return result[0];
  }

  async getArtistProfileByName(artistName: string): Promise<ArtistProfile | undefined> {
    const result = await db.select().from(artistProfiles).where(eq(artistProfiles.artistName, artistName)).limit(1);
    return result[0];
  }

  async createArtistProfile(profile: InsertArtistProfile): Promise<ArtistProfile> {
    const result = await db.insert(artistProfiles).values(profile).returning();
    return result[0];
  }

  async updateArtistProfile(id: string, data: Partial<ArtistProfile>): Promise<ArtistProfile | undefined> {
    const result = await db.update(artistProfiles).set(data).where(eq(artistProfiles.id, id)).returning();
    return result[0];
  }

  // Lyrics
  async getLyricsByReleaseId(releaseId: string): Promise<Lyrics | undefined> {
    const result = await db.select().from(lyrics).where(eq(lyrics.releaseId, releaseId)).limit(1);
    return result[0];
  }

  async getAllLyrics(): Promise<Lyrics[]> {
    const result = await db.select().from(lyrics);
    return result;
  }

  async createLyrics(lyricsData: InsertLyrics): Promise<Lyrics> {
    const result = await db.insert(lyrics).values(lyricsData).returning();
    return result[0];
  }

  async updateLyrics(id: string, data: Partial<Lyrics>): Promise<Lyrics | undefined> {
    const result = await db.update(lyrics).set({ ...data, updatedAt: new Date() }).where(eq(lyrics.id, id)).returning();
    return result[0];
  }

  async deleteLyrics(id: string): Promise<boolean> {
    const result = await db.delete(lyrics).where(eq(lyrics.id, id));
    return result.rowCount > 0;
  }

  // Streaming Events
  async recordStreamingEvent(event: InsertStreamingEvent): Promise<StreamingEvent> {
    const result = await db.insert(streamingEvents).values(event).returning();
    return result[0];
  }

  async getStreamingEventsByRelease(releaseId: string): Promise<StreamingEvent[]> {
    return db.select().from(streamingEvents).where(eq(streamingEvents.releaseId, releaseId));
  }

  async getStreamingAnalytics(releaseId: string): Promise<{
    totalStreams: number;
    totalMinutes: number;
    topCountries: Array<{ country: string; streams: number }>;
    topCities: Array<{ city: string; streams: number }>;
    platformBreakdown: Array<{ platform: string; streams: number }>;
  }> {
    const events = await this.getStreamingEventsByRelease(releaseId);
    
    const totalStreams = events.length;
    const totalMinutes = events.reduce((sum, e) => sum + (e.durationSeconds / 60), 0);
    
    const countryMap = new Map<string, number>();
    const cityMap = new Map<string, number>();
    const platformMap = new Map<string, number>();
    
    events.forEach(e => {
      if (e.country) {
        countryMap.set(e.country, (countryMap.get(e.country) || 0) + 1);
      }
      if (e.city) {
        cityMap.set(e.city, (cityMap.get(e.city) || 0) + 1);
      }
      platformMap.set(e.platform, (platformMap.get(e.platform) || 0) + 1);
    });
    
    const topCountries = Array.from(countryMap.entries())
      .map(([country, streams]) => ({ country, streams }))
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 10);
    
    const topCities = Array.from(cityMap.entries())
      .map(([city, streams]) => ({ city, streams }))
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 10);
    
    const platformBreakdown = Array.from(platformMap.entries())
      .map(([platform, streams]) => ({ platform, streams }))
      .sort((a, b) => b.streams - a.streams);
    
    return {
      totalStreams,
      totalMinutes,
      topCountries,
      topCities,
      platformBreakdown
    };
  }

  // Coupons
  async getAllCoupons(): Promise<Coupon[]> {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.id, id));
    return result[0];
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.code, code));
    return result[0];
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const result = await db.insert(coupons).values(coupon).returning();
    return result[0];
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined> {
    const result = await db.update(coupons).set(data).where(eq(coupons.id, id)).returning();
    return result[0];
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return result.rowCount > 0;
  }

  async validateCoupon(code: string, tier: string, userId: string): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, error: 'Gutschein nicht gefunden' };
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Gutschein ist nicht aktiv' };
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { valid: false, error: 'Gutschein ist noch nicht gültig' };
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { valid: false, error: 'Gutschein ist abgelaufen' };
    }

    if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
      return { valid: false, error: 'Gutschein wurde bereits vollständig eingelöst' };
    }

    if (coupon.applicableTiers && coupon.applicableTiers.length > 0 && !coupon.applicableTiers.includes(tier)) {
      return { valid: false, error: 'Gutschein ist für diesen Plan nicht gültig' };
    }

    const existingUsage = await db.select().from(couponUsages).where(
      and(eq(couponUsages.couponId, coupon.id), eq(couponUsages.userId, userId))
    );
    if (existingUsage.length > 0) {
      return { valid: false, error: 'Du hast diesen Gutschein bereits verwendet' };
    }

    return { valid: true, coupon };
  }

  async useCoupon(couponId: string, userId: string, subscriptionId: string): Promise<CouponUsage> {
    const result = await db.transaction(async (tx) => {
      await tx.update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.id, couponId));

      const [usage] = await tx.insert(couponUsages)
        .values({ couponId, userId, subscriptionId })
        .returning();

      return usage;
    });

    return result;
  }

  async getCouponUsages(couponId: string): Promise<CouponUsage[]> {
    return db.select().from(couponUsages).where(eq(couponUsages.couponId, couponId));
  }

  // ========== PHASE 1 IMPLEMENTATIONS ==========

  // Audio Settings
  async getAudioSettings(userId: string): Promise<any> {
    const result = await db.select().from(audioSettings).where(eq(audioSettings.userId, userId)).limit(1);
    return result[0] || null;
  }

  async createOrUpdateAudioSettings(settings: any): Promise<any> {
    const existing = await this.getAudioSettings(settings.userId);
    if (existing) {
      const result = await db.update(audioSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(audioSettings.userId, settings.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(audioSettings).values(settings).returning();
      return result[0];
    }
  }

  // Alarms
  async getAlarms(userId: string): Promise<any[]> {
    return db.select().from(alarms).where(eq(alarms.userId, userId));
  }

  async createAlarm(alarm: any): Promise<any> {
    const result = await db.insert(alarms).values(alarm).returning();
    return result[0];
  }

  async updateAlarm(id: string, data: any): Promise<any> {
    const result = await db.update(alarms).set(data).where(eq(alarms.id, id)).returning();
    return result[0];
  }

  async deleteAlarm(id: string): Promise<boolean> {
    const result = await db.delete(alarms).where(eq(alarms.id, id));
    return result.rowCount > 0;
  }

  // Sleep Timer
  async getActiveSleepTimer(userId: string): Promise<any | null> {
    const now = new Date();
    const result = await db.select().from(sleepTimers)
      .where(and(
        eq(sleepTimers.userId, userId),
        sql`${sleepTimers.expiresAt} > ${now}`
      ))
      .limit(1);
    return result[0] || null;
  }

  async createSleepTimer(timer: any): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + timer.durationMinutes);
    
    const result = await db.insert(sleepTimers).values({
      ...timer,
      expiresAt
    }).returning();
    return result[0];
  }

  async deleteSleepTimer(id: string): Promise<boolean> {
    const result = await db.delete(sleepTimers).where(eq(sleepTimers.id, id));
    return result.rowCount > 0;
  }

  // Gift Cards
  async redeemGiftCard(code: string, userId: string): Promise<any> {
    const giftCard = await db.select().from(giftCards).where(eq(giftCards.code, code)).limit(1);
    
    if (!giftCard[0]) {
      throw new Error('Gutschein-Code nicht gefunden');
    }
    
    if (giftCard[0].isRedeemed) {
      throw new Error('Gutschein wurde bereits eingelöst');
    }
    
    if (giftCard[0].expiresAt && new Date(giftCard[0].expiresAt) < new Date()) {
      throw new Error('Gutschein ist abgelaufen');
    }

    await db.update(giftCards).set({
      isRedeemed: true,
      redeemedBy: userId,
      redeemedAt: new Date()
    }).where(eq(giftCards.id, giftCard[0].id));

    const subscription = await this.getUserSubscription(userId);
    const newEndDate = new Date();
    if (subscription && subscription.endDate) {
      newEndDate.setTime(new Date(subscription.endDate).getTime());
    }
    newEndDate.setMonth(newEndDate.getMonth() + giftCard[0].durationMonths);

    if (subscription) {
      await this.updateSubscription(subscription.id, {
        tier: giftCard[0].tier,
        endDate: newEndDate,
        status: 'active'
      });
    } else {
      await this.createSubscription({
        userId,
        tier: giftCard[0].tier,
        status: 'active',
        endDate: newEndDate,
        autoRenew: false
      });
    }

    return {
      success: true,
      tier: giftCard[0].tier,
      months: giftCard[0].durationMonths,
      expiresAt: newEndDate
    };
  }

  async createGiftCard(giftCard: any): Promise<any> {
    const result = await db.insert(giftCards).values(giftCard).returning();
    return result[0];
  }

  async getAllGiftCards(): Promise<any[]> {
    return db.select().from(giftCards).orderBy(desc(giftCards.purchasedAt));
  }

  // Referrals
  async getReferralsByUser(userId: string): Promise<any[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async createReferral(referral: any): Promise<any> {
    const result = await db.insert(referrals).values(referral).returning();
    return result[0];
  }

  async applyReferralCode(code: string, userId: string): Promise<any> {
    const referral = await db.select().from(referrals)
      .where(eq(referrals.referralCode, code))
      .limit(1);
    
    if (!referral[0]) {
      throw new Error('Empfehlungscode nicht gefunden');
    }
    
    if (referral[0].status !== 'pending') {
      throw new Error('Empfehlungscode wurde bereits verwendet');
    }
    
    if (referral[0].referrerId === userId) {
      throw new Error('Du kannst deinen eigenen Code nicht verwenden');
    }

    await db.update(referrals).set({
      referredId: userId,
      status: 'completed',
      completedAt: new Date()
    }).where(eq(referrals.id, referral[0].id));

    const subscription = await this.getUserSubscription(userId);
    const newEndDate = new Date();
    if (subscription && subscription.endDate) {
      newEndDate.setTime(new Date(subscription.endDate).getTime());
    }
    
    if (referral[0].rewardType === 'free_month') {
      newEndDate.setMonth(newEndDate.getMonth() + referral[0].rewardValue);
    }

    if (subscription) {
      await this.updateSubscription(subscription.id, {
        endDate: newEndDate
      });
    } else {
      await this.createSubscription({
        userId,
        tier: 'premium',
        status: 'active',
        endDate: newEndDate,
        autoRenew: false
      });
    }

    const referrerSub = await this.getUserSubscription(referral[0].referrerId);
    if (referrerSub) {
      const referrerEndDate = new Date(referrerSub.endDate || new Date());
      referrerEndDate.setMonth(referrerEndDate.getMonth() + 1);
      await this.updateSubscription(referrerSub.id, {
        endDate: referrerEndDate
      });
    }

    return {
      success: true,
      reward: `${referral[0].rewardValue} Monat${referral[0].rewardValue > 1 ? 'e' : ''} gratis`,
      expiresAt: newEndDate
    };
  }

  // User Stats (Enhanced)
  async getTotalListeningTime(userId: string): Promise<number> {
    const result = await db.select({
      total: sql<number>`COALESCE(SUM(${userStats.totalMinutes}), 0)`
    }).from(userStats).where(eq(userStats.userId, userId));
    
    return Number(result[0]?.total || 0);
  }

  async trackSongPlay(userId: string, songId: string, songTitle: string, artistName: string, durationMinutes: number): Promise<void> {
    const existing = await db.select().from(userStats).where(
      and(
        eq(userStats.userId, userId),
        eq(userStats.songId, songId)
      )
    ).limit(1);

    if (existing[0]) {
      await db.update(userStats).set({
        playCount: sql`${userStats.playCount} + 1`,
        totalMinutes: sql`${userStats.totalMinutes} + ${durationMinutes}`,
        lastPlayedAt: new Date()
      }).where(eq(userStats.id, existing[0].id));
    } else {
      await db.insert(userStats).values({
        userId,
        songId,
        songTitle,
        artistName,
        playCount: 1,
        totalMinutes: durationMinutes,
        lastPlayedAt: new Date()
      });
    }
  }

  // ========== PHASE 2: FRIEND SYSTEM ==========
  
  async getFriends(userId: string): Promise<any[]> {
    const friendsList = await db.select().from(friends).where(
      and(
        or(
          eq(friends.userId, userId),
          eq(friends.friendId, userId)
        ),
        eq(friends.status, 'accepted')
      )
    );

    const friendIds = friendsList.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );

    if (friendIds.length === 0) return [];

    const friendProfiles = await db.select().from(users).where(
      inArray(users.id, friendIds)
    );

    return friendsList.map(friendship => {
      const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
      const profile = friendProfiles.find(p => p.id === friendId);
      return {
        ...friendship,
        friend: profile
      };
    });
  }

  async getPendingFriendRequests(userId: string): Promise<any[]> {
    const requests = await db.select().from(friends).where(
      and(
        eq(friends.friendId, userId),
        eq(friends.status, 'pending')
      )
    );

    if (requests.length === 0) return [];

    const userIds = requests.map(r => r.userId);
    const requesters = await db.select().from(users).where(
      inArray(users.id, userIds)
    );

    return requests.map(request => ({
      ...request,
      requester: requesters.find(u => u.id === request.userId)
    }));
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<any> {
    if (userId === friendId) {
      throw new Error('Du kannst dir nicht selbst eine Freundschaftsanfrage senden');
    }

    const existing = await db.select().from(friends).where(
      or(
        and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
        and(eq(friends.userId, friendId), eq(friends.friendId, userId))
      )
    ).limit(1);

    if (existing[0]) {
      if (existing[0].status === 'accepted') {
        throw new Error('Ihr seid bereits befreundet');
      }
      throw new Error('Freundschaftsanfrage bereits gesendet');
    }

    const result = await db.insert(friends).values({
      userId,
      friendId,
      status: 'pending'
    }).returning();

    return result[0];
  }

  async acceptFriendRequest(requestId: string): Promise<any> {
    const result = await db.update(friends).set({
      status: 'accepted',
      acceptedAt: new Date()
    }).where(eq(friends.id, requestId)).returning();

    return result[0];
  }

  async rejectFriendRequest(requestId: string): Promise<boolean> {
    const result = await db.delete(friends).where(eq(friends.id, requestId)).returning();
    return result.length > 0;
  }

  async removeFriend(friendshipId: string): Promise<boolean> {
    const result = await db.delete(friends).where(eq(friends.id, friendshipId)).returning();
    return result.length > 0;
  }

  async getFriendActivity(userId: string, limit: number = 20): Promise<any[]> {
    const friendsList = await this.getFriends(userId);
    const friendIds = friendsList.map(f => f.friend.id);

    if (friendIds.length === 0) return [];

    const activities = await db.select().from(friendActivity).where(
      inArray(friendActivity.userId, friendIds)
    ).orderBy(desc(friendActivity.timestamp)).limit(limit);

    const userIds = Array.from(new Set(activities.map(a => a.userId)));
    const activityUsers = await db.select().from(users).where(
      inArray(users.id, userIds)
    );

    return activities.map(activity => ({
      ...activity,
      user: activityUsers.find(u => u.id === activity.userId)
    }));
  }

  async recordFriendActivity(userId: string, trackId: string, trackName: string, artistName: string, albumArt?: string): Promise<any> {
    const result = await db.insert(friendActivity).values({
      userId,
      trackId,
      trackName,
      artistName,
      albumArt
    }).returning();

    return result[0];
  }

  // ========== PHASE 2.2: AI PLAYLISTS ==========
  async getGeneratedPlaylists(userId: string): Promise<any[]> {
    const playlists = await db.select().from(generatedPlaylists)
      .where(eq(generatedPlaylists.userId, userId))
      .orderBy(desc(generatedPlaylists.createdAt));
    return playlists;
  }

  async getGeneratedPlaylist(id: string): Promise<any | undefined> {
    const result = await db.select().from(generatedPlaylists)
      .where(eq(generatedPlaylists.id, id))
      .limit(1);
    return result[0];
  }

  async createGeneratedPlaylist(data: any): Promise<any> {
    const result = await db.insert(generatedPlaylists).values(data).returning();
    return result[0];
  }

  async deleteGeneratedPlaylist(id: string): Promise<boolean> {
    const result = await db.delete(generatedPlaylists)
      .where(eq(generatedPlaylists.id, id))
      .returning();
    return result.length > 0;
  }

  async refreshGeneratedPlaylist(id: string): Promise<any> {
    const playlist = await this.getGeneratedPlaylist(id);
    if (!playlist) throw new Error('Playlist not found');

    const newTracks: string[] = [];
    const trackCount = playlist.tracks?.length || 20;
    for (let i = 0; i < trackCount; i++) {
      newTracks.push(`${playlist.mood}-track-${Date.now()}-${i}`);
    }

    const result = await db.update(generatedPlaylists)
      .set({ 
        tracks: newTracks,
        lastRefreshedAt: new Date(),
      })
      .where(eq(generatedPlaylists.id, id))
      .returning();
    
    return result[0];
  }

  // ========== PHASE 2.4: MUSIC QUIZZES ==========
  async getAllQuizzes(): Promise<MusicQuiz[]> {
    const quizzes = await db.select().from(musicQuizzes).orderBy(desc(musicQuizzes.createdAt));
    return quizzes;
  }

  async getQuiz(id: string): Promise<MusicQuiz | undefined> {
    const result = await db.select().from(musicQuizzes)
      .where(eq(musicQuizzes.id, id))
      .limit(1);
    return result[0];
  }

  async createQuiz(quiz: InsertMusicQuiz): Promise<MusicQuiz> {
    const result = await db.insert(musicQuizzes).values(quiz).returning();
    return result[0];
  }

  async incrementQuizPlayCount(id: string): Promise<void> {
    await db.update(musicQuizzes)
      .set({ playCount: sql`${musicQuizzes.playCount} + 1` })
      .where(eq(musicQuizzes.id, id));
  }

  async submitQuizScore(quizId: string, userId: string, score: number, maxScore: number): Promise<any> {
    const result = await db.insert(quizScores).values({
      quizId,
      userId,
      score,
      maxScore,
    }).returning();
    return result[0];
  }

  async getQuizScores(quizId: string): Promise<any[]> {
    const scores = await db.select()
      .from(quizScores)
      .where(eq(quizScores.quizId, quizId))
      .orderBy(desc(quizScores.score));
    return scores;
  }

  async getUserQuizScores(userId: string): Promise<any[]> {
    const scores = await db.select()
      .from(quizScores)
      .where(eq(quizScores.userId, userId))
      .orderBy(desc(quizScores.completedAt));
    return scores;
  }

  // ========== PHASE 2.5: LEADERBOARDS & ACHIEVEMENTS ==========
  async getLeaderboards(artistId: string, period: string, limit: number = 50): Promise<Leaderboard[]> {
    const currentPeriodStart = getPeriodStart(period);
    
    // Build query conditions
    const conditions = [
      eq(leaderboards.artistId, artistId),
      eq(leaderboards.period, period)
    ];
    
    // For weekly/monthly, only include entries from current period
    if (currentPeriodStart) {
      conditions.push(sql`${leaderboards.periodStart} >= ${currentPeriodStart}`);
    }
    
    const boards = await db.select()
      .from(leaderboards)
      .where(and(...conditions))
      .orderBy(leaderboards.rank)
      .limit(limit);
    return boards;
  }

  async getUserLeaderboardPosition(userId: string, artistId: string, period: string): Promise<Leaderboard | undefined> {
    const currentPeriodStart = getPeriodStart(period);
    
    // Build query conditions
    const conditions = [
      eq(leaderboards.userId, userId),
      eq(leaderboards.artistId, artistId),
      eq(leaderboards.period, period)
    ];
    
    // For weekly/monthly, only include entries from current period
    if (currentPeriodStart) {
      conditions.push(sql`${leaderboards.periodStart} >= ${currentPeriodStart}`);
    }
    
    const result = await db.select()
      .from(leaderboards)
      .where(and(...conditions))
      .limit(1);
    return result[0];
  }

  async updateUserListeningStats(userId: string, artistId: string, artistName: string, minutes: number): Promise<void> {
    // Update for all periods: weekly, monthly, all_time
    const periods = ['weekly', 'monthly', 'all_time'];
    
    for (const period of periods) {
      const currentPeriodStart = getPeriodStart(period);
      
      const existing = await db.select()
        .from(leaderboards)
        .where(and(
          eq(leaderboards.userId, userId),
          eq(leaderboards.artistId, artistId),
          eq(leaderboards.period, period)
        ))
        .limit(1);

      if (existing.length > 0) {
        const entry = existing[0];
        
        // Check if we need to reset for new period (weekly/monthly only)
        const needsReset = currentPeriodStart && entry.periodStart && 
          new Date(entry.periodStart).getTime() < currentPeriodStart.getTime();
        
        if (needsReset) {
          // Reset to new period
          await db.update(leaderboards)
            .set({ 
              totalMinutes: minutes,
              periodStart: currentPeriodStart,
              updatedAt: new Date()
            })
            .where(and(
              eq(leaderboards.userId, userId),
              eq(leaderboards.artistId, artistId),
              eq(leaderboards.period, period)
            ));
        } else {
          // Add to existing
          await db.update(leaderboards)
            .set({ 
              totalMinutes: sql`${leaderboards.totalMinutes} + ${minutes}`,
              updatedAt: new Date()
            })
            .where(and(
              eq(leaderboards.userId, userId),
              eq(leaderboards.artistId, artistId),
              eq(leaderboards.period, period)
            ));
        }
      } else {
        // Create new entry
        await db.insert(leaderboards).values({
          userId,
          artistId,
          artistName,
          totalMinutes: minutes,
          period,
          periodStart: currentPeriodStart,
          rank: null,
        });
      }
    }

    // Recalculate ranks after update
    for (const period of periods) {
      await this.recalculateLeaderboardRanks(artistId, period);
    }
  }

  async recalculateLeaderboardRanks(artistId: string, period: string): Promise<void> {
    const currentPeriodStart = getPeriodStart(period);
    
    // Build query conditions
    const conditions = [
      eq(leaderboards.artistId, artistId),
      eq(leaderboards.period, period)
    ];
    
    // For weekly/monthly, only include entries from current period
    if (currentPeriodStart) {
      conditions.push(sql`${leaderboards.periodStart} >= ${currentPeriodStart}`);
    }
    
    const boards = await db.select()
      .from(leaderboards)
      .where(and(...conditions))
      .orderBy(desc(leaderboards.totalMinutes));

    for (let i = 0; i < boards.length; i++) {
      await db.update(leaderboards)
        .set({ rank: i + 1 })
        .where(eq(leaderboards.id, boards[i].id));
    }
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const existingAchievements = await this.getUserAchievements(userId);
    const existingTypes = existingAchievements.map(a => a.type);

    // Check for Quiz Master (3+ quizzes completed)
    if (!existingTypes.includes('quiz_master')) {
      const userScores = await db.select()
        .from(quizScores)
        .where(eq(quizScores.userId, userId));
      
      if (userScores.length >= 3) {
        const achievement = await this.createAchievement({
          userId,
          type: 'quiz_master',
          title: 'Quiz Master',
          description: '3 Music-Quizzes abgeschlossen',
          iconName: 'Trophy',
        });
        newAchievements.push(achievement);
      }
    }

    // Check for Top Listener (rank 1 on any leaderboard)
    if (!existingTypes.includes('top_listener')) {
      const topRanks = await db.select()
        .from(leaderboards)
        .where(and(
          eq(leaderboards.userId, userId),
          eq(leaderboards.rank, 1)
        ));
      
      if (topRanks.length > 0) {
        const achievement = await this.createAchievement({
          userId,
          type: 'top_listener',
          title: 'Top Listener',
          description: 'Platz 1 im Artist-Leaderboard erreicht',
          iconName: 'Crown',
        });
        newAchievements.push(achievement);
      }
    }

    // Check for Playlist Creator (created at least 1 playlist)
    if (!existingTypes.includes('playlist_creator')) {
      const userPlaylists = await db.select()
        .from(playlists)
        .where(eq(playlists.userId, userId));
      
      if (userPlaylists.length >= 1) {
        const achievement = await this.createAchievement({
          userId,
          type: 'playlist_creator',
          title: 'Playlist Creator',
          description: 'Erste Playlist erstellt',
          iconName: 'MusicNotes',
        });
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  // ========== PHASE 2.6: OFFLINE DOWNLOADS ==========
  async getUserDownloads(userId: string): Promise<any[]> {
    const downloads = await db.select()
      .from(offlineDownloads)
      .where(eq(offlineDownloads.userId, userId))
      .orderBy(desc(offlineDownloads.downloadedAt));
    return downloads;
  }

  async createDownload(download: any): Promise<any> {
    const [newDownload] = await db.insert(offlineDownloads)
      .values(download)
      .returning();
    return newDownload;
  }

  async deleteDownload(id: string): Promise<boolean> {
    const result = await db.delete(offlineDownloads)
      .where(eq(offlineDownloads.id, id));
    return true;
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    const downloads = await db.select()
      .from(offlineDownloads)
      .where(eq(offlineDownloads.userId, userId));
    
    return downloads.reduce((total, d) => total + (d.fileSizeBytes || 0), 0);
  }

  // ========== PHASE 2.7: CUSTOM RADIO STATIONS ==========
  async getUserRadioStations(userId: string): Promise<any[]> {
    const stations = await db.select()
      .from(customRadioStations)
      .where(eq(customRadioStations.userId, userId))
      .orderBy(desc(customRadioStations.createdAt));
    return stations;
  }

  async createRadioStation(station: any): Promise<any> {
    const [newStation] = await db.insert(customRadioStations)
      .values(station)
      .returning();
    return newStation;
  }

  async deleteRadioStation(id: string): Promise<boolean> {
    await db.delete(customRadioStations)
      .where(eq(customRadioStations.id, id));
    return true;
  }

  async updateRadioStationPlayCount(id: string): Promise<void> {
    await db.update(customRadioStations)
      .set({ 
        playCount: sql`${customRadioStations.playCount} + 1`,
        lastPlayedAt: new Date()
      })
      .where(eq(customRadioStations.id, id));
  }
}

export const storage = new DbStorage();
