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
  type StreamingEvent, type InsertStreamingEvent
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
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
}

import { db } from './db';
import { eq, sql as drizzleSql, desc, and } from 'drizzle-orm';
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
  streamingEvents
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

    if (existing[0]) {
      await db.update(userStats)
        .set({
          playCount: existing[0].playCount + 1,
          totalMinutes: existing[0].totalMinutes + durationMinutes,
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
    const result = await db.update(achievements).set({ isShared: true }).where(eq(achievements.id, achievementId));
    return result.rowCount > 0;
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
}

export const storage = new DbStorage();
