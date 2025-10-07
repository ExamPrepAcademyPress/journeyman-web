// /components/ReviewGate.jsx — show ONCE PER SESSION across all pages
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SESSION_KEY = 'review_ack_session_v1'; // change version to force re-ask for everyone

export default function ReviewGate({ children }) {
  const router = useRouter();
  const reviewUrl = process.env.NEXT_PUBLIC_REVIEW_URL;

  const [ack, setAck] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAck = !!sessionStorage.getItem(SESSION_KEY);
      setAck(hasAck);
      setReady(true);
    }
  }, []);

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
      router.push('/'); // Porta alla Home
    }
  }

  if (!ready) return null;
  if (ack) return children;

  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <section className="content">
        {/* LEFT: testo e pulsanti */}
        <div className="left">
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image
              src="/icon-journey.png"
              alt="Journey Icon"
              width={32}
              height={32}
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            />
            Before you start: a quick favor 🙏
          </h2>
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

          <div style={{ display: 'flex', gap: 10, flexWrap:'wrap', marginTop:'10px' }}>
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

        {/* RIGHT: immagine cliccabile */}
        <div className="right">
          <div className="imageContainer">
            <a
              href={reviewUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!reviewUrl) {
                  e.preventDefault();
                  alert('Set NEXT_PUBLIC_REVIEW_URL in .env.local to open the review page.');
                }
              }}
            >
              <Image
                src="/img/COVER_REV.jpg"
                alt="Leave a Review - Journeyman Exam Prep"
                width={768}
                height={1001}
                style={{ borderRadius: '12px', objectFit: 'contain', width: '100%', height: 'auto', cursor: 'pointer' }}
              />
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        .content {
          width: 100%;
          max-width: 1000px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          justify-items: center;
          padding: 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.25);
          border: 3px solid #FFD700;
        }

        .left {
          text-align: justify;
          padding-right: 20px;
        }
        .left h2 { color: #FFD700; margin-bottom: 10px; }
        .left p, .left li { color: #fff; }
        .muted { color: #c9c9c9; }

        .right {
          padding-left: 20px;
          border-left: 3px solid rgba(255,255,255,0.15);
          display:flex;
          align-items:center;
        }
        .imageContainer { display: flex; justify-content: center; align-items: center; width: 100%; }

        @media (max-width: 1023px) {
          .content { grid-template-columns: 1fr; text-align: center; }
          .left { padding-right: 0; }
          .right { padding-left: 0; border-left: none; margin-top: 15px; }
          .imageContainer img { width: 60vw; }
        }
      `}</style>
    </main>
  );
}