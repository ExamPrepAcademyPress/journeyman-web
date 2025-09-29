// /pages/_app.js
import '../styles.css';
import ReviewGate from '../components/ReviewGate';

export default function App({ Component, pageProps }) {
  return (
    <ReviewGate>
      <Component {...pageProps} />
    </ReviewGate>
  );
}
