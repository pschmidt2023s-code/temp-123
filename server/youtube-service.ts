/**
 * YouTube Music Service
 * 
 * Handles integration with YouTube Data API v3 for:
 * - Searching for music videos
 * - Matching Spotify tracks to YouTube videos
 * - Fetching video details for playback
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  duration: string; // ISO 8601 format (e.g., "PT4M33S")
  viewCount: string;
  publishedAt: string;
}

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  description: string;
}

class YouTubeService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
  }

  /**
   * Check if YouTube API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Search for music videos on YouTube
   * @param query Search query (e.g., "Bohemian Rhapsody Queen")
   * @param maxResults Maximum number of results (default: 10)
   */
  async searchVideos(query: string, maxResults: number = 10): Promise<YouTubeSearchResult[]> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const url = new URL(`${YOUTUBE_API_BASE}/search`);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', query);
      url.searchParams.append('type', 'video');
      url.searchParams.append('videoCategoryId', '10'); // Music category
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('key', this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'YouTube search failed');
      }

      const data = await response.json();

      return data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        description: item.snippet.description,
      }));
    } catch (error: any) {
      console.error('[YouTube Search Error]:', error);
      throw error;
    }
  }

  /**
   * Search for a music track by artist and title
   * Returns the best match (first result)
   */
  async findTrack(artist: string, title: string): Promise<YouTubeSearchResult | null> {
    const query = `${artist} ${title} official audio`;
    const results = await this.searchVideos(query, 5);
    
    if (results.length === 0) {
      return null;
    }

    // Return first result (usually the best match)
    return results[0];
  }

  /**
   * Get detailed video information
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideo> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const url = new URL(`${YOUTUBE_API_BASE}/videos`);
      url.searchParams.append('part', 'snippet,contentDetails,statistics');
      url.searchParams.append('id', videoId);
      url.searchParams.append('key', this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch video details');
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = data.items[0];

      return {
        videoId: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        publishedAt: video.snippet.publishedAt,
      };
    } catch (error: any) {
      console.error('[YouTube Video Details Error]:', error);
      throw error;
    }
  }

  /**
   * Convert ISO 8601 duration to seconds
   * e.g., "PT4M33S" -> 273
   */
  parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Batch search for multiple tracks
   * Useful for matching entire playlists
   */
  async findMultipleTracks(tracks: Array<{ artist: string; title: string; spotifyId?: string }>): Promise<Array<{
    spotifyId?: string;
    artist: string;
    title: string;
    youtubeVideoId: string | null;
    youtubeThumbnail: string | null;
  }>> {
    const results = [];

    for (const track of tracks) {
      try {
        const youtubeVideo = await this.findTrack(track.artist, track.title);
        
        results.push({
          spotifyId: track.spotifyId,
          artist: track.artist,
          title: track.title,
          youtubeVideoId: youtubeVideo?.videoId || null,
          youtubeThumbnail: youtubeVideo?.thumbnailUrl || null,
        });

        // Rate limiting: YouTube allows 10,000 requests per day
        // Adding small delay to be safe
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[YouTube] Failed to find track: ${track.artist} - ${track.title}`, error);
        results.push({
          spotifyId: track.spotifyId,
          artist: track.artist,
          title: track.title,
          youtubeVideoId: null,
          youtubeThumbnail: null,
        });
      }
    }

    return results;
  }
}

export const youtubeService = new YouTubeService();
