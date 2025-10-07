// Import dei moduli principali e librerie
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; // Connessione a Supabase

// Funzione per formattare il timer in formato MM:SS
function formatMMSS(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

// Funzione per generare un suono breve (beep) con frequenza e durata specifica
function safeBeep(freq = 880, dur = 0.15) {
  try {
    // Crea o riutilizza un AudioContext per ridurre latenza
    const ctx = window._beepCtx || new (window.AudioContext || window.webkitAudioContext)();
    window._beepCtx = ctx;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine'; // Forma d'onda del beep
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    osc.start();
    // Ferma il suono dopo la durata impostata
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + dur);
      osc.stop(ctx.currentTime + dur);
    }, dur * 1000);
  } catch {}
}

// Restituisce il testo di una specifica opzione con etichetta (A, B, C, D)
function optionText(q, letter) {
  const L = (letter || '').toUpperCase();
  if (!L) return '';
  const key = `option_${L.toLowerCase()}`;
  const t = q?.[key] || '';
  return `${L}${t ? ` — ${t}` : ''}`;
}

export default function Exam() {
  const pathname = usePathname();
  const isActive = (path) => (pathname === path ? 'active' : ''); // Evidenzia link attivo

  // Stati principali del test
  const [count, setCount] = useState(20); // Numero di domande
  const [questions, setQuestions] = useState([]); // Domande caricate da Supabase
  const [idx, setIdx] = useState(0); // Indice domanda attuale
  const [answers, setAnswers] = useState({}); // Risposte fornite dall’utente
  const [finished, setFinished] = useState(false); // Stato del test completato
  const [showReview, setShowReview] = useState(false); // Stato finestra Review Errors
  const [useTimer, setUseTimer] = useState(false); // Abilitazione timer
  const [minutes, setMinutes] = useState(120); // Durata impostata del timer
  const [remaining, setRemaining] = useState(0); // Secondi rimanenti
  const timerRef = useRef(null); // Riferimento per il timer interval
  const [started, setStarted] = useState(false); // Stato del test avviato

  // Avvia il test caricando le domande e impostando il timer se abilitato
  async function start() {
    setFinished(false);
    setShowReview(false);
    setAnswers({});
    setIdx(0);
    setStarted(true);
    const { data, error } = await supabase.from('questions').select('*');
    if (error) {
      alert(error.message);
      setStarted(false);
      return;
    }
    // Mescola casualmente le domande e limita al numero richiesto
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.min(120, count)));
    setQuestions(shuffled);

    clearInterval(timerRef.current);
    if (useTimer) {
      const secs = Math.max(1, Math.floor(minutes * 60));
      setRemaining(secs);
      // Imposta il countdown con suoni di avviso
      timerRef.current = setInterval(() => {
        setRemaining((p) => {
          const n = p - 1;
          if (n === 60) safeBeep(880, 0.3); // Beep a 1 minuto
          if (n === 30) safeBeep(660, 0.3); // Beep a 30 secondi
          if (n <= 0) {
            clearInterval(timerRef.current);
            safeBeep(440, 0.4); // Beep finale
            setFinished(true);
            return 0;
          }
          return n;
        });
      }, 1000);
    } else setRemaining(0);
  }

  // Pulisce il timer al termine del ciclo di vita del componente
  useEffect(() => () => clearInterval(timerRef.current), []);

  // Riavvia il test con gli stessi parametri precedenti
  function restart() {
    setFinished(false);
    setShowReview(false);
    setAnswers({});
    setIdx(0);
    start();
  }

  // Gestione della selezione di una risposta
  function choose(choice) {
    if (finished) return; // Ignora se test completato
    const q = questions[idx];
    setAnswers((prev) => ({ ...prev, [q.id]: choice }));
    // Passa automaticamente alla prossima domanda o termina il test
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else {
      setFinished(true);
      clearInterval(timerRef.current);
    }
  }

  // Calcola il punteggio finale
  function computeScore() {
    let right = 0;
    for (const q of questions) {
      if ((answers[q.id] || '').toUpperCase() === (q.correct_answer || '').toUpperCase()) right++;
    }
    const total = questions.length || 0;
    return { right, total, pct: total ? Math.round((right / total) * 100) : 0 };
  }

  // Determina le domande sbagliate per la sezione di revisione
  const q = questions[idx];
  const wrong = questions.filter((q) => (answers[q.id] || '').toUpperCase() !== (q.correct_answer || '').toUpperCase());

  // Colora il timer in base al tempo rimanente
  const timerClass = useMemo(() => {
    if (!useTimer || remaining <= 0) return 'timer';
    if (remaining <= 30) return 'timer danger';
    if (remaining <= 60) return 'timer warn';
    return 'timer';
  }, [useTimer, remaining]);

  return (
    <>
      {/* Header comune alle altre pagine */}
      <header className="header">
        <nav className="nav">
          <Link className={isActive('/')} href="/">Home</Link>
          <Link className={isActive('/exam')} href="/exam">Exam Test</Link>
          <Link className={isActive('/flashcards')} href="/flashcards">Flashcards</Link>
        </nav>
      </header>

      {/* Pagina principale del test */}
      <main className="page exam-page">
        {/* Toolbar di configurazione test */}
        <div className="toolbar card" style={{ flexWrap: 'wrap' }}>
          <label>Number of questions:</label>
          <input type="number" min="1" max="120" value={count} onChange={(e) => setCount(+e.target.value)} disabled={started} />
          <label>
            <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} disabled={started} /> Enable timer
          </label>
          <label>
            Duration (minutes):
            <input type="number" min="1" max="240" value={minutes} onChange={(e) => setMinutes(+e.target.value)} disabled={!useTimer || started} style={{ marginLeft: 8 }} />
          </label>
          {useTimer && started && <span className={timerClass}>{formatMMSS(remaining)}</span>}
          {!started ? (
            <button className="btn" onClick={start}>Start</button>
          ) : (
            <>
              <button className="btn secondary" onClick={() => window.location.reload()}>Reset</button>
              <button className="btn" onClick={restart}>Restart</button>
            </>
          )}
        </div>

        {/* Sezione domande del test */}
        {questions.length > 0 && !finished && q && (
          <div className="card exam-card">
            <div className="muted">Question {idx + 1} / {questions.length} • {q.topic} → {q.subtopic} {q.nec_ref ? `• NEC ${q.nec_ref}` : ''}</div>
            <h3>{q.question}</h3>
            <div className="options-column">
              {/* Cicla sulle opzioni A–D */}
              {['A', 'B', 'C', 'D'].map((letter) => {
                const text = q[`option_${letter.toLowerCase()}`];
                if (!text) return null;
                const picked = answers[q.id];
                const correct = q.correct_answer?.toUpperCase() === letter;
                const disabled = !!picked;
                // Applica classi diverse in base a risposta e correttezza
                const cls = picked ? (letter === picked ? (correct ? 'option correct' : 'option wrong') : (correct ? 'option correct' : 'option')) : 'option';
                return (
                  <div key={letter} className={cls} onClick={() => !disabled && choose(letter)}>
                    <strong>{letter}.</strong> {text}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sezione risultati finali */}
        {finished && (
          <div className="card exam-card">
            <h3>Results</h3>
            {(() => {
              const s = computeScore();
              return <p><b>Score:</b> {s.right}/{s.total} ({s.pct}%)</p>;
            })()}
            <div className="toolbar">
              <button className="btn" onClick={() => setShowReview(true)}>Review errors</button>
            </div>
          </div>
        )}

        {/* Modal di revisione errori */}
        {showReview && (
          <div className="modal-backdrop">
            <div className="modal">
              <button className="close-btn" onClick={() => setShowReview(false)}>×</button>
              <h3>Review errors</h3>
              {wrong.length === 0 && <p className="muted">No errors — great job!</p>}
              {wrong.map((qq, i) => {
                const picked = (answers[qq.id] || '').toUpperCase();
                return (
                  <div key={qq.id} className="row">
                    <h4>{i + 1}. {qq.question}</h4>
                    <div className="small muted">Topic: {qq.topic} • {qq.subtopic} {qq.nec_ref ? `• NEC ${qq.nec_ref}` : ''}</div>
                    <div className="small"><span className="badge">Your</span> {optionText(qq, picked) || '—'}</div>
                    <div className="small"><span className="badge">Correct</span> {optionText(qq, qq.correct_answer)}</div>
                    {qq.explanation && (
                      <div className="small" style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>
                        <span className="badge">Explanation:</span><br />
                        {qq.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Stili locali per layout e modale */}
      <style jsx>{`
        .header { padding: 20px; position: sticky; top: 0; width: 100%; height: 32px; display:flex; align-items:center; backdrop-filter: rgba(10,10,10,0.9); backdrop-filter: blur(6px); }
        .nav { margin: 0 auto; display: flex; gap: 24px; align-items: center; justify-content: center; }
        .nav :global(a) { text-decoration: none; font-weight: 600; opacity: 0.85; color: #e6e9ef; padding: 6px 10px; border-radius: 10px; transition: opacity .2s, background .2s, color .2s; }
        .nav :global(a.active) { opacity: 1; background: rgba(255,255,255,0.25); color: #FFD700; }
        .page { color: #e6e9ef; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; }
        .exam-card { background: rgba(255,255,255,0.25); border-radius: 20px; padding: 20px; width:100%; max-width:1000px; border:3px solid #FFD700; }
        .options-column { display:flex; flex-direction:column; gap:10px; }
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: rgba(20,20,25,0.95); border-radius: 16px; border: 3px solid #FFD700; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 24px; color: #fff; position: relative; }
        .close-btn { position: fixed; top: 20px; right: 30px; background: #FFD700; color: #000; border: none; font-size: 22px; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; z-index: 1100; }
        .close-btn:hover { transform: scale(1.1) rotate(90deg); background: #ffea70; }
      `}</style>
    </>
  );
}