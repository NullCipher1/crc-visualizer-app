import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// VITE_BASE is set by the GitHub Actions workflow to "/<repo-name>/".
// Locally (and for any static host) it defaults to "./", which works at any path.
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react()],
  test: { environment: 'node' },
});
