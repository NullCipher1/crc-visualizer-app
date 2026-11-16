import type { Config } from './crc/engine';

export const DEFAULT_CONFIG: Config = { mode: 'text', data: '1101011011', gen: '10011', init: '0000', xo: '0000', refin: false, refout: false, aug: true };
export const PRESETS: [string, Partial<Config>][] = [
  ['1101011011 / 10011', {}],
  ['1011001 / 1101', { data: '1011001', gen: '1101' }],
  ['10011101 / 1011', { data: '10011101', gen: '1011' }],
  ['CRC-8/ROHC "A" (model)', { mode: 'model', data: '01000001', gen: '100000111', init: '11111111', xo: '00000000', refin: true, refout: true, aug: false }],
];
