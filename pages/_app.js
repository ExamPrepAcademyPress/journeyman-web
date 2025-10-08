import '../styles.css';
import ReviewGate from '../components/ReviewGate';
import CookieConsent from '../components/CookieConsent';

export default function App({ Component, pageProps }) {
  return (
    <>
      <CookieConsent /> {/* ✅ Sempre visibile, anche prima della review */}
      <ReviewGate>
        <Component {...pageProps} />
      </ReviewGate>
    </>
  );
}
