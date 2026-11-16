import type { ChangeEvent } from 'react';
import type { Phase, Step } from '../crc/engine';

type Props = {
  k: number; steps: Step[]; play: boolean; speed: number;
  onPrev: () => void; onNext: () => void; onReset: () => void; onToggle: () => void;
  onSpeed: (n: number) => void; onJump: (i: number) => void;
};
const color = (p: Phase) => (p === 'rx' ? 'var(--g)' : p === 'rem' || p === 'code' ? 'var(--r)' : p === 'div' ? 'var(--x)' : 'var(--z)');

export function Controls({ k, steps, play, speed, onPrev, onNext, onReset, onToggle, onSpeed, onJump }: Props) {
  const N = steps.length;
  return (
    <div className="pn lg:col-span-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button className="btn" disabled={k <= 0} onClick={onPrev}>◀ Previous</button>
        <button className="btn p" disabled={!N} onClick={onToggle}>{play ? '❚❚ Pause' : '▶ Play'}</button>
        <button className="btn" disabled={k >= N - 1} onClick={onNext}>Next ▶</button>
        <button className="btn" onClick={onReset}>↺ Reset</button>
        <b style={{ fontFamily: 'ui-monospace,monospace' }}>Step {N ? k + 1 : 0} of {N}</b>
        <label className="ml-auto hint">Speed <input type="range" min={1} max={5} value={speed} onChange={(e: ChangeEvent<HTMLInputElement>) => onSpeed(+e.target.value)} /></label>
      </div>
      <div className="bar" style={{ margin: '10px 0' }}><i style={{ width: (N ? ((k + 1) / N) * 100 : 0) + '%' }} /></div>
      <div className="flex flex-wrap gap-1">
        {steps.map((x, i) => (
          <button key={i} className="tl" title={`${i + 1}. ${x.title}`} onClick={() => onJump(i)}
            style={{ borderColor: color(x.ph), color: color(x.ph), background: i <= k ? 'currentColor' : 'transparent', outline: i === k ? '2px solid var(--ac)' : 'none', outlineOffset: 2 }} />
        ))}
      </div>
    </div>
  );
}
