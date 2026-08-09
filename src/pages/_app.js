import { Playfair_Display, Caveat, EB_Garamond, Kalam, Gochi_Hand } from 'next/font/google';
import '../styles/globals.css';
import './index.css';

const playfair = Playfair_Display({
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const caveat = Caveat({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const garamond = EB_Garamond({
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
});

const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-kalam',
  display: 'swap',
});

const gochiHand = Gochi_Hand({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-gochi',
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <div
      className={`${playfair.variable} ${caveat.variable} ${garamond.variable} ${kalam.variable} ${gochiHand.variable}`}
    >
      <Component {...pageProps} />
    </div>
  );
}
