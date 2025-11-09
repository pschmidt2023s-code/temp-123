import type { MKMediaItem } from '@shared/schema';

declare global {
  interface Window {
    MusicKit: any;
  }
}

class MusicKitService {
  private instance: any = null;
  private initialized = false;

  async configure() {
    if (this.initialized) return this.instance;

    try {
      if (typeof window !== 'undefined' && window.MusicKit) {
        await window.MusicKit.configure({
          developerToken: import.meta.env.VITE_MK_DEV_TOKEN || 'demo',
          app: {
            name: 'SoundVista',
            build: '1.0.0',
          },
        });
        this.instance = window.MusicKit.getInstance();
        this.initialized = true;
      }
    } catch (error) {
      console.warn('MusicKit not available, using demo mode:', error);
    }

    return this.instance;
  }

  getInstance() {
    return this.instance;
  }

  async authorize() {
    if (!this.instance) await this.configure();
    try {
      return await this.instance?.authorize();
    } catch (error) {
      console.warn('MusicKit authorization failed:', error);
      return null;
    }
  }

  async play(item: MKMediaItem) {
    const audioUrl = (item.attributes as any).url;
    
    if (audioUrl) {
      return;
    }
    
    if (!this.instance) return;
    try {
      await this.instance.setQueue({ [item.type]: [item.id] });
      await this.instance.play();
    } catch (error) {
      console.warn('Playback failed:', error);
    }
  }

  async pause() {
    if (!this.instance) return;
    try {
      await this.instance.pause();
    } catch (error) {
      console.warn('Pause failed:', error);
    }
  }

  hasLocalAudio(item: MKMediaItem): boolean {
    return !!(item.attributes as any).url;
  }

  getArtworkURL(artwork: MKMediaItem['attributes']['artwork'], size = 400): string {
    if (!artwork) return 'https://via.placeholder.com/' + size;
    return artwork.url.replace('{w}', size.toString()).replace('{h}', size.toString());
  }
}

export const musicKit = new MusicKitService();
