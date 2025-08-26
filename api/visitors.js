// api/visitors.js
// Contador de visitas con SVG animado, ojo + números arcoíris, sin fondo.

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function svg({ label = "Visitors", value = 0 }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="40" viewBox="0 0 220 40" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <defs>
    <!-- Gradiente animado arcoíris -->
    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff0000"/>
      <stop offset="20%" stop-color="#ff7f00"/>
      <stop offset="40%" stop-color="#ffff00"/>
      <stop offset="60%" stop-color="#00ff00"/>
      <stop offset="80%" stop-color="#0000ff"/>
      <stop offset="100%" stop-color="#8f00ff"/>
      <animate attributeName="x1" values="0%;100%;0%" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="100%;0%;100%" dur="3s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>

  <!-- Icono de ojo -->
  <g transform="translate(5,5) scale(0.7)">
    <path d="M30 15C23 23 15 27 7 27S-9 23 -16 15C-9 7 -1 3 7 3S23 7 30 15Z" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
    <circle cx="7" cy="15" r="3" fill="#3b82f6"/>
  </g>

  <!-- Texto "Visitors" -->
  <text x="50" y="15" font-family="Segoe UI, Roboto, sans-serif" font-weight="600" font-size="12" fill="#888">
    ${label}
  </text>

  <!-- Número con animación arcoíris -->
  <text x="50" y="32" font-family="SFMono-Regular,Consolas,monospace" font-weight="900" font-size="18" fill="url(#rainbow)">
    ${value.toLocaleString('en-US')}
  </text>
</svg>`;
}

module.exports = async (req, res) => {
  try {
    const { username = "visitor" } = req.query;
    const namespace = "gh-rainbow-visits";
    const key = encodeURIComponent(username.toLowerCase());

    // Incrementar y obtener visitas actuales
    const hit = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
    const data = await hit.json();
    const value = typeof data?.value === "number" ? data.value : 0;

    const body = svg({ value });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).send(body);
  } catch (err) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg({ value: 0 }));
  }
};
