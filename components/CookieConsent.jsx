// /components/CookieConsent.jsx
'use client';
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  function acceptCookies() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  function rejectCookies() {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  }

  function resetConsent() {
    localStorage.removeItem('cookie_consent');
    setShowSettings(false);
    setVisible(true);
  }

  if (!visible && !showSettings)
    return (
      <div className="cookie-reopen">
        <button className="cookie-reopen-btn" onClick={() => setShowSettings(true)}>
          Cookie Preferences
        </button>
        <style jsx>{`
          .cookie-reopen {
            position: fixed;
            bottom: 15px;
            right: 20px;
            z-index: 9998;
          }
          .cookie-reopen-btn {
            background: transparent;
            border: 1px solid #FFD700;
            color: #FFD700;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .cookie-reopen-btn:hover {
            background: #FFD700;
            color: black;
          }
        `}</style>
      </div>
    );

  return (
    <>
      {visible && (
        <div className="cookie-banner">
          <div className="cookie-content">
            <h3>We use cookies 🍪</h3>
            <p>
              This site uses only technical cookies required for it to function properly.
              These cookies do not collect or store any personal data.
              You can choose to accept or reject them.
            </p>

            <div className="cookie-buttons">
              <button onClick={acceptCookies}>Accept</button>
              <button onClick={rejectCookies}>Reject</button>
              <a
                href="/cookie-policy"
                className="details"
                rel="noopener noreferrer"
                onClick={() => setVisible(false)}
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="cookie-modal">
          <div className="cookie-modal-content">
            <h3>Cookie Preferences</h3>
            <p>You can reset your cookie preferences and make a new choice.</p>

            <div className="cookie-buttons">
              <button onClick={resetConsent}>Reset Consent</button>
              <button onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: rgba(0, 0, 0, 0.95);
          color: white;
          padding: 18px;
          z-index: 9999;
          border-top: 3px solid #FFD700;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 0.4s ease;
        }
        .cookie-content {
          max-width: 800px;
          text-align: center;
        }
        .cookie-buttons {
          margin-top: 15px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        button {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-weight: bold;
          cursor: pointer;
        }
        button:first-of-type {
          background: #FFD700;
          color: black;
        }
        button:last-of-type {
          background: #444;
          color: white;
        }
        .details {
          color: #FFD700;
          text-decoration: underline;
          font-size: 0.9rem;
          align-self: center;
        }
        .cookie-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }
        .cookie-modal-content {
          background: #222;
          padding: 30px;
          border-radius: 16px;
          color: #fff;
          border: 2px solid #FFD700;
          text-align: center;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
