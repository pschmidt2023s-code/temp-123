export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });
  }
}

export interface PushNotificationData {
  type: 'new_release' | 'friend_activity' | 'playlist_update' | 'live_room_invite';
  title: string;
  message: string;
  actionUrl?: string;
}

export function showPushNotification(data: PushNotificationData) {
  sendNotification(data.title, {
    body: data.message,
    tag: data.type,
    requireInteraction: data.type === 'live_room_invite',
    data: { url: data.actionUrl },
  });
}
