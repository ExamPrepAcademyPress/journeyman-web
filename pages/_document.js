// /pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ✅ Qui mettiamo la favicon visibile anche su Vercel */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="theme-color" content="#FFD700" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
