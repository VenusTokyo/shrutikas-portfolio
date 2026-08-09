import { Gochi_Hand } from 'next/font/google';
import '../styles/globals.css';
import './index.css';
import { Analytics } from "@vercel/analytics/next"

const gochiHand = Gochi_Hand({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-gochi',
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <div
      className={`${gochiHand.variable}`}
    >
      <Component {...pageProps} />
      <Analytics />
    </div>
  );
}
