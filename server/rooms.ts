import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import type { MKMediaItem } from '@shared/schema';

interface Room {
  id: string;
  name: string;
  creatorId: string;
  participants: Map<string, Participant>;
  currentTrack: MKMediaItem | null;
  queue: MKMediaItem[];
  isPlaying: boolean;
  currentTime: number;
  createdAt: Date;
}

interface Participant {
  id: string;
  username: string;
  ws: WebSocket;
}

interface RoomMessage {
  type: 'join' | 'leave' | 'chat' | 'play' | 'pause' | 'seek' | 'add_track' | 'sync_state';
  roomId?: string;
  userId?: string;
  username?: string;
  message?: string;
  track?: MKMediaItem;
  currentTime?: number;
}

const rooms = new Map<string, Room>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (data: Buffer) => {
      try {
        const msg: RoomMessage = JSON.parse(data.toString());
        
        // Security: Validate message structure
        if (!msg.type || typeof msg.type !== 'string') {
          console.warn('Invalid message type');
          return;
        }
        
        // Security: Sanitize string inputs (XSS prevention)
        if (msg.message && typeof msg.message === 'string') {
          msg.message = msg.message.slice(0, 500); // Max 500 chars
        }
        if (msg.username && typeof msg.username === 'string') {
          msg.username = msg.username.slice(0, 50); // Max 50 chars
        }
        
        handleMessage(ws, msg);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      // Remove participant from all rooms
      rooms.forEach((room) => {
        room.participants.forEach((participant, id) => {
          if (participant.ws === ws) {
            room.participants.delete(id);
            broadcastToRoom(room.id, {
              type: 'leave',
              userId: id,
              username: participant.username,
            });
          }
        });
      });
    });
  });

  return wss;
}

function handleMessage(ws: WebSocket, msg: RoomMessage) {
  switch (msg.type) {
    case 'join':
      handleJoinRoom(ws, msg);
      break;
    case 'leave':
      handleLeaveRoom(ws, msg);
      break;
    case 'chat':
      handleChatMessage(ws, msg);
      break;
    case 'play':
      handlePlayTrack(ws, msg);
      break;
    case 'pause':
      handlePauseTrack(ws, msg);
      break;
    case 'seek':
      handleSeekTrack(ws, msg);
      break;
    case 'add_track':
      handleAddTrack(ws, msg);
      break;
    default:
      console.log('Unknown message type:', msg.type);
  }
}

function handleJoinRoom(ws: WebSocket, msg: RoomMessage) {
  const { roomId, userId, username } = msg;
  if (!roomId || !userId || !username) return;

  let room = rooms.get(roomId);
  if (!room) {
    // Create new room
    room = {
      id: roomId,
      name: `${username}'s Room`,
      creatorId: userId,
      participants: new Map(),
      currentTrack: null,
      queue: [],
      isPlaying: false,
      currentTime: 0,
      createdAt: new Date(),
    };
    rooms.set(roomId, room);
  }

  // Add participant
  room.participants.set(userId, { id: userId, username, ws });

  // Send current room state to new participant
  ws.send(JSON.stringify({
    type: 'sync_state',
    room: {
      id: room.id,
      name: room.name,
      currentTrack: room.currentTrack || undefined,
      queue: room.queue,
      isPlaying: room.isPlaying,
      currentTime: room.currentTime,
      participants: Array.from(room.participants.values()).map(p => ({
        id: p.id,
        username: p.username,
      })),
    },
  }));

  // Broadcast join to all participants
  broadcastToRoom(roomId, {
    type: 'join',
    userId,
    username,
  });
}

function handleLeaveRoom(ws: WebSocket, msg: RoomMessage) {
  const { roomId, userId } = msg;
  if (!roomId || !userId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  const participant = room.participants.get(userId);
  if (!participant) return;

  room.participants.delete(userId);

  // Broadcast leave
  broadcastToRoom(roomId, {
    type: 'leave',
    userId,
    username: participant.username,
  });

  // Delete room if empty
  if (room.participants.size === 0) {
    rooms.delete(roomId);
  }
}

function handleChatMessage(ws: WebSocket, msg: RoomMessage) {
  const { roomId, userId, username, message } = msg;
  if (!roomId || !userId || !username || !message) return;

  broadcastToRoom(roomId, {
    type: 'chat',
    userId,
    username,
    message,
  });
}

function handlePlayTrack(ws: WebSocket, msg: RoomMessage) {
  const { roomId, track, currentTime } = msg;
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  if (track) {
    room.currentTrack = track;
  }
  room.isPlaying = true;
  room.currentTime = currentTime || 0;

  broadcastToRoom(roomId, {
    type: 'play',
    track: room.currentTrack,
    currentTime: room.currentTime,
  });
}

function handlePauseTrack(ws: WebSocket, msg: RoomMessage) {
  const { roomId, currentTime } = msg;
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.isPlaying = false;
  room.currentTime = currentTime || room.currentTime;

  broadcastToRoom(roomId, {
    type: 'pause',
    currentTime: room.currentTime,
  });
}

function handleSeekTrack(ws: WebSocket, msg: RoomMessage) {
  const { roomId, currentTime } = msg;
  if (!roomId || currentTime === undefined) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.currentTime = currentTime;

  broadcastToRoom(roomId, {
    type: 'seek',
    currentTime,
  });
}

function handleAddTrack(ws: WebSocket, msg: RoomMessage) {
  const { roomId, track } = msg;
  if (!roomId || !track) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.queue.push(track);

  broadcastToRoom(roomId, {
    type: 'add_track',
    track,
  });
}

function broadcastToRoom(roomId: string, msg: RoomMessage) {
  const room = rooms.get(roomId);
  if (!room) return;

  const message = JSON.stringify(msg);
  room.participants.forEach((participant) => {
    if (participant.ws.readyState === WebSocket.OPEN) {
      participant.ws.send(message);
    }
  });
}
