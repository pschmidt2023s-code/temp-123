import type { SubscriptionTier } from '@shared/schema';

export interface FeatureAccess {
  adFree: boolean;
  offlineDownloads: boolean;
  dolbyAtmos: boolean;
  losslessAudio: boolean;
  unlimitedSkips: boolean;
  liveRooms: boolean;
  maxAccounts: number;
}

export function getFeatureAccess(tier: SubscriptionTier | null): FeatureAccess {
  if (!tier) {
    return {
      adFree: false,
      offlineDownloads: false,
      dolbyAtmos: false,
      losslessAudio: false,
      unlimitedSkips: false,
      liveRooms: false,
      maxAccounts: 1,
    };
  }

  switch (tier) {
    case 'plus':
      return {
        adFree: true,
        offlineDownloads: true,
        dolbyAtmos: false,
        losslessAudio: false,
        unlimitedSkips: false,
        liveRooms: false,
        maxAccounts: 1,
      };
    case 'premium':
      return {
        adFree: true,
        offlineDownloads: true,
        dolbyAtmos: true,
        losslessAudio: true,
        unlimitedSkips: true,
        liveRooms: false,
        maxAccounts: 1,
      };
    case 'family':
      return {
        adFree: true,
        offlineDownloads: true,
        dolbyAtmos: true,
        losslessAudio: true,
        unlimitedSkips: true,
        liveRooms: true,
        maxAccounts: 6,
      };
    default:
      return {
        adFree: false,
        offlineDownloads: false,
        dolbyAtmos: false,
        losslessAudio: false,
        unlimitedSkips: false,
        liveRooms: false,
        maxAccounts: 1,
      };
  }
}

export function getUpgradeMessage(feature: keyof FeatureAccess): string {
  const messages: Record<keyof FeatureAccess, string> = {
    adFree: 'Upgrade auf Plus oder höher für werbefreies Hören',
    offlineDownloads: 'Upgrade auf Plus oder höher für Offline-Downloads',
    dolbyAtmos: 'Upgrade auf Premium oder Family für Dolby Atmos',
    losslessAudio: 'Upgrade auf Premium oder Family für Lossless Audio',
    unlimitedSkips: 'Upgrade auf Premium oder Family für unbegrenzte Skips',
    liveRooms: 'Upgrade auf Family für Live Music Rooms',
    maxAccounts: 'Upgrade auf Family für bis zu 6 Accounts',
  };
  return messages[feature];
}
