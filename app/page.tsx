import Game from '@/components/Game';

export const metadata = {
  title: 'GLITCH RUNNER - Cyberpunk Endless Runner',
  description: 'Escape deletion inside a corrupted server with hand gesture controls',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    userScalable: false,
  },
};

export default function Home() {
  return (
    <main style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Game />
    </main>
  );
}
