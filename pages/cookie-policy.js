// /pages/cookie-policy.js
import { useRouter } from 'next/router';

export default function CookiePolicy() {
  const router = useRouter();

  return (
    <main style={{ padding: '40px', maxWidth: 800, margin: '0 auto', color: 'white', textAlign: 'justify' }}>
      <h1 style={{ color: '#FFD700', textAlign: 'center' }}>Cookie Policy</h1>

      <p>
        This website uses only technical cookies essential for navigation and the correct
        functioning of its pages. No profiling or tracking cookies are used.
      </p>

      <p>
        You can manage or delete cookies directly from your browser settings at any time.
      </p>

      <p>For more information, please contact our support team.</p>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back(); // ✅ torna alla pagina precedente reale
            } else {
              router.push('/'); // fallback: torna alla home solo se non c’è history
            }
          }}
          style={{
            background: '#FFD700',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#E6C200')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#FFD700')}
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
