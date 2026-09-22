import { Gochi_Hand } from 'next/font/google';
import '../styles/globals.css';
import './index.css';
import { Analytics } from '@vercel/analytics/next';

const gochiHand = Gochi_Hand({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-gochi',
  display: 'swap',
});

// The wrapper carries an id because it is a portal target. next/font scopes
// --font-gochi to whatever element holds its class, and that class cannot be put
// on <html> because next/font is not supported in _document — so anything
// portalled into document.body lands outside the font and renders in the
// fallback instead of the handwriting.
export default function App({ Component, pageProps }) {
  return (
    <div
      id="scrapbook-root"
      className={`${gochiHand.variable}`}
    >
      <Component {...pageProps} />
      <Analytics />
    </div>
  );
}
