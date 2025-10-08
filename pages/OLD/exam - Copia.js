// Sistemato layout per far uscire le domande una sotto l’altra
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

function formatMMSS(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

function safeBeep(freq = 880, dur = 0.15) {
  try {
    const ctx = window._beepCtx || new (window.AudioContext || window.webkitAudioContext)();
    window._beepCtx = ctx;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    osc.start();
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + dur);
      osc.stop(ctx.currentTime + dur);
    }, dur * 1000);
  } catch {}
}

function optionText(q, letter) {
  const L = (letter || '').toUpperCase();
  if (!L) return '';
  const key = `option_${L.toLowerCase()}`;
  const t = q?.[key] || '';
  return `${L}${t ? ` — ${t}` : ''}`;
}

export default function Exam() {
  const pathname = usePathname();
  const isActive = (path) => (pathname === path ? 'active' : '');

  const [count, setCount] = useState(20);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [useTimer, setUseTimer] = useState(false);
  const [minutes, setMinutes] = useState(120);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);
  const [started, setStarted] = useState(false);

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
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.min(120, count)));
    setQuestions(shuffled);

    clearInterval(timerRef.current);
    if (useTimer) {
      const secs = Math.max(1, Math.floor(minutes * 60));
      setRemaining(secs);
      timerRef.current = setInterval(() => {
        setRemaining((p) => {
          const n = p - 1;
          if (n === 60) safeBeep(880, 0.3);
          if (n === 30) safeBeep(660, 0.3);
          if (n <= 0) {
            clearInterval(timerRef.current);
            safeBeep(440, 0.4);
            setFinished(true);
            return 0;
          }
          return n;
        });
      }, 1000);
    } else setRemaining(0);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  function restart() {
    setFinished(false);
    setShowReview(false);
    setAnswers({});
    setIdx(0);
    start();
  }

  function choose(choice) {
    if (finished) return;
    const q = questions[idx];
    setAnswers((prev) => ({ ...prev, [q.id]: choice }));
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else {
      setFinished(true);
      clearInterval(timerRef.current);
    }
  }

  function computeScore() {
    let right = 0;
    for (const q of questions) {
      if ((answers[q.id] || '').toUpperCase() === (q.correct_answer || '').toUpperCase()) right++;
    }
    const total = questions.length || 0;
    return { right, total, pct: total ? Math.round((right / total) * 100) : 0 };
  }

  const q = questions[idx];
  const wrong = questions.filter((q) => (answers[q.id] || '').toUpperCase() !== (q.correct_answer || '').toUpperCase());

  const timerClass = useMemo(() => {
    if (!useTimer || remaining <= 0) return 'timer';
    if (remaining <= 30) return 'timer danger';
    if (remaining <= 60) return 'timer warn';
    return 'timer';
  }, [useTimer, remaining]);

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link className={isActive('/')} href="/">Home</Link>
          <Link className={isActive('/exam')} href="/exam">Exam Test</Link>
          <Link className={isActive('/flashcards')} href="/flashcards">Flashcards</Link>
        </nav>
      </header>

      <main className="page exam-page">
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

        {questions.length > 0 && !finished && q && (
          <div className="card exam-card">
            <div className="muted">Question {idx + 1} / {questions.length} • {q.topic} → {q.subtopic} {q.nec_ref ? `• NEC ${q.nec_ref}` : ''}</div>
            <h3>{q.question}</h3>
            <div className="options-column">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const text = q[`option_${letter.toLowerCase()}`];
                if (!text) return null;
                const picked = answers[q.id];
                const correct = q.correct_answer?.toUpperCase() === letter;
                const disabled = !!picked;
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

      <style jsx>{`
        .header { position: sticky; top: 0; width: 100%; height: 32px; display:flex; align-items:center; background: rgba(10,10,10,0.9); backdrop-filter: blur(6px); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .nav { margin: 0 auto; display: flex; gap: 24px; align-items: center; justify-content: center; }
        .nav :global(a) { text-decoration: none; font-weight: 600; opacity: 0.85; color: #e6e9ef; padding: 6px 10px; border-radius: 10px; transition: opacity .2s, background .2s, color .2s; }
        .nav :global(a.active) { opacity: 1; background: rgba(255,255,255,0.15); color: #FFD700; }
        .page { background: #0b0f15; color: #e6e9ef; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; }
        .exam-card { background: rgba(255,255,255,0.25); border-radius: 20px; padding: 20px; width:100%; max-width:1000px; border:3px solid #FFD700; }
        .options-column { display:flex; flex-direction:column; gap:10px; }
      `}</style>
    </>
  );
}
