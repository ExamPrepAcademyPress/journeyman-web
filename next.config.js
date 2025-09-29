/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  // (opzionale) se usi asset locali in <Image/>:
  images: { unoptimized: true },
  // (opzionale) URL “statici” più prevedibili:
  // trailingSlash: true,
};
