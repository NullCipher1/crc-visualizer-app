import { useEffect, useState } from 'react';

export type View = 'home' | 'viz' | 'learn' | 'about';
export const VIEWS: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'viz', label: 'Visualizer' },
  { id: 'learn', label: 'Learn CRC' },
  { id: 'about', label: 'About' },
];
const read = (): View => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return VIEWS.find((v) => v.id === h)?.id ?? 'home';
};

/** Hash routing (#/viz): works on GitHub Pages and any static host, no server rewrites or 404.html needed. */
export function useHashRoute(): [View, (v: View) => void] {
  const [view, setView] = useState<View>(read);
  useEffect(() => {
    const f = () => setView(read());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return [view, (v) => { window.location.hash = '/' + v; }];
}
