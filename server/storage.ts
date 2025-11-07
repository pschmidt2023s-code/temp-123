import { 
  type User, type InsertUser, 
  type Playlist, type InsertPlaylist, 
  type Subscription, type InsertSubscription,
  type AdminUser, type InsertAdminUser,
  type Release, type InsertRelease,
  type ArtistRegistrationLink, type InsertArtistRegistrationLink,
  type StreamingService, type InsertStreamingService,
  type WebAuthnCredential, type InsertWebAuthnCredential
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

export const storage = new MemStorage();
