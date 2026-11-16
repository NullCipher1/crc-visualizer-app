const THEORY: [string, string][] = [
  ['What is CRC?', 'A Cyclic Redundancy Check appends a short checksum, computed by polynomial division over bits, to a message.'],
  ['Why is it used?', 'It detects accidental corruption (noise) in networks, disks and files, cheaply in hardware and software.'],
  ['Generator polynomial', 'A fixed binary divisor such as 10011 = x⁴+x+1. A generator of n bits yields an (n−1)-bit CRC.'],
  ['Modulo-2 arithmetic', 'Addition and subtraction are the same operation and have no carries or borrows.'],
  ['XOR', 'Bit-wise exclusive OR: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. It is modulo-2 add/subtract.'],
  ['CRC remainder', 'Append (n−1) zeros to the data and divide by G. The remainder is the CRC.'],
  ['Codeword', 'Data followed by its CRC. By construction it is exactly divisible by G.'],
  ['Error detection & syndrome', 'The receiver divides the frame by G. The remainder is the syndrome: 0 means no error found, non-zero means corruption.'],
];

export function Home({ onStart }: { onStart: () => void }) {
  return (
    <div className="pn fade" style={{ maxWidth: 760, margin: '20px auto' }}>
      <h1 className="text-3xl font-bold" style={{ color: 'var(--ac)' }}>CRC Algorithm Visualizer</h1>
      <p style={{ margin: '10px 0' }}>Define your own dataword and generator polynomial, then watch every modulo-2 XOR, every divisor shift and the final CRC being produced, step by step. Verify a received codeword and see the syndrome.</p>
      <p className="hint" style={{ marginBottom: 14 }}>Two clearly separated models: the <b>textbook</b> augmented division, and a <b>configurable CRC model</b> with init, RefIn, RefOut and final XOR.</p>
      <button className="btn p" onClick={onStart}>Open the visualizer →</button>
    </div>
  );
}
export function Learn() {
  return (
    <div className="grid gap-3 md:grid-cols-2 fade" style={{ maxWidth: 1000, margin: '16px auto', padding: '0 12px' }}>
      {THEORY.map(([a, b]) => (<div className="pn" key={a}><b style={{ color: 'var(--ac)' }}>{a}</b><p>{b}</p></div>))}
    </div>
  );
}
export function About() {
  return (
    <div className="pn fade" style={{ maxWidth: 760, margin: '20px auto' }}>
      <b>Conventions used</b>
      <p className="hint" style={{ fontSize: 13, marginTop: 6 }}>
        <b>Textbook:</b> data + (n−1) zeros ÷ G, remainder appended; the receiver divides the frame and expects syndrome 0.<br />
        <b>Model:</b> RefIn reverses bits inside each byte (a trailing partial group on its own), RefOut reverses the final CRC, XorOut is applied last. Augmented ON XORs Init into the first bits of the augmented message; OFF uses the shift register. Both give the same CRC. Because RefOut/XorOut break the zero-remainder property, the model receiver recomputes the CRC and compares it.<br />
        Check value: "123456789" with CRC-8 (poly 07, all other parameters 0) gives F4.
      </p>
    </div>
  );
}
