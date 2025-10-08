// /pages/_app.js
import Head from 'next/head';
import '../styles.css';
import ReviewGate from '../components/ReviewGate';
import CookieConsent from '../components/CookieConsent';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="theme-color" content="#FFD700" />
      </Head>

      <CookieConsent /> {/* ✅ Banner cookies sempre visibile */}

      <ReviewGate>
        <Component {...pageProps} />
      </ReviewGate>
    </>
  );
}
