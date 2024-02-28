export type HLMStorageKey = `hlm-${string}`;

export type AspectRatio = '1:1' | '4:3' | '16:9' | '16:10';

export type LedLayoutKey = 'hmax' | 'hmin' | 'vmax' | 'vmin';
export type LedLayout = { [k in LedLayoutKey]: number };

export type Fixture = {
  id: number;
  name: string;
  height: number;
  width: number;
  coords: [number, number];
  leds?: LedLayout[];
};
