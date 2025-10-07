// /pages/index.js
import Image from 'next/image'; // Importa il componente ottimizzato di Next.js per le immagini
import ReviewGate from '../components/ReviewGate'; // Importa un componente che gestisce la logica di accesso o revisione
import { usePathname } from 'next/navigation'; // Hook per ottenere il percorso corrente della pagina
import Link from 'next/link'; // Componente per la navigazione interna ottimizzata lato client

export default function Home() {
  // Ottiene il percorso attuale della pagina per evidenziare la voce attiva nel menu
  const pathname = usePathname();

  // Funzione per assegnare la classe 'active' al link della pagina corrente
  const isActive = (path) => (pathname === path ? 'active' : '');

  return (
    // ReviewGate avvolge il contenuto e potrebbe gestire logiche di verifica o controllo accessi
    <ReviewGate>
      {/* Contenitore principale della pagina */}
      <div className="page">
        {/* Header con barra di navigazione principale */}
        <header className="header">
          <nav className="nav" role="navigation" aria-label="Primary">
            {/* Link di navigazione principali con controllo dello stato attivo */}
            <Link className={isActive('/')} href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link>
            <Link className={isActive('/exam')} href="/exam" aria-current={pathname === '/exam' ? 'page' : undefined}>Exam Test</Link>
            <Link className={isActive('/flashcards')} href="/flashcards" aria-current={pathname === '/flashcards' ? 'page' : undefined}>Flashcards</Link>
          </nav>
        </header>

        {/* Corpo principale della pagina */}
        <main className="frame">
          {/* Sezione centrale con testo e immagine */}
          <section className="content">
            {/* Colonna sinistra: testo descrittivo e call to action */}
            <div className="left">
              <h2>Welcome</h2>
              <p>Use the navigation above to start a practice exam or review flashcards.</p>

              {/* Sezione di invito all'acquisto */}
              <div className="cta">
                <p>
                  If you landed on this page because someone shared the link with you, consider getting your own copy of the book. It’s absolutely essential for anyone who wants to properly prepare and pass the Journeyman Electrician Exam with confidence.
                </p>
                <p className="highlight">
                  Click on the book cover to visit Amazon and get your copy now — it’s your key to success!
                </p>
              </div>
            </div>

            {/* Colonna destra: immagine cliccabile con link ad Amazon */}
            <div className="right">
              <Link
                className="imageLink"
                href="https://www.amazon.com/Pink-Salt-Solution-Weight-Loss/dp/B0FFB8L1XS"
                target="_blank"
                rel="noopener noreferrer"
                title="Buy the Book on Amazon"
              >
                <div className="imageContainer">
                  {/* Immagine ottimizzata con dimensioni predefinite */}
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
        </main>
      </div>

      {/* CSS in stile JSX per definire layout e responsive design */}
      <style jsx>{`
        /* Struttura generale della pagina */
        .page { min-height: 100vh; display: flex; flex-direction: column; background: #0b0f15; color: #e6e9ef; }
        .header { position: sticky; top: 0; width: 100%; height: 64px; z-index: 50; display:flex; align-items:center; background: rgba(10,10,10,0.9); backdrop-filter: blur(6px); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .nav { max-width: 1200px; margin: 0 auto; padding: 0 16px; display: flex; gap: 24px; align-items: center; justify-content: center; }
        .nav :global(a) { text-decoration: none; font-weight: 600; opacity: 0.85; color: #e6e9ef; padding: 6px 10px; border-radius: 10px; transition: opacity .2s, background .2s; }
        .nav :global(a.active) { opacity: 1; background: rgba(255,255,255,0.1); }

        /* Layout principale con griglia */
        .frame { flex: 1; height: calc(100svh - 64px); overflow: hidden; display: flex; align-items: center; justify-content: center; }

        .content {
          width: 100%;
          max-width: 1000px;
          height: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          justify-items: center;
          padding: 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          border: 3px solid #FF0000;
        }

        /* Colonna di testo */
        .left { text-align: justify; text-justify: inter-word; justify-self: end; padding-right: 20px; }
        .left h2 { margin: 0 0 10px; font-size: clamp(24px, 2.2vw, 36px); color: #FFD700; }
        .left p { margin: 0; font-size: clamp(14px, 1.0vw, 20px); opacity: 0.9; }
        .cta { margin-top: 20px; line-height: 1.6; }
        .cta .highlight { margin-top: 10px; font-weight: 600; color: #FFD700; }

        /* Colonna immagine */
        .right { justify-self: end; padding-left: 20px; border-left: 2px solid rgba(255,255,255,0.15); height: 100%; display:flex; align-items:center; }
        .imageLink { display: block; border-radius: 16px; cursor: pointer; }
        .imageContainer { display: flex; justify-content: center; align-items: center; height: 100%; max-width: 550px; }
        .imageContainer :global(img) { display: block; height: auto; width: 100%; object-fit: contain; border-radius: 12px; }

        /* Media query per la versione mobile */
        @media (max-width: 1023px) {
          .frame { height: auto; min-height: calc(100svh - 64px); overflow: auto; }
          .content { grid-template-columns: 1fr; gap: 20px; text-align: center; height: auto; border: 3px solid #FFD700; }
          .left { justify-self: center; text-align: left; padding-right: 0; }
          .right { justify-self: center; padding-left: 0; border-left: none; height: auto; }
          .imageContainer { width: 45vw; height: auto; max-width: none; }
          .imageContainer :global(img) { width: 100%; height: auto; object-fit: contain; }
        }
      `}</style>
    </ReviewGate>
  );
}
