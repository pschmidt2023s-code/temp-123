import { type User, type InsertUser, type Playlist, type InsertPlaylist, type Subscription, type InsertSubscription } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAppleToken(userId: string, token: string): Promise<User | undefined>;
  
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getPlaylistsByUser(userId: string): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, data: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
  
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private playlists: Map<string, Playlist>;
  private subscriptions: Map<string, Subscription>;

  constructor() {
    this.users = new Map();
    this.playlists = new Map();
    this.subscriptions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, appleToken: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserAppleToken(userId: string, token: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    user.appleToken = token;
    this.users.set(userId, user);
    return user;
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
}

export const storage = new MemStorage();
