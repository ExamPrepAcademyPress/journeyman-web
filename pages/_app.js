// /pages/_app.js
import '../styles.css';
import Head from 'next/head';
import ReviewGate from '../components/ReviewGate';
import CookieConsent from '../components/CookieConsent'; // ✅ aggiunto

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="theme-color" content="#FFD700" />
      </Head>

      {/* ✅ Banner cookie al pari del ReviewGate */}
      <CookieConsent />

      {/* ✅ Il ReviewGate continua a proteggere tutto */}
      <ReviewGate>
        <Component {...pageProps} />
      </ReviewGate>
    </>
  );
}
