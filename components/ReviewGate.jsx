// /components/ReviewGate.jsx — show ONCE PER SESSION across all pages
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SESSION_KEY = 'review_ack_session_v1'; // change version to force re-ask for everyone

export default function ReviewGate({ children }) {
  const router = useRouter();
  const reviewUrl = process.env.NEXT_PUBLIC_REVIEW_URL;

  const [ack, setAck] = useState(false);
  const [ready, setReady] = useState(false);

  // On first load, check sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAck = !!sessionStorage.getItem(SESSION_KEY);
      setAck(hasAck);
      setReady(true);
    }
  }, []);

  // On route changes, keep gate hidden if already acknowledged this session.
  // If NOT acknowledged, the gate remains visible on every page.
  useEffect(() => {
    const handleRouteStart = () => {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        // not acknowledged yet => keep gate active on every page
        setAck(false);
      }
    };
    router.events.on('routeChangeStart', handleRouteStart);
    return () => router.events.off('routeChangeStart', handleRouteStart);
  }, [router.events]);

  function acknowledge() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAck(true);
    }
  }

  if (!ready) return null;
  if (ack) return children;

  return (
    <main style={{ maxWidth: 720, margin: '40px auto' }}>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Before you start: a quick favor 🙏</h2>
        <p>
          We’re a small team building resources to help apprentices pass the Journeyman exam.
          Honest reviews are crucial: they help other electricians decide if this book is worth their time,
          and they motivate us to keep improving. If our book helped you even a bit, would you please leave a short, honest review?
        </p>
        <ul className="muted" style={{ marginTop: 0 }}>
          <li>Be honest — praise and criticism both help.</li>
          <li>One or two sentences are enough.</li>
          <li>If something was unclear, say it: we’ll fix it.</li>
        </ul>

        <div style={{ display: 'flex', gap: 10, flexWrap:'wrap' }}>
          <button
            className="btn"
            onClick={() => {
              if (reviewUrl) window.open(reviewUrl, '_blank', 'noopener,noreferrer');
              else alert('Set NEXT_PUBLIC_REVIEW_URL in .env.local to open the review page.');
            }}
          >
            Leave a review now
          </button>

          <button className="btn secondary" onClick={acknowledge}>
            I already left a review
          </button>
        </div>

        {reviewUrl && <div className="muted small">The review page will open in a new tab.</div>}
      </div>
    </main>
  );
}
