export interface Theme {
  name: string;
  colors: {
    primary: string; // Main brand color
    primaryHover: string;
    background: string;
    foreground: string;
    card: string;
    muted: string;
    accent: string;
  };
}

export const defaultThemes: Theme[] = [
  {
    name: 'Spotify Grün',
    colors: {
      primary: '#1DB954',
      primaryHover: '#1ED760',
      background: '#121212',
      foreground: '#FFFFFF',
      card: '#181818',
      muted: '#B3B3B3',
      accent: '#1DB954',
    },
  },
  {
    name: 'Ocean Blau',
    colors: {
      primary: '#2196F3',
      primaryHover: '#42A5F5',
      background: '#0A1929',
      foreground: '#FFFFFF',
      card: '#132F4C',
      muted: '#B2BAC2',
      accent: '#2196F3',
    },
  },
  {
    name: 'Sunset Orange',
    colors: {
      primary: '#FF6B35',
      primaryHover: '#FF8C61',
      background: '#1A1A1D',
      foreground: '#FFFFFF',
      card: '#2B2B2E',
      muted: '#C5C6C7',
      accent: '#FFB84D',
    },
  },
  {
    name: 'Purple Haze',
    colors: {
      primary: '#9C27B0',
      primaryHover: '#BA68C8',
      background: '#1A0033',
      foreground: '#FFFFFF',
      card: '#2D1B47',
      muted: '#D4C5E0',
      accent: '#CE93D8',
    },
  },
  {
    name: 'Forest Grün',
    colors: {
      primary: '#2E7D32',
      primaryHover: '#43A047',
      background: '#0D1B0F',
      foreground: '#FFFFFF',
      card: '#1B2E1F',
      muted: '#A5D6A7',
      accent: '#66BB6A',
    },
  },
];

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  // Convert hex to HSL for CSS variables
  Object.entries(theme.colors).forEach(([key, hex]) => {
    const hsl = hexToHSL(hex);
    root.style.setProperty(`--${key}`, hsl);
  });
}

function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}
