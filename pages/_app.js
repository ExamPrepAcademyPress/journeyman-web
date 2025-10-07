// /pages/_app.js
import '../styles.css';
import Head from 'next/head';
import ReviewGate from '../components/ReviewGate';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="theme-color" content="#FFD700" />
      </Head>
      <ReviewGate>
        <Component {...pageProps} />
      </ReviewGate>
    </>
  );
}

