// /pages/exam.js — aggiunto testo bianco accanto alle risposte colorate
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

function formatMMSS(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

function beep(freq = 880, dur = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {}
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
  const [started, setStarted] = useState(false);
  const [useTimer, setUseTimer] = useState(false);
  const [minutes, setMinutes] = useState(120);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);

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

    const take = Math.max(1, Math.min(120, count));
    const shuffled = [...(data || [])].sort(() => Math.random() - 0.5).slice(0, take);
    setQuestions(shuffled);

    clearInterval(timerRef.current);
    if (useTimer) {
      const secs = Math.max(1, Math.floor(minutes * 60));
      setRemaining(secs);
      timerRef.current = setInterval(() => {
        setRemaining((p) => {
          const n = p - 1;
          if (n === 60) beep(880, 0.5);
          if (n === 30) beep(660, 0.5);
          if (n <= 0) {
            clearInterval(timerRef.current);
            beep(440, 1);
            setFinished(true);
            return 0;
          }
          return n;
        });
      }, 1000);
    }
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

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

  const q = questions[idx];
  const incorrectCount = questions.filter(
    (qq) => (answers[qq.id] || '').toUpperCase() !== (qq.correct_answer || '').toUpperCase()
  ).length;

  function reset() {
    clearInterval(timerRef.current);
    setQuestions([]);
    setAnswers({});
    setIdx(0);
    setFinished(false);
    setShowReview(false);
    setStarted(false);
    setRemaining(0);
  }

  function restart() {
    if (started) start();
  }

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link className={isActive('/')} href="/">Home</Link>
          <Link className={isActive('/exam')} href="/exam">Exam Test</Link>
          <Link className={isActive('/flashcards')} href="/flashcards">Flashcards</Link>
        </nav>
      </header>

      <main className="page exam-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
        <div className="toolbar card" style={{ flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center', color: 'white' }}>
          <label>Number of questions:</label>
          <input type="number" min="1" max="120" value={count} onChange={(e) => setCount(+e.target.value)} disabled={started} />

          <label>
            <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} disabled={started} /> Enable timer
          </label>
          <label>
            Duration (minutes):
            <input type="number" min="1" max="240" value={minutes} onChange={(e) => setMinutes(+e.target.value)} disabled={!useTimer || started} style={{ marginLeft: 8 }} />
          </label>

          {useTimer && started && (
            <div className="timer-box">⏱ {formatMMSS(remaining)}</div>
          )}

          {!started && (<button className="btn main" onClick={start}>Start</button>)}

          {started && !finished && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
              <button className="btn main" onClick={reset}>Reset</button>
              <button className="btn main" onClick={restart}>Restart</button>
            </div>
          )}

          {finished && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
              <button className="btn main" onClick={() => setShowReview(true)}>
                Review Errors ({incorrectCount}/{questions.length})
              </button>
              <button className="btn main" onClick={reset}>Reset</button>
              <button className="btn main" onClick={restart}>Restart</button>
            </div>
          )}
        </div>

        {!!questions.length && !finished && q && (
          <div className="card exam-card" style={{ margin: '0 auto', textAlign: 'center', color: 'white' }}>
            <div className="category">Question {idx + 1} / {questions.length} • {q.topic} → {q.subtopic} {q.nec_ref ? `• NEC ${q.nec_ref}` : ''}</div>
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
                    <div className="option-text"><strong>{letter}.</strong> {text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showReview && (
          <div className="overlay">
            <div className="review-modal">
              <div className="close-btn" onClick={() => setShowReview(false)}>✖</div>
              <h3 style={{ textAlign: 'center', color: '#FFD700' }}>Review Errors</h3>
              {questions.filter((qq) => (answers[qq.id] || '').toUpperCase() !== (qq.correct_answer || '').toUpperCase()).map((qq, i) => (
                <div key={qq.id} className="review-item">
                  <p><b>{i + 1}. {qq.question}</b></p>
                  <p>
                    Your answer: <span className={(answers[qq.id] || '').toUpperCase() === (qq.correct_answer || '').toUpperCase() ? 'green' : 'red'}>
                      {answers[qq.id] || '—'}
                    </span> <span className="white"> — {qq[`option_${(answers[qq.id] || '').toLowerCase()}`] || ''}</span>
                  </p>
                  <p>
                    Correct answer: <span className="green">{qq.correct_answer}</span>
                    <span className="white"> — {qq[`option_${qq.correct_answer?.toLowerCase()}`] || ''}</span>
                  </p>
                  {qq.explanation && <p className="explanation">{qq.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .header { position: sticky; top: 0; width: 100%; height: 32px; display:flex; align-items:center; padding: 20px; background: rgba(10,10,10,0.9); backdrop-filter: blur(6px); }
        .nav { margin: 0 auto; display: flex; gap: 24px; align-items: center; justify-content: center; }
        .nav :global(a) { text-decoration: none; font-weight: 600; opacity: 0.85; color: #e6e9ef; padding: 6px 10px; border-radius: 10px; transition: opacity .2s, background .2s, color .2s; }
        .nav :global(a.active) { opacity: 1; background: rgba(255,255,255,0.15); color: #FFD700; }
        .btn.main { background: #1f6feb; color: white; border: none; border-radius: 8px; padding: 8px 14px; cursor: pointer; transition: transform .2s ease, background .2s ease; }
        .btn.main:hover { transform: scale(1.1); background: #3182f6; }
        .timer-box { margin-top: 8px; font-weight: bold; color: #FFD700; font-size: 18px; }
        .category { color: #FFD700; font-weight: 600; margin-bottom: 8px; }
        .options-column { display: flex; flex-direction: column; gap: 10px; }
        .option { display: flex; align-items: center; background: #1f1f1f; border-radius: 8px; padding: 10px; cursor: pointer; transition: transform .3s ease; }
        .option:hover { transform: scale(1.03); }
        .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .review-modal { background: #222; color: white; border: 3px solid #FFD700; border-radius: 10px; padding: 24px; width: 80%; max-width: 800px; position: relative; max-height: 80vh; overflow-y: auto; }
        .close-btn { position: sticky; top: 10px; float: right; background: #FFD700; color: black; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; transition: transform .2s ease; margin-left: auto; }
        .close-btn:hover { transform: rotate(90deg); }
        .explanation { color: #FFD700; font-style: italic; margin-top: 4px; }
        .red { color: #ff4444; font-weight: bold; }
        .green { color: #4caf50; font-weight: bold; }
        .white { color: #fff; }
      `}</style>
    </>
  );
}
