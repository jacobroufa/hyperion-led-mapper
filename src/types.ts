export type HLMKey = `hlm-${string}`;
export type HLMEventKey = `hlm-event-${string}`;

export type HLMCanvasClickEvent = [hscan: number, vscan: number];

export type AspectRatio = '1:1' | '4:3' | '16:9' | '16:10';

export type LedLayoutKey = 'hmax' | 'hmin' | 'vmax' | 'vmin';
export type LedLayout = { [k in LedLayoutKey]: number };

export type FixtureShape = 'square' | 'circle' | 'star' | 'poly' | 'custom';
export type FixtureLed = [ x: number, y: number ];

export type Fixture = {
  id: number;
  name: string;
  height: number;
  width: number;
  coords: [x: number, y: number];
  shape?: FixtureShape;
  vertices?: number;
  leds?: FixtureLed[];
  ledCount?: number;
  ledOffset?: number;
  ledPosition?: number;
};
