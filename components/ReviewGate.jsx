// /components/ReviewGate.jsx — show ONCE PER SESSION across all pages
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SESSION_KEY = 'review_ack_session_v1';

export default function ReviewGate({ children }) {
  const router = useRouter();
  const reviewUrl = 'https://www.amazon.com/review/create-review/ref=cm_cr_othr_d_wr_but_top?ie=UTF8&channel=glance-detail&asin=B0FX128SM4';
  const [ack, setAck] = useState(false);
  const [ready, setReady] = useState(false);
  const isCookiePage = router.pathname === '/cookie-policy';


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
      router.push('/');
    }
  }

if (!ready) return null;

// ✅ Accesso libero alla cookie-policy anche senza ack
if (ack || isCookiePage) return children;


  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 0' }}>
      <section className="content">
        <div className="left">
          <h2 style={{ margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Image src="/icon-journey.png" alt="Journey Icon" width={32} height={32} />
            Before you start: a quick favor 🙏
          </h2>
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

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
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

          {reviewUrl && <div className="muted small" style={{ textAlign: 'center', marginTop: '5px', marginBottom: '5px' }}>The review page will open in a new tab.</div>}
        </div>

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
                style={{ borderRadius: '20px', objectFit: 'contain', width: '100%', height: 'auto', cursor: 'pointer', display: 'block' }}
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
          align-items: start;
          justify-items: center;
          padding: 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.25);
          border: 3px solid #FFD700;
        }

        .left {
          text-align: left;
          padding-right: 10px;
        }
        .left h2 { color: #FFD700; margin-bottom: 10px; font-size: 1.6rem; text-align: center; }
        .left p, .left li { color: #fff; font-size: 1rem; }
        .muted { color: #c9c9c9; }

        .right {
          padding-left: 10px;
          display:flex;
          align-items:center;
        }

        .imageContainer { display: flex; justify-content: center; align-items: center; width: 100%; }
        .imageContainer :global(img) { width: 100%; height: auto; object-fit: contain; border-radius: 12px; display: block; }

        /* MOBILE */
        @media (max-width: 600px) {
          .content {
            grid-template-columns: 1fr;
          }
          .left {
            padding: 0;
            order: 1;
          }
          .right {
            padding: 0;
            order: 2;
          }
          .left h2 { font-size: 1.0rem; text-align: center; }
          .left p, .left li { font-size: 0.8rem; }
          .imageContainer { display: flex; justify-content: center; align-items: center; width: 65%; margin: 0 auto; }
        }

        /* TABLET */
        @media (max-width: 1023px) and (min-width: 601px) {
          .content { grid-template-columns: 1fr; text-align: center; }
          .left { padding: 0; }
          .right { padding: 0; }
          .left h2 { font-size: 1.8rem; text-align: center; }
          .left p, .left li { font-size: 0.95rem; }
          .imageContainer { display: flex; justify-content: center; align-items: center; width: 70%; margin: 0 auto; }
        }
      `}</style>
    </main>
  );
}
