import { useEffect, useMemo, useRef, useState } from 'react';
import { PH, S, build, validate, type BuildOk, type Config } from './crc/engine';
import { DEFAULT_CONFIG } from './presets';
import { useHashRoute, VIEWS } from './hooks/useHashRoute';
import { InputPanel } from './components/InputPanel';
import { Controls } from './components/Controls';
import { ResultPanels } from './components/ResultPanels';
import { Rows } from './components/Rows';
import { About, Home, Learn } from './components/Pages';

const DELAYS = [2200, 1500, 950, 550, 250];
const LEGEND: [string, string][] = [['d', 'data'], ['g', 'generator'], ['w x', 'active XOR'], ['z', 'appended zeros'], ['r', 'CRC'], ['bad', 'error']];

export default function App() {
  const [view, go] = useHashRoute();
  const [cfg, setCfg] = useState<Config>(DEFAULT_CONFIG);
  const [run, setRun] = useState<Config | null>(null);
  const [rx, setRx] = useState('');
  const [k, setK] = useState(0);
  const [play, setPlay] = useState(false);
  const [speed, setSpeed] = useState(3);
  const ref = useRef<HTMLDivElement>(null);

  const errs = useMemo(() => validate(cfg), [cfg]);
  const built = useMemo(() => (run ? build(run, rx) : null), [run, rx]);
  const res: BuildOk | null = built && 'st' in built ? built : null;
  const N = res ? res.st.length : 0;
  const kk = Math.min(k, Math.max(N - 1, 0));
  const s = res ? res.st[kk] : null;

  const calc = (c: Config) => {
    const r = build(c, '');
    if (!('st' in r)) return;
    setRun({ ...c }); setRx(S(r.cw)); setK(0); setPlay(false);
  };
  useEffect(() => { calc(DEFAULT_CONFIG); }, []);
  useEffect(() => {
    if (!play) return;
    if (kk >= N - 1) { setPlay(false); return; }
    const t = setTimeout(() => setK(kk + 1), DELAYS[speed - 1]);
    return () => clearTimeout(t);
  }, [play, kk, speed, N]);
  useEffect(() => {
    ref.current?.querySelector('.w')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [kk, run]);

  const change = (p: Partial<Config>) => setCfg((c) => {
    const n = { ...c, ...p };
    if (p.gen !== undefined && /^[01]{2,}$/.test(n.gen)) {
      const W = n.gen.length - 1;
      (['init', 'xo'] as const).forEach((f) => { if (/^(0+|1+)$/.test(n[f])) n[f] = n[f][0].repeat(W); });
    }
    return n;
  });
  const flip = (i: number) => {
    const a = rx.split(''); a[i] = a[i] === '1' ? '0' : '1'; setRx(a.join(''));
    const ix = res ? res.st.findIndex((x) => x.ph === 'rx') : -1;
    if (ix >= 0) setK(ix);
    setPlay(false);
  };

  const viz = (
    <div className="grid gap-3 lg:grid-cols-[290px_minmax(0,1fr)_320px]" style={{ maxWidth: 1500, margin: '0 auto', padding: 12 }}>
      <InputPanel cfg={cfg} errs={errs} onChange={change} onCalc={() => calc(cfg)} onReset={() => { setCfg(DEFAULT_CONFIG); calc(DEFAULT_CONFIG); }}
        onPreset={(p) => { const c = { ...DEFAULT_CONFIG, ...p }; setCfg(c); calc(c); }} />
      <div className="pn" style={{ overflow: 'hidden' }}>
        <div className="flex justify-between items-center flex-wrap gap-2"><b>Live binary division</b>{s && <span className="bd">{PH[s.ph]}</span>}</div>
        <div className="hint" style={{ margin: '6px 0' }}>
          {LEGEND.map(([c, l]) => (<span key={c} style={{ marginRight: 10 }}><span className={'c ' + c} style={{ minWidth: 14, height: 14 }} /> {l}</span>))}
        </div>
        {s ? (
          <div ref={ref} style={{ overflowX: 'auto', padding: '4px 2px' }}>
            <div key={kk} className="fade"><div style={{ fontWeight: 700, marginBottom: 4 }}>{s.title}</div><Rows rows={s.rows} /></div>
          </div>
        ) : <div className="er" style={{ marginTop: 10 }}>Fix the highlighted inputs, then press Calculate CRC.</div>}
      </div>
      <div className="pn">
        <b>Explanation</b>
        {s && (
          <div key={kk} className="fade">
            <div className="hint" style={{ margin: '4px 0' }}>Step {kk + 1} of {N}</div>
            {([['What', s.t.what], ['Why', s.t.why], ['Bits', s.t.bits], ['Result', s.t.result], ['Next', s.t.next ?? '']] as const).map(([a, b]) => (
              <div key={a} style={{ margin: '6px 0' }}>
                <span className="lab" style={{ margin: 0 }}>{a}</span>
                <span style={a === 'Bits' || a === 'Result' ? { fontFamily: 'ui-monospace,monospace', wordBreak: 'break-all' } : undefined}>{b}</span>
              </div>
            ))}
          </div>
        )}
        <span className="lab">Algorithm status</span>
        {(Object.keys(PH) as (keyof typeof PH)[]).map((p) => (
          <div key={p} style={{ color: s?.ph === p ? 'var(--ac)' : 'var(--mu)', fontWeight: s?.ph === p ? 700 : 400 }}>{s?.ph === p ? '▶' : '○'} {PH[p]}</div>
        ))}
      </div>
      <Controls k={kk} steps={res ? res.st : []} play={play} speed={speed}
        onPrev={() => { setPlay(false); setK(kk - 1); }} onNext={() => { setPlay(false); setK(kk + 1); }}
        onReset={() => { setPlay(false); setK(0); }} onToggle={() => { if (kk >= N - 1) setK(0); setPlay(!play); }}
        onSpeed={setSpeed} onJump={(i) => { setPlay(false); setK(i); }} />
      {res && run && <ResultPanels res={res} run={run} rx={rx} onRx={setRx} onFlip={flip} onRestore={() => { setRx(S(res.cw)); setK(0); }} />}
    </div>
  );

  return (
    <div>
      <header className="flex items-center gap-3 flex-wrap" style={{ padding: '12px 16px', borderBottom: '1px solid var(--bd)' }}>
        <b style={{ fontSize: 17, color: 'var(--ac)' }}>⌗ CRC Algorithm Visualizer</b>
        <nav className="flex gap-1 ml-auto">
          {VIEWS.map((v) => (<button key={v.id} className={view === v.id ? 'on' : ''} onClick={() => go(v.id)}>{v.label}</button>))}
        </nav>
      </header>
      {view === 'home' ? <Home onStart={() => go('viz')} /> : view === 'learn' ? <Learn /> : view === 'about' ? <About /> : viz}
    </div>
  );
}
