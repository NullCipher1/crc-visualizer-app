import type { Row } from '../crc/engine';

export function Rows({ rows }: { rows: Row[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <div className="rw" key={i}>
          <span className="rl">{r.l}</span>
          {r.cells.map((c, j) => (
            <span key={j} className={'c ' + c.c}>{c.v}</span>
          ))}
        </div>
      ))}
    </>
  );
}
