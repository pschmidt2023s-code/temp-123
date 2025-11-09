/**
 * Spotify API Service
 * 
 * Handles authentication and data retrieval from Spotify Web API
 */

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
    items: {
      track: SpotifyTrack;
    }[];
  };
}

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  /**
   * Authenticate with Spotify using Client Credentials Flow
   * (for accessing public playlists and track data)
   */
  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return; // Token still valid
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify API credentials not configured');
    }

    const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spotify authentication failed: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

    console.log('[Spotify] Successfully authenticated');
  }

  /**
   * Make authenticated request to Spotify API
   */
  private async apiRequest(endpoint: string): Promise<any> {
    await this.authenticate();

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spotify API request failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Get playlist details including tracks
   */
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    const playlist = await this.apiRequest(`/playlists/${playlistId}`);
    return playlist;
  }

  /**
   * Get all tracks from a playlist (handles pagination)
   */
  async getPlaylistTracks(playlistId: string, limit = 50): Promise<SpotifyTrack[]> {
    const tracks: SpotifyTrack[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.apiRequest(
        `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
      );

      const items = response.items.filter((item: any) => item.track !== null);
      tracks.push(...items.map((item: any) => item.track));

      offset += limit;
      hasMore = response.next !== null;
    }

    return tracks;
  }

  /**
   * Get track by ID
   */
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    return this.apiRequest(`/tracks/${trackId}`);
  }

  /**
   * Get multiple tracks by IDs
   */
  async getTracks(trackIds: string[]): Promise<SpotifyTrack[]> {
    const ids = trackIds.join(',');
    const response = await this.apiRequest(`/tracks?ids=${ids}`);
    return response.tracks;
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit = 20): Promise<SpotifyTrack[]> {
    const response = await this.apiRequest(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
    );
    return response.tracks.items;
  }

  /**
   * Get track audio features (for AI recommendations)
   */
  async getAudioFeatures(trackId: string): Promise<{
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    duration_ms: number;
    time_signature: number;
  }> {
    return this.apiRequest(`/audio-features/${trackId}`);
  }

  /**
   * Get recommendations based on seed tracks
   */
  async getRecommendations(seedTracks: string[], limit = 20): Promise<SpotifyTrack[]> {
    const seeds = seedTracks.slice(0, 5).join(','); // Max 5 seeds
    const response = await this.apiRequest(
      `/recommendations?seed_tracks=${seeds}&limit=${limit}`
    );
    return response.tracks;
  }

  /**
   * Get artist's top tracks
   */
  async getArtistTopTracks(artistId: string, market = 'US'): Promise<SpotifyTrack[]> {
    const response = await this.apiRequest(`/artists/${artistId}/top-tracks?market=${market}`);
    return response.tracks;
  }

  /**
   * Convert Spotify track to our internal format
   */
  convertToInternalTrack(spotifyTrack: SpotifyTrack): {
    title: string;
    artist: string;
    album: string;
    duration: number;
    coverUrl: string;
    previewUrl: string | null;
    spotifyId: string;
    spotifyUrl: string;
  } {
    return {
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map(a => a.name).join(', '),
      album: spotifyTrack.album.name,
      duration: Math.floor(spotifyTrack.duration_ms / 1000),
      coverUrl: spotifyTrack.album.images[0]?.url || '',
      previewUrl: spotifyTrack.preview_url,
      spotifyId: spotifyTrack.id,
      spotifyUrl: spotifyTrack.external_urls.spotify,
    };
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

// Singleton instance
export const spotifyService = new SpotifyService();
