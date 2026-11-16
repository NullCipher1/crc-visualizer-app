import { describe, it, expect } from 'vitest';
import { build, validate, type Config, type BuildOk } from './engine';

const asBits = (s: string) => [...s].map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
const hex = (a: number[]) => parseInt(a.join(''), 2).toString(16).toUpperCase();
const text = (data: string, gen: string): Config => ({ mode: 'text', data, gen, init: '', xo: '', refin: false, refout: false, aug: true });
const model = (o: Partial<Config>): Config => ({ mode: 'model', data: asBits('123456789'), gen: '100000111', init: '00000000', xo: '00000000', refin: false, refout: false, aug: true, ...o });
const ok = (c: Config, rx = ''): BuildOk => { const r = build(c, rx); if (!('st' in r)) throw new Error('invalid'); return r; };

describe('textbook CRC', () => {
  it('matches worked examples', () => {
    expect(ok(text('1101011011', '10011')).crc.join('')).toBe('1110');
    expect(ok(text('1011001', '1101')).crc.join('')).toBe('110');
    expect(ok(text('10011101', '1011')).crc.join('')).toBe('011');
  });
  it('accepts intact frames and rejects a flipped bit', () => {
    const cw = ok(text('1101011011', '10011')).cw.join('');
    expect(ok(text('1101011011', '10011'), cw).v?.ok).toBe(true);
    expect(ok(text('1101011011', '10011'), cw.slice(0, 2) + '1' + cw.slice(3)).v?.ok).toBe(false);
  });
});
describe('configurable CRC model (check value of "123456789")', () => {
  it.each([
    ['SMBUS', {}, 'F4'],
    ['ROHC', { init: '11111111', refin: true, refout: true }, 'D0'],
    ['MAXIM', { gen: '100110001', refin: true, refout: true }, 'A1'],
  ])('%s, both methods agree', (_n, o, exp) => {
    expect(hex(ok(model(o as Partial<Config>)).crc)).toBe(exp);
    expect(hex(ok(model({ ...(o as Partial<Config>), aug: false })).crc)).toBe(exp);
  });
  it('model receiver detects corruption', () => {
    const c = model({ data: '01000001', init: '11111111', refin: true, refout: true, aug: false });
    const cw = ok(c).cw.join('');
    expect(ok(c, cw).v?.ok).toBe(true);
    expect(ok(c, cw.slice(0, -1) + (cw.endsWith('1') ? '0' : '1')).v?.ok).toBe(false);
  });
});
describe('validation', () => {
  it('rejects bad input', () => {
    expect(validate(text('12', '0')).length).toBe(2);
    expect('e' in build(text('', '1'), '')).toBe(true);
  });
});
