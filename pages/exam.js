// pages/exam.js — Light version (no DB persistence), end shows score card first
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function formatMMSS(sec){const m=String(Math.floor(sec/60)).padStart(2,'0');const s=String(Math.floor(sec%60)).padStart(2,'0');return `${m}:${s}`;}
function beep(freq=880,dur=0.15){try{const c=new (window.AudioContext||window.webkitAudioContext)();const o=c.createOscillator();const g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(0.2,c.currentTime+0.01);o.start();setTimeout(()=>{g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.01);o.stop();c.close();},dur*1000);}catch{}}
function optionText(q,letter){const L=(letter||'').toUpperCase();if(!L) return '';const key=`option_${L.toLowerCase()}`;const t=q?.[key]||'';return `${L}${t?` — ${t}`:''}`;}

export default function Exam(){
  const [count,setCount]=useState(20);
  const [questions,setQuestions]=useState([]);
  const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({});
  const [finished,setFinished]=useState(false);
  const [showReview,setShowReview]=useState(false);
  const [useTimer,setUseTimer]=useState(false);
  const [minutes,setMinutes]=useState(120);
  const [remaining,setRemaining]=useState(0);
  const timerRef=useRef(null);
  const [started,setStarted]=useState(false);

  async function start(){
    setFinished(false);setShowReview(false);setAnswers({});setIdx(0);setStarted(true);
    const {data,error}=await supabase.from('questions').select('*');
    if(error){alert(error.message);setStarted(false);return;}
    const shuffled=[...data].sort(()=>Math.random()-0.5).slice(0,Math.max(1,Math.min(120,count)));
    setQuestions(shuffled);
    clearInterval(timerRef.current);
    if(useTimer){
      const secs=Math.max(1,Math.floor(minutes*60));setRemaining(secs);
      timerRef.current=setInterval(()=>{setRemaining(p=>{const n=p-1;if(n===60)beep(880,0.2);if(n<=0){clearInterval(timerRef.current);beep(440,0.4);setFinished(true);/* don't auto-open review */return 0;}return n;});},1000);
    }else setRemaining(0);
  }
  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  function choose(choice){
    if(finished) return;
    const q=questions[idx];
    setAnswers(prev=>({...prev,[q.id]:choice}));
    if(idx+1<questions.length) setIdx(idx+1); else {setFinished(true);clearInterval(timerRef.current);/* don't auto-open review */}
  }

  function computeScore(){let right=0;for(const q of questions){if((answers[q.id]||'').toUpperCase()===(q.correct_answer||'').toUpperCase()) right++;}const total=questions.length||0;return {right,total,pct: total?Math.round((right/total)*100):0};}

  const q=questions[idx];
  const wrong=questions.filter(q=>(answers[q.id]||'').toUpperCase()!==(q.correct_answer||'').toUpperCase());
  const timerClass=useMemo(()=>{if(!useTimer||remaining<=0)return 'timer';if(remaining<=30)return 'timer danger';if(remaining<=60)return 'timer warn';return 'timer';},[useTimer,remaining]);
  function reset(){clearInterval(timerRef.current);setQuestions([]);setAnswers({});setIdx(0);setFinished(false);setShowReview(false);setStarted(false);setRemaining(0);}

  return (<>
    <header>
<a href="/">Home</a>
<strong>Exam</strong>
<a href="/flashcards">Flashcards</a>
</header>
    <main>
      <div className="toolbar card" style={{flexWrap:'wrap'}}>
        <label>Number of questions:</label>
        <input type="number" min="1" max="120" value={count} onChange={e=>setCount(+e.target.value)} disabled={started}/>
        <div style={{width:1,height:24,background:'#2b3040'}}/>
        <label><input type="checkbox" checked={useTimer} onChange={e=>setUseTimer(e.target.checked)} disabled={started}/> Enable timer</label>
        <label>Duration (minutes):<input type="number" min="1" max="240" value={minutes} onChange={e=>setMinutes(+e.target.value)} disabled={!useTimer||started} style={{marginLeft:8}}/></label>
        {useTimer&&started&&(<span className={timerClass} title="Time remaining">{formatMMSS(remaining)}</span>)}
        {!started?<button className="btn" onClick={start}>Start</button>:<button className="btn secondary" onClick={reset}>Reset</button>}
        <span className="muted">Random draw from your 1000-question bank.</span>
      </div>

      {!questions.length && <p className="muted">Click <b>Start</b> to generate a test.</p>}

      {!!questions.length && !finished && q && (
        <div className="card">
          <div className="muted">Question {idx+1} / {questions.length} • {q.topic} → {q.subtopic} {q.nec_ref?`• NEC ${q.nec_ref}`:''}</div>
          <h3>{q.question}</h3>
          <div className="options">
            {['A','B','C','D'].map(letter=>{
              const text=q[`option_${letter.toLowerCase()}`]; if(!text) return null;
              const picked=answers[q.id]; const correct=q.correct_answer?.toUpperCase()===letter; const disabled=!!picked;
              const cls=picked?(letter===picked?(correct?'option correct':'option wrong'):(correct?'option correct':'option')):'option';
              return <div key={letter} className={cls} onClick={()=>!disabled&&choose(letter)}><strong>{letter}.</strong> {text}</div>;
            })}
          </div>
        </div>
      )}

      {finished && (
        <div className="card">
          <h3>Results</h3>
          {(()=>{const s=computeScore();return <p><b>Score:</b> {s.right}/{s.total} ({s.pct}%)</p>;})()}
          <div className="toolbar">
            <button className="btn" onClick={()=>setShowReview(true)}>Review errors</button>
            <button className="btn secondary" onClick={reset}>New test</button>
          </div>
        </div>
      )}

      {showReview && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Review errors</h3>
            {wrong.length===0 && <p className="muted">No errors — great job!</p>}
            <div className="list">
              {wrong.map((qq,i)=>{
                const picked=(answers[qq.id]||'').toUpperCase();
                return (
                  <div key={qq.id} className="row">
                    <h4>{i+1}. {qq.question}</h4>
                    <div className="small muted">Topic: {qq.topic} • {qq.subtopic} {qq.nec_ref?`• NEC ${qq.nec_ref}`:''}</div>
                    <div className="small"><span className="badge">Your</span> {optionText(qq,picked)||'—'}</div>
                    <div className="small"><span className="badge">Correct</span> {optionText(qq,qq.correct_answer)}</div>
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
            <div className="toolbar" style={{justifyContent:'flex-end',marginTop:12}}>
              <button className="btn" onClick={()=>setShowReview(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  </>);
}
