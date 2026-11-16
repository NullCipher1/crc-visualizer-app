# CRC Algorithm Visualizer

Interactive, step-by-step visualizer for Cyclic Redundancy Check (CRC). Enter your own dataword and generator polynomial and watch every modulo-2 XOR, divisor shift and intermediate dividend, then verify a received codeword (click bits to inject errors).

Two clearly separated models:

- **Textbook**: augmented modulo-2 division (append n−1 zeros, divide, append the remainder). Init 0, no reflection, no final XOR. The receiver divides the whole frame and expects a zero syndrome.
- **CRC model**: configurable Init, Final XOR, RefIn, RefOut and Augmentation (augmented division, or the shift-register method; both give the same CRC). The receiver recomputes the CRC over the data and compares it.

Stack: React 18, TypeScript, Vite, Tailwind CSS 3, Vitest. The CRC logic (`src/crc/engine.ts`) has no UI imports.

## Run locally

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd crc-visualizer-app
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm test` | Unit tests (textbook examples, standard CRC-8 check values, receiver checks) |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Deploy to GitHub Pages

1. Push to `main`.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow `.github/workflows/deploy.yml` typechecks, tests, builds with `VITE_BASE=/<repo-name>/` and deploys. The site appears at `https://<user>.github.io/<repo-name>/`.

The Vite `base` defaults to `./` (works on any static host such as Netlify, Cloudflare Pages or Vercel). Navigation uses hash routes (`#/viz`, `#/learn`, `#/about`), so refreshing or deep-linking never needs server rewrites or a `404.html`.

## Structure

```
src/crc/engine.ts        pure CRC engine + step generation
src/crc/engine.test.ts   unit tests
src/components/          InputPanel, Rows, Controls, ResultPanels, Pages
src/hooks/useHashRoute.ts
src/App.tsx, main.tsx, presets.ts, index.css
```
