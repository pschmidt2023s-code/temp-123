import { useEffect, useRef, useState, useCallback } from 'react';
import type { MKMediaItem } from '@shared/schema';

interface Participant {
  id: string;
  username: string;
}

interface RoomState {
  id: string;
  name: string;
  currentTrack: MKMediaItem | null;
  queue: MKMediaItem[];
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
}

interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export function useLiveRoom(roomId: string | null, userId: string, username: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const maxReconnectAttempts = 5;

  const connect = useCallback((isManualJoin = false) => {
    if (!roomId) return;
    
    // Only reset attempts on manual join, not on auto-retries
    if (isManualJoin) {
      reconnectAttemptsRef.current = 0;
    }
    
    // Enable reconnection for this connection attempt
    shouldReconnectRef.current = true;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Reset retry budget on successful connection (wichtig!)
      reconnectAttemptsRef.current = 0;
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Join room
      ws.send(JSON.stringify({
        type: 'join',
        roomId,
        userId,
        username,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        switch (msg.type) {
          case 'sync_state':
            setRoomState(msg.room);
            break;
          case 'join':
            if (msg.userId !== userId) {
              setMessages(prev => [...prev, {
                userId: 'system',
                username: 'System',
                message: `${msg.username} ist beigetreten`,
                timestamp: Date.now(),
              }]);
            }
            break;
          case 'leave':
            setMessages(prev => [...prev, {
              userId: 'system',
              username: 'System',
              message: `${msg.username} hat den Raum verlassen`,
              timestamp: Date.now(),
            }]);
            break;
          case 'chat':
            setMessages(prev => [...prev, {
              userId: msg.userId,
              username: msg.username,
              message: msg.message,
              timestamp: Date.now(),
            }]);
            break;
          case 'play':
            setRoomState(prev => prev ? {
              ...prev,
              currentTrack: msg.track || prev.currentTrack,
              isPlaying: true,
              currentTime: msg.currentTime || 0,
            } : null);
            break;
          case 'pause':
            setRoomState(prev => prev ? {
              ...prev,
              isPlaying: false,
              currentTime: msg.currentTime || prev.currentTime,
            } : null);
            break;
          case 'seek':
            setRoomState(prev => prev ? {
              ...prev,
              currentTime: msg.currentTime,
            } : null);
            break;
          case 'add_track':
            setRoomState(prev => prev ? {
              ...prev,
              queue: [...prev.queue, msg.track],
            } : null);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      
      // Only auto-reconnect if not manually disconnected (verhindert Reconnects nach Unmount)
      if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        
        console.log(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.warn('WebSocket max reconnect attempts reached');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [roomId, userId, username]);

  useEffect(() => {
    connect(true); // Manual join - reset retry budget

    return () => {
      // Disable reconnection on cleanup (wichtig für Unmount!)
      shouldReconnectRef.current = false;
      
      // Clear pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Close WebSocket connection
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'leave',
            roomId,
            userId,
          }));
        }
        wsRef.current.close();
      }
    };
  }, [connect, roomId, userId]);

  const sendMessage = useCallback((message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'chat',
      roomId,
      userId,
      username,
      message,
    }));
  }, [roomId, userId, username]);

  const playTrack = useCallback((track: MKMediaItem, currentTime = 0) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'play',
      roomId,
      track,
      currentTime,
    }));
  }, [roomId]);

  const pause = useCallback((currentTime: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'pause',
      roomId,
      currentTime,
    }));
  }, [roomId]);

  const seek = useCallback((currentTime: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'seek',
      roomId,
      currentTime,
    }));
  }, [roomId]);

  const addTrack = useCallback((track: MKMediaItem) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'add_track',
      roomId,
      track,
    }));
  }, [roomId]);

  return {
    isConnected,
    roomState,
    messages,
    sendMessage,
    playTrack,
    pause,
    seek,
    addTrack,
  };
}
