import type { AspectRatio, HLMKey } from './types';

export const defaultKey: HLMKey = 'hlm-null';

export const ratioMultiplier: { [k in AspectRatio]: number } = {
  '1:1': 1,
  '4:3': 0.75,
  '16:10': 0.625,
  '16:9': 0.5625
}