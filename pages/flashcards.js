// /pages/flashcards.js
// Correzione tag <label> non chiuso e duplicazioni
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    function onKey(e) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === ' ') { e.preventDefault(); handlers.onFlip?.(); }
      if (k === 'arrowright') handlers.onNext?.();
      if (k === 'arrowleft') handlers.onPrev?.();
      if (k === 'r') handlers.onReshuffle?.();
      if (k === 'f') handlers.onFlag?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers]);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PASTELS = ['#FFD166','#FFADAD','#FDFFB6','#BDE0FE','#A0E7E5','#B9FBC0','#BDB2FF','#FFC6FF','#F4A261','#A7C957'];

function pickDifferentColor(prev) {
  const pool = PASTELS.filter(c => c !== prev);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Flashcards() {
  const pathname = usePathname();
  const isActive = (path) => (pathname === path ? 'active' : '');

  const [all, setAll] = useState([]);
  const [filter, setFilter] = useState('');
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [limit, setLimit] = useState(50);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flagged, setFlagged] = useState(new Set());
  const [animClass, setAnimClass] = useState('anim-in-right');
  const animTimer = useRef(null);
  const [cardColor, setCardColor] = useState(PASTELS[0]);
  const lastColorRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('flashcards').select('*');
      if (error) { alert(error.message); return; }
      setAll(data || []);
    })();
  }, []);

  const deck = useMemo(() => {
    let d = all;
    if (filter.trim()) {
      const q = filter.trim().toLowerCase();
      d = d.filter(x => (x.front||'').toLowerCase().includes(q) || (x.back||'').toLowerCase().includes(q));
    }
    if (onlyFlagged) d = d.filter(x => flagged.has(x.id));
    d = shuffleArray(d);
    if (limit > 0) d = d.slice(0, Math.min(limit, d.length));
    return d;
  }, [all, filter, onlyFlagged, limit, flagged, shuffleSeed]);

  useEffect(() => {
    setIdx(0);
    setFlipped(false);
    setAnimClass('anim-in-right');
    lastColorRef.current = null;
    setCardColor(pickDifferentColor(null));
  }, [deck]);

  useEffect(() => {
    if (!deck.length) return;
    const c = pickDifferentColor(lastColorRef.current);
    lastColorRef.current = c;
    setCardColor(c);
  }, [idx, deck.length]);

  function flip() { setFlipped(f => !f); }
  function next() {
    if (idx >= deck.length - 1) return;
    setAnimClass('anim-out-left');
    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => {
      setIdx(i => Math.min(i + 1, deck.length - 1));
      setFlipped(false);
      setAnimClass('anim-in-right');
    }, 240);
  }
  function prev() {
    if (idx <= 0) return;
    setAnimClass('anim-out-right');
    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => {
      setIdx(i => Math.max(i - 1, 0));
      setFlipped(false);
      setAnimClass('anim-in-left');
    }, 240);
  }
  function reshuffle() { setShuffleSeed(s => s + 1); }
  function toggleFlag() {
    const card = deck[idx];
    if (!card) return;
    setFlagged(prev => {
      const n = new Set(prev);
      if (n.has(card.id)) n.delete(card.id); else n.add(card.id);
      return n;
    });
  }

  useKeyboardShortcuts({ onFlip: flip, onNext: next, onPrev: prev, onReshuffle: reshuffle, onFlag: toggleFlag });

  const card = deck[idx];
  const isFlagged = card ? flagged.has(card.id) : false;
  const progress = deck.length ? `${idx + 1} / ${deck.length}` : '0 / 0';

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link className={isActive('/')} href="/">Home</Link>
          <Link className={isActive('/exam')} href="/exam">Exam Test</Link>
          <Link className={isActive('/flashcards')} href="/flashcards">Flashcards</Link>
        </nav>
      </header>

      <main>
        <div className="card" style={{display:'grid', gap:12, margin:'0 auto'}}>
          <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', width:'100%'}}>
            <input
              placeholder="Search front/back..."
              value={filter}
              onChange={e=>setFilter(e.target.value)}
              style={{minWidth:260, flex:'1 1 280px'}}
            />
            <label style={{color:'white'}} htmlFor="limitInput">Size</label>
            <input id="limitInput" type="number" min="1" max="500" value={limit} onChange={e=>setLimit(+e.target.value)} style={{marginLeft:8, width:90}} />
            <label style={{color:'white'}}>
              <input type="checkbox" checked={onlyFlagged} onChange={e=>setOnlyFlagged(e.target.checked)} />
              {' '}Flagged only
            </label>
            <button className="btn secondary" onClick={reshuffle}>Shuffle</button>
            <span className="badge" style={{color:'white'}}>{progress}</span>
            <span className="muted small desktop-only">Shortcuts: ←/→, Space=flip, F=flag, R=reshuffle</span>
          </div>

          <div className="flashcard-stage" style={{ maxWidth:'100%' }}>
            <div className={`color-frame ${animClass}`}>
              <div className="flip-card">
                <div className={`flip-inner ${flipped ? 'is-flipped' : ''}`} style={{ background: cardColor }}>
                  <div className="flip-face flip-front" style={{ color:'#0b0d12' }}>
                    {card ? (
                      <div style={{width:'100%'}}>
                        <div style={{position:'absolute', top:10, right:10}} className="badge">{card.id}{isFlagged?' • flagged':''}</div>
                        <div style={{fontSize:22, fontWeight:700, marginBottom:10}}>Front</div>
                        <div className="fc-text" style={{whiteSpace:'pre-wrap'}}>{card.front || ''}</div>
                      </div>
                    ) : (
                      <div className="muted">No cards match the current filters.</div>
                    )}
                  </div>

                  <div className="flip-face flip-back" style={{ color:'#0b0d12' }}>
                    {card ? (
                      <div style={{width:'100%'}}>
                        <div style={{position:'absolute', top:10, right:10}} className="badge">{card.id}{isFlagged?' • flagged':''}</div>
                        <div style={{fontSize:22, fontWeight:700, marginBottom:10}}>Back</div>
                        <div className="fc-text" style={{whiteSpace:'pre-wrap'}}>{card.back || ''}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fc-buttons">
            <button className="btn secondary" onClick={prev} disabled={!deck.length || idx===0}>Prev</button>
            <button className="btn" onClick={flip} disabled={!deck.length}>Flip</button>
            <button className="btn secondary" onClick={next} disabled={!deck.length || idx===deck.length-1}>Next</button>
            <button className="btn secondary" onClick={toggleFlag} disabled={!deck.length}>{isFlagged?'Unflag':'Flag'}</button>
            <button className="btn secondary" onClick={reshuffle} disabled={!deck.length}>Reshuffle</button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .header { position: sticky; top: 0; width: 100%; height: 32px; display:flex; align-items:center; padding: 20px; background: rgba(10,10,10,0.9); backdrop-filter: blur(6px); }
        .nav { margin: 0 auto; display: flex; gap: 24px; align-items: center; justify-content: center; }
        .nav :global(a) { text-decoration: none; font-weight: 600; opacity: 0.85; color: #e6e9ef; padding: 6px 10px; border-radius: 10px; transition: opacity .2s, background .2s, color .2s; }
        .nav :global(a.active) { opacity: 1; background: rgba(255,255,255,0.15); color: #FFD700; }
        @media (max-width: 1023px) { .desktop-only { display: none; } }
      `}</style>
    </>
  );
}