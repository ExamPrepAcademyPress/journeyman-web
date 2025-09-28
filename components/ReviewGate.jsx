// /components/ReviewGate.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SESSION_KEY = 'review_ack_session_v1'; // change version to re-ask all users

export default function ReviewGate({ children }) {
  const router = useRouter();
  const reviewUrl = process.env.NEXT_PUBLIC_REVIEW_URL;
  const [ack, setAck] = useState(false);
  const [ready, setReady] = useState(false);

  // ✅ Allow access to cookie policy even if not acknowledged
  const isCookiePage = router.pathname === '/cookie-policy';

  // Check on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAck = !!sessionStorage.getItem(SESSION_KEY);
      setAck(hasAck);
      setReady(true);
    }
  }, []);

  // Keep gate state when navigating
  useEffect(() => {
    const handleRouteStart = () => {
      if (!sessionStorage.getItem(SESSION_KEY)) {
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

  // ✅ Allow viewing /cookie-policy even without ack
  if (!ready) return null;
  if (ack || isCookiePage) return children;

  // GATE content
  return (
    <main className="content">
      <div className="left">
        <h2>Before you start: a quick favor 🙏</h2>
        <p style={{ textAlign: 'justify' }}>
          We’re a small team building resources to help apprentices pass the Journeyman exam.
          Honest reviews are crucial: they help other electricians decide if this book is worth their time,
          and they motivate us to keep improving. If our book helped you even a bit, would you please leave a short, honest review?
        </p>

        <ul className="muted" style={{ marginTop: 0 }}>
          <li>Be honest — praise and criticism both help.</li>
          <li>One or two sentences are enough.</li>
          <li>If something was unclear, say it: we’ll fix it.</li>
        </ul>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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

        {reviewUrl && <div className="muted small" style={{ marginTop: '12px' }}>The review page will open in a new tab.</div>}
      </div>

      <div className="right imageContainer">
        <Image
          src="/img/COVER_REV.jpg"
          alt="Review illustration"
          width={800}
          height={1200}
          priority
          style={{ display: 'block', objectFit: 'contain' }}
          onClick={() => {
            if (reviewUrl) window.open(reviewUrl, '_blank', 'noopener,noreferrer');
          }}
        />
      </div>

      <style jsx>{`
        main.content {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 3px solid #FFD700;
          border-radius: 12px;
          padding: 20px;
        }

        .left {
          flex: 1;
          padding: 20px;
          color: white;
        }

        .right {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn {
          background: #FFD700;
          color: black;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn:hover {
          background: #E6C200;
        }

        .btn.secondary {
          background: transparent;
          border: 2px solid #FFD700;
          color: #FFD700;
        }

        .muted {
          color: #ccc;
          font-size: 0.9rem;
        }

        @media (max-width: 1023px) {
          main.content {
            flex-direction: column;
            text-align: center;
          }
          .left, .right {
            padding: 10px;
          }
          .imageContainer img {
            max-width: 65% !important;
          }
        }
      `}</style>
    </main>
  );
}
