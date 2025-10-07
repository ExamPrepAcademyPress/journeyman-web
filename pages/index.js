// /pages/index.js
import Image from 'next/image';
import ReviewGate from '../components/ReviewGate';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const pathname = usePathname();
  const isActive = (path) => (pathname === path ? 'active' : '');

  return (
    <ReviewGate>
      <div className="page">
        <header className="header">
          <nav className="nav" role="navigation" aria-label="Primary">
            <Link className={isActive('/')} href="/">Home</Link>
            <Link className={isActive('/exam')} href="/exam">Exam Test</Link>
            <Link className={isActive('/flashcards')} href="/flashcards">Flashcards</Link>
          </nav>
        </header>

        {/* Contenuto principale centrato orizzontalmente */}
        <section className="content">
          <div className="left">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Image
                src="/icon-journey.png"
                alt="Journey Icon"
                width={36}
                height={36}
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
              />
              Welcome
            </h2>
            <p>Use the navigation above to start a practice exam or review flashcards.</p>
            <div className="cta">
              <p>If you landed on this page because someone shared the link with you, consider getting your own copy of the book. It’s absolutely essential for anyone who wants to properly prepare and pass the Journeyman Electrician Exam with confidence.</p>
              <p className="highlight">Click on the book cover to visit Amazon and get your copy now — it’s your key to success!</p>
            </div>
          </div>

          <div className="right">
            <Link
              className="imageLink"
              href="https://www.amazon.com/Pink-Salt-Solution-Weight-Loss/dp/B0FFB8L1XS"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="imageContainer">
                <Image
                  src="/img/COVER_HOME.jpg"
                  alt="Dominate The Journeyman Electrician Exam"
                  width={768}
                  height={1001}
                />
              </div>
            </Link>
          </div>
        </section>
      </div>

      <style jsx>{`
        .page { display: flex; flex-direction: column; align-items: center; color: #e6e9ef; }
        .header { padding: 20px; position: sticky; top: 0; width: 100%; height: 32px; display:flex; align-items:center; backdrop-filter: blur(6px); }
        .nav { margin: 0 auto; display: flex; gap: 24px; align-items: center; justify-content: center; }
        .nav :global(a) { text-decoration: none; font-weight: 600; opacity: 0.85; color: #e6e9ef; padding: 6px 10px; border-radius: 10px; transition: opacity .2s, background .2s, color .2s; }
        .nav :global(a.active) { opacity: 1; background: rgba(255,255,255,0.25); color: #FFD700; }
        .content { width: 100%; max-width: 1000px; height: 100%; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; align-items: flex-start; justify-items: center; padding: 20px; border-radius: 20px; background: rgba(255,255,255,0.25); border: 3px solid #FFD700; }
        .left { text-align: justify; padding-right: 20px; }
        .left h2 { margin: 0 0 10px; font-size: clamp(24px, 2.2vw, 36px); color: #FFD700; }
        .left p { margin: 0; font-size: clamp(14px, 1.0vw, 20px); opacity: 0.9; }
        .cta { margin-top: 20px; line-height: 1.6; }
        .cta .highlight { margin-top: 10px; font-weight: 600; color: #FFD700; }
        .right { padding-left: 20px; border-left: 3px solid rgba(255,255,255,0.15); display:flex; align-items:center; }
        .imageLink { display: block; border-radius: 16px; cursor: pointer; }
        .imageContainer { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
        .imageContainer :global(img) { width: 100%; height: auto; object-fit: contain; border-radius: 12px; }
        @media (max-width: 1023px) {
          .content { grid-template-columns: 1fr; text-align: center; border: 3px solid #FFD700; }
          .left { padding-right: 0; }
          .right { padding-left: 0; border-left: none; margin-top: 15px; }
          .imageContainer { width: 50vw; }
        }
      `}</style>
    </ReviewGate>
  );
}