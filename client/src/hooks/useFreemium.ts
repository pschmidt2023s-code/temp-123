import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Subscription } from '@shared/schema';

const DEMO_USER_ID = 'demo-user';
const PREVIEW_DURATION = 30000; // 30 seconds in ms
const AD_INTERVAL_PLUS = 5 * 60 * 60 * 1000; // 5 hours in ms

interface FreemiumState {
  tier: string;
  shouldShowPreviewLimit: boolean;
  shouldShowAd: boolean;
  canSkipAd: boolean;
  trackListeningTime: (trackId: string, durationMs: number, trackType?: 'youtube' | 'apple_music' | 'spotify' | 'local') => void;
  markAdShown: () => void;
  resetPreviewLimit: () => void;
}

export function useFreemium(currentTime: number, duration: number): FreemiumState {
  const [lastAdTime, setLastAdTime] = useState<number>(Date.now());
  const [shouldShowPreviewLimit, setShouldShowPreviewLimit] = useState(false);
  const [shouldShowAd, setShouldShowAd] = useState(false);

  // Get user's subscription tier
  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['/api/subscriptions/user', DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/subscriptions/user/${DEMO_USER_ID}`);
      if (!response.ok) {
        return { tier: 'free', status: 'active' } as Subscription;
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const tier = subscription?.tier || 'free';

  // Check for 30s preview limit (Free tier only)
  useEffect(() => {
    if (tier === 'free' && currentTime >= PREVIEW_DURATION && duration > 0) {
      setShouldShowPreviewLimit(true);
    }
  }, [tier, currentTime, duration]);

  // Automatically check if ad should be shown when track completes
  useEffect(() => {
    // Only check when reaching end of track (within last 1s)
    if (duration > 0 && currentTime >= duration - 1000 && currentTime < duration) {
      const needsAd = checkAdNeeded();
      if (needsAd) {
        setShouldShowAd(true);
      }
    }
  }, [currentTime, duration]);

  // Check if ad should be shown after song ends
  const checkAdNeeded = useCallback(() => {
    if (tier === 'premium' || tier === 'family') {
      return false; // No ads for premium/family
    }

    if (tier === 'free') {
      return true; // Always show ads for free
    }

    if (tier === 'plus') {
      const timeSinceLastAd = Date.now() - lastAdTime;
      return timeSinceLastAd >= AD_INTERVAL_PLUS; // Show ad every 5 hours
    }

    return false;
  }, [tier, lastAdTime]);

  // Track listening history
  const trackListeningTime = useCallback(async (trackId: string, durationMs: number, trackType: 'youtube' | 'apple_music' | 'spotify' | 'local' = 'apple_music') => {
    try {
      const response = await fetch('/api/personalization/listening-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          trackId,
          trackType,
          trackTitle: 'Unknown',
          trackArtist: 'Unknown',
          playDurationSeconds: Math.floor(durationMs / 1000),
          completedPercentage: duration > 0 ? Math.floor((currentTime / duration) * 100) : 0,
          source: 'player',
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.warn('Failed to track listening history:', error);
      }
    } catch (error) {
      console.warn('Failed to track listening history:', error);
    }
  }, [currentTime, duration]);

  const markAdShown = useCallback(() => {
    setLastAdTime(Date.now());
    setShouldShowAd(false);
  }, []);

  const resetPreviewLimit = useCallback(() => {
    setShouldShowPreviewLimit(false);
  }, []);

  return {
    tier,
    shouldShowPreviewLimit,
    shouldShowAd,
    canSkipAd: tier !== 'free',
    trackListeningTime,
    markAdShown,
    resetPreviewLimit,
  };
}
