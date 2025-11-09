/**
 * YouTube API Quota Manager
 * 
 * YouTube Data API v3 has a daily quota limit of 10,000 units/day (free tier).
 * Different operations cost different amounts:
 * - search: 100 units
 * - videos.list: 1 unit
 * 
 * This manager tracks usage and prevents quota exhaustion.
 */

interface QuotaUsage {
  date: string; // YYYY-MM-DD
  unitsUsed: number;
  searchRequests: number;
  videoDetailsRequests: number;
}

class YouTubeQuotaManager {
  private static readonly DAILY_QUOTA = 10000;
  private static readonly SEARCH_COST = 100;
  private static readonly VIDEO_DETAILS_COST = 1;
  
  private usage: QuotaUsage;
  private reservationLock: boolean = false;

  constructor() {
    this.usage = this.resetUsageIfNewDay();
  }

  /**
   * Get current date in YYYY-MM-DD format (UTC)
   */
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Reset usage counter if it's a new day
   */
  private resetUsageIfNewDay(): QuotaUsage {
    const currentDate = this.getCurrentDate();
    
    if (!this.usage || this.usage.date !== currentDate) {
      this.usage = {
        date: currentDate,
        unitsUsed: 0,
        searchRequests: 0,
        videoDetailsRequests: 0,
      };
    }

    return this.usage;
  }

  /**
   * Reserve quota before making an API call (atomic operation)
   * Returns true if quota was reserved, false if quota exhausted
   */
  reserveQuota(operationType: 'search' | 'videoDetails'): boolean {
    // Simple spinlock to prevent race conditions
    while (this.reservationLock) {
      // Wait for lock to be released
    }
    
    this.reservationLock = true;
    
    try {
      this.resetUsageIfNewDay();
      
      const cost = operationType === 'search' 
        ? YouTubeQuotaManager.SEARCH_COST 
        : YouTubeQuotaManager.VIDEO_DETAILS_COST;

      if ((this.usage.unitsUsed + cost) > YouTubeQuotaManager.DAILY_QUOTA) {
        return false;
      }

      // Pre-reserve the quota (charged regardless of API call success/failure)
      this.usage.unitsUsed += cost;

      if (operationType === 'search') {
        this.usage.searchRequests++;
      } else {
        this.usage.videoDetailsRequests++;
      }

      return true;
    } finally {
      this.reservationLock = false;
    }
  }

  /**
   * DEPRECATED: Use reserveQuota instead
   * Check if we have enough quota for an operation
   */
  canMakeRequest(operationType: 'search' | 'videoDetails'): boolean {
    this.resetUsageIfNewDay();
    
    const cost = operationType === 'search' 
      ? YouTubeQuotaManager.SEARCH_COST 
      : YouTubeQuotaManager.VIDEO_DETAILS_COST;

    return (this.usage.unitsUsed + cost) <= YouTubeQuotaManager.DAILY_QUOTA;
  }

  /**
   * DEPRECATED: Use reserveQuota instead
   * Record quota usage for an operation
   */
  recordUsage(operationType: 'search' | 'videoDetails'): void {
    this.resetUsageIfNewDay();
    
    const cost = operationType === 'search' 
      ? YouTubeQuotaManager.SEARCH_COST 
      : YouTubeQuotaManager.VIDEO_DETAILS_COST;

    this.usage.unitsUsed += cost;

    if (operationType === 'search') {
      this.usage.searchRequests++;
    } else {
      this.usage.videoDetailsRequests++;
    }
  }

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    this.resetUsageIfNewDay();
    
    return {
      date: this.usage.date,
      unitsUsed: this.usage.unitsUsed,
      unitsRemaining: YouTubeQuotaManager.DAILY_QUOTA - this.usage.unitsUsed,
      percentageUsed: (this.usage.unitsUsed / YouTubeQuotaManager.DAILY_QUOTA) * 100,
      searchRequests: this.usage.searchRequests,
      videoDetailsRequests: this.usage.videoDetailsRequests,
      dailyQuota: YouTubeQuotaManager.DAILY_QUOTA,
    };
  }

  /**
   * Get remaining quota in units
   */
  getRemainingQuota(): number {
    this.resetUsageIfNewDay();
    return YouTubeQuotaManager.DAILY_QUOTA - this.usage.unitsUsed;
  }

  /**
   * Check if quota is almost exhausted (>90% used)
   */
  isQuotaAlmostExhausted(): boolean {
    return this.getUsageStats().percentageUsed > 90;
  }

  /**
   * Estimate how many searches can still be made today
   */
  getEstimatedSearchesRemaining(): number {
    this.resetUsageIfNewDay();
    return Math.floor(this.getRemainingQuota() / YouTubeQuotaManager.SEARCH_COST);
  }
}

// Singleton instance
export const youtubeQuota = new YouTubeQuotaManager();
