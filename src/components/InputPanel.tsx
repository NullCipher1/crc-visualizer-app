import type { ChangeEvent, ReactNode } from 'react';
import type { Config } from '../crc/engine';
import { PRESETS } from '../presets';

type Props = {
  cfg: Config;
  errs: [string, string][];
  onChange: (p: Partial<Config>) => void;
  onCalc: () => void;
  onReset: () => void;
  onPreset: (p: Partial<Config>) => void;
};

function Field({ label, hint, err, children }: { label: string; hint: string; err?: string; children: ReactNode }) {
  return (
    <div>
      <span className="lab">{label}</span>
      {children}
      {err ? <div className="er">{err}</div> : <div className="hint">{hint}</div>}
    </div>
  );
}

export function InputPanel({ cfg, errs, onChange, onCalc, onReset, onPreset }: Props) {
  const T = cfg.mode === 'text';
  const W = cfg.gen.length - 1;
  const er = (f: string) => errs.find((x) => x[0] === f)?.[1];
  const txt = (f: 'data' | 'gen' | 'init' | 'xo') => ({
    type: 'text' as const,
    className: er(f) ? 'bad' : '',
    value: cfg[f],
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange({ [f]: e.target.value.trim() }),
  });
  const chk = (f: 'refin' | 'refout' | 'aug', label: string) => (
    <label>
      <input type="checkbox" checked={cfg[f]} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ [f]: e.target.checked })} /> {label}
    </label>
  );
  return (
    <div className="pn">
      <b>CRC configuration</b>
      <div className="flex gap-2 mt-2">
        <button className={'btn flex-1 ' + (T ? 'on' : '')} onClick={() => onChange({ mode: 'text' })}>Textbook</button>
        <button className={'btn flex-1 ' + (!T ? 'on' : '')} onClick={() => onChange({ mode: 'model' })}>CRC model</button>
      </div>
      <div className="hint" style={{ marginTop: 4 }}>
        {T ? 'Augmented modulo-2 division. Init 0, no reflection, no final XOR.' : 'Rocksoft-style model with Init, RefIn, RefOut, XorOut.'}
      </div>
      <Field label="Dataword / message" hint="Binary, up to 96 bits" err={er('data')}><input {...txt('data')} /></Field>
      <Field label="Generator polynomial" hint={`Binary incl. leading 1. CRC width = ${W > 0 ? W : '?'} bits (auto)`} err={er('gen')}><input {...txt('gen')} /></Field>
      {!T && (
        <>
          <Field label="Initial register value" hint={`${W} bits, start value of the register`} err={er('init')}><input {...txt('init')} /></Field>
          <Field label="Final XOR value" hint={`${W} bits, XORed into the result`} err={er('xo')}><input {...txt('xo')} /></Field>
          <div className="mt-3 grid gap-1">
            {chk('refin', 'RefIn: reflect input bytes')}
            {chk('refout', 'RefOut: reflect output CRC')}
            {chk('aug', 'Augmentation (append zeros)')}
          </div>
        </>
      )}
      <span className="lab">Examples</span>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map(([n, p]) => (
          <button key={n} className="btn" style={{ fontSize: 12 }} onClick={() => onPreset(p)}>{n}</button>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button className="btn p flex-1" disabled={errs.length > 0} onClick={onCalc}>Calculate CRC</button>
        <button className="btn" onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}
