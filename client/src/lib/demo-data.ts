import type { MKMediaItem } from '@shared/schema';

export const demoTracks: MKMediaItem[] = [
  {
    id: '1',
    type: 'songs',
    attributes: {
      name: 'Bohemian Rhapsody',
      artistName: 'Queen',
      albumName: 'A Night at the Opera',
      artwork: {
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      durationInMillis: 354000,
      genreNames: ['Rock'],
      releaseDate: '1975',
      trackNumber: 11,
    },
  },
  {
    id: '2',
    type: 'songs',
    attributes: {
      name: 'Hotel California',
      artistName: 'Eagles',
      albumName: 'Hotel California',
      artwork: {
        url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      durationInMillis: 391000,
      genreNames: ['Rock'],
      releaseDate: '1976',
      trackNumber: 1,
    },
  },
  {
    id: '3',
    type: 'songs',
    attributes: {
      name: 'Stairway to Heaven',
      artistName: 'Led Zeppelin',
      albumName: 'Led Zeppelin IV',
      artwork: {
        url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      durationInMillis: 482000,
      genreNames: ['Rock'],
      releaseDate: '1971',
      trackNumber: 4,
    },
  },
  {
    id: '4',
    type: 'songs',
    attributes: {
      name: 'Imagine',
      artistName: 'John Lennon',
      albumName: 'Imagine',
      artwork: {
        url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      durationInMillis: 183000,
      genreNames: ['Pop', 'Rock'],
      releaseDate: '1971',
      trackNumber: 1,
    },
  },
  {
    id: '5',
    type: 'songs',
    attributes: {
      name: 'Billie Jean',
      artistName: 'Michael Jackson',
      albumName: 'Thriller',
      artwork: {
        url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      durationInMillis: 294000,
      genreNames: ['Pop'],
      releaseDate: '1982',
      trackNumber: 6,
    },
  },
  {
    id: '6',
    type: 'songs',
    attributes: {
      name: 'Sweet Child O\' Mine',
      artistName: 'Guns N\' Roses',
      albumName: 'Appetite for Destruction',
      artwork: {
        url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      durationInMillis: 356000,
      genreNames: ['Rock'],
      releaseDate: '1987',
      trackNumber: 9,
    },
  },
];

export const demoAlbums: MKMediaItem[] = [
  {
    id: 'album-1',
    type: 'albums',
    attributes: {
      name: 'A Night at the Opera',
      artistName: 'Queen',
      artwork: {
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      genreNames: ['Rock'],
      releaseDate: '1975',
    },
  },
  {
    id: 'album-2',
    type: 'albums',
    attributes: {
      name: 'Thriller',
      artistName: 'Michael Jackson',
      artwork: {
        url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      genreNames: ['Pop'],
      releaseDate: '1982',
    },
  },
  {
    id: 'album-3',
    type: 'albums',
    attributes: {
      name: 'The Dark Side of the Moon',
      artistName: 'Pink Floyd',
      artwork: {
        url: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      genreNames: ['Progressive Rock'],
      releaseDate: '1973',
    },
  },
  {
    id: 'album-4',
    type: 'albums',
    attributes: {
      name: 'Abbey Road',
      artistName: 'The Beatles',
      artwork: {
        url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      genreNames: ['Rock'],
      releaseDate: '1969',
    },
  },
  {
    id: 'album-5',
    type: 'albums',
    attributes: {
      name: 'Back in Black',
      artistName: 'AC/DC',
      artwork: {
        url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      genreNames: ['Hard Rock'],
      releaseDate: '1980',
    },
  },
  {
    id: 'album-6',
    type: 'albums',
    attributes: {
      name: 'Rumours',
      artistName: 'Fleetwood Mac',
      artwork: {
        url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
      genreNames: ['Rock'],
      releaseDate: '1977',
    },
  },
];

export const demoPlaylists: MKMediaItem[] = [
  {
    id: 'playlist-1',
    type: 'playlists',
    attributes: {
      name: 'Rock Classics',
      artistName: 'GlassBeats',
      artwork: {
        url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
    },
  },
  {
    id: 'playlist-2',
    type: 'playlists',
    attributes: {
      name: 'Chill Vibes',
      artistName: 'GlassBeats',
      artwork: {
        url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
    },
  },
  {
    id: 'playlist-3',
    type: 'playlists',
    attributes: {
      name: 'Workout Mix',
      artistName: 'GlassBeats',
      artwork: {
        url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w={w}&h={h}&fit=crop',
        width: 400,
        height: 400,
      },
    },
  },
];
