import type { ChangeEvent } from 'react';
import type { BuildOk, Config } from '../crc/engine';

type Props = { res: BuildOk; run: Config; rx: string; onRx: (s: string) => void; onFlip: (i: number) => void; onRestore: () => void };

export function ResultPanels({ res, run, rx, onRx, onFlip, onRestore }: Props) {
  const crc = res.crc.join('');
  const valid = /^[01]+$/.test(rx);
  const same = rx.length === res.cw.length;
  return (
    <>
      <div className="pn">
        <span className="lab" style={{ marginTop: 0 }}>CRC remainder</span>
        <div className="res ok">{crc}</div>
        <span className="lab">Transmitted codeword</span>
        <div className="res" style={{ border: '1px solid var(--bd)' }}>
          <span style={{ color: 'var(--d)' }}>{run.data}</span><span style={{ color: 'var(--r)' }}>{crc}</span>
        </div>
      </div>
      <div className="pn lg:col-span-2">
        <span className="lab" style={{ marginTop: 0 }}>Error detection: received codeword (click a bit to flip it)</span>
        <input type="text" value={rx} onChange={(e: ChangeEvent<HTMLInputElement>) => onRx(e.target.value.trim())} />
        <div className="flex flex-wrap gap-1 my-2">
          {valid && rx.split('').map((b, i) => (
            <span key={i} onClick={() => onFlip(i)} style={{ cursor: 'pointer' }}
              className={'c ' + (same && b !== String(res.cw[i]) ? 'bad' : i < rx.length - res.W ? 'd' : 'r')}>{b}</span>
          ))}
          <button className="btn" style={{ marginLeft: 8 }} onClick={onRestore}>Restore sent codeword</button>
        </div>
        {res.v ? <div className={'res ' + (res.v.ok ? 'ok' : 'no')}>{res.v.msg}</div> : <div className="er">Enter a binary frame longer than {res.W} bits.</div>}
      </div>
    </>
  );
}
