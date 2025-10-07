// /pages/index.js
import ReviewGate from '../components/ReviewGate';

export default function Home(){
  return (
    <ReviewGate>
      <>
        <header>
          <strong>Home</strong>
          <a href='/exam'>Exam</a>
          <a href='/flashcards'>Flashcards</a>
        </header>
        <main>
          <div className='card'>
            <h2>Welcome</h2>
            <p>Use the navigation above to start a practice exam or review flashcards.</p>
          </div>
        </main>
      </>
    </ReviewGate>
  );
}
