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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;

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
