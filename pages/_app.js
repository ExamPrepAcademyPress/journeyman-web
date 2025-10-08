// /pages/_app.js
import Head from 'next/head';
import '../styles.css';
import ReviewGate from '../components/ReviewGate';
import CookieConsent from '../components/CookieConsent';

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* ✅ Meta e favicon */}
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <meta name="theme-color" content="#FFD700" />
      </Head>


      <CookieConsent /> {/* ✅ Banner cookies sempre visibile */}


      {/* ✅ ReviewGate avvolge tutto il contenuto */}

      <ReviewGate>
        <Component {...pageProps} />
      </ReviewGate>
    </>
  );
}
