// /pages/index.js
// Importa i moduli principali di Next.js per gestire immagini, navigazione e componenti
import Image from 'next/image'; // Componente ottimizzato per le immagini
import ReviewGate from '../components/ReviewGate'; // Wrapper che controlla l'accesso ai contenuti
import { usePathname } from 'next/navigation'; // Hook per determinare la pagina corrente
import Link from 'next/link'; // Componente per la navigazione interna

export default function Home() {
  const pathname = usePathname();
  const isActive = (path) => (pathname === path ? 'active' : '');

  const headerStyle = {
    backgroundColor: '#003366',
    height: '20vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const contentStyle = {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    width: 'fit-content',
    height: '70vh',
    margin: '0 auto',
    padding: '2rem',
    gap: '2rem',
    backgroundColor: 'gray',
    border: '3px solid gold',
    borderRadius: '12px',
    boxSizing: 'border-box'
  };

  // LEFT mantiene la larghezza automatica e si adatta al contenuto
  const leftStyle = {
    width: 'auto', // larghezza dinamica in base al contenuto
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  // RIGHT si adatta automaticamente alla larghezza dell'immagine
  const rightStyle = {
    display: 'inline-flex', // segue la dimensione naturale del contenuto (l’immagine)
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 'auto', // dipende dalla larghezza effettiva dell’immagine
    position: 'relative',
    overflow: 'hidden'
  };

  const imageStyle = {
    height: '100%', // si adatta all’altezza del contenitore
    width: 'auto', // mantiene le proporzioni e controlla la larghezza di RIGHT
    objectFit: 'contain',
    borderRadius: '12px',
    display: 'block'
  };

  return (
    <ReviewGate>
      <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="header" style={headerStyle}>
          <nav className="nav" role="navigation" aria-label="Primary">
            <Link className={isActive('/')} href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link>
            <Link className={isActive('/exam')} href="/exam" aria-current={pathname === '/exam' ? 'page' : undefined}>Exam Test</Link>
            <Link className={isActive('/flashcards')} href="/flashcards" aria-current={pathname === '/flashcards' ? 'page' : undefined}>Flashcards</Link>
          </nav>
        </header>

        <main className="frame" style={{ flex: 1 }}>
          <section className="content" style={contentStyle}>
            <div className="left" style={leftStyle}>
              <h2>Welcome</h2>
              <div className="cta">
                <p>Use the navigation above to start a practice exam or review flashcards.</p>
                <br />
                <p>
                  If you landed on this page because someone shared the link with you, consider getting your own copy of the book. It’s absolutely essential for anyone who wants to properly prepare and pass the Journeyman Electrician Exam with confidence.
                </p>
                <p className="highlight">
                  Click on the book cover to visit Amazon and get your copy now — it’s your key to success!
                </p>
              </div>
            </div>

            <div className="right" style={rightStyle}>
              <Link
                className="imageLink"
                href="https://www.amazon.com/Pink-Salt-Solution-Weight-Loss/dp/B0FFB8L1XS"
                target="_blank"
                rel="noopener noreferrer"
                title="Buy the Book on Amazon"
              >
                <Image
                  src="/img/COVER_HOME.jpg"
                  alt="Dominate The Journeyman Electrician Exam"
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={imageStyle}
                  className="coverImage"
                />
              </Link>
            </div>
          </section>
        </main>
      </div>
   </ReviewGate>
  );
}