// api/visitors.js
// Vercel Serverless Function - Badge dinámico con detección automática de tema
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function svg({ label = "Visitors", value = 0, theme }) {
  const isDark = theme === "dark";
  const bg = isDark ? "#0B1220" : "#FFFFFF";
  const cardStroke = isDark ? "#1F2A44" : "#E5E7EB";
  const text = isDark ? "#C7D2FE" : "#111827";
  const eye = isDark ? "#93C5FD" : "#3B82F6";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="70" viewBox="0 0 300 70" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <defs>
    <!-- Gradiente arcoíris animado -->
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff0000"/>
      <stop offset="16%" stop-color="#ff7f00"/>
      <stop offset="33%" stop-color="#ffff00"/>
      <stop offset="50%" stop-color="#00ff00"/>
      <stop offset="66%" stop-color="#0000ff"/>
      <stop offset="83%" stop-color="#4b0082"/>
      <stop offset="100%" stop-color="#8f00ff"/>
      <animate attributeName="x1" values="0%;100%;0%" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="100%;0%;100%" dur="4s" repeatCount="indefinite"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <g filter="url(#shadow)">
    <rect x="0.5" y="0.5" rx="14" ry="14" width="299" height="69" fill="${bg}" stroke="${cardStroke}" />
  </g>

  <!-- Ojo -->
  <g transform="translate(20,20) scale(0.9)">
    <path d="M120 15C100 35 72 45 45 45S-10 35 -30 15C-10 -5 18 -15 45 -15S100 -5 120 15Z" fill="none" stroke="${eye}" stroke-width="6"/>
    <circle cx="45" cy="15" r="10" fill="${eye}" />
  </g>

  <!-- Etiqueta -->
  <text x="80" y="30" font-family="Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-weight="600" font-size="14" fill="${text}">${label}</text>

  <!-- Número arcoíris animado -->
  <text x="80" y="54" font-family="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace" font-weight="800" font-size="28" fill="url(#grad)">
    ${value.toLocaleString('en-US')}
    <animate attributeName="x" values="80;90;80" dur="2s" repeatCount="indefinite"/>
  </text>
</svg>`;
}

module.exports = async (req, res) => {
  try {
    const { username = "visitor", label = "Visitors" } = req.query;
    const namespace = "gh-rainbow-visits";
    const key = encodeURIComponent(username.toLowerCase());

    // Incrementar visitas
    const hit = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
    const data = await hit.json();
    const value = typeof data?.value === "number" ? data.value : 0;

    // Detectar tema automáticamente
    let theme = "dark";
    if (req.headers["user-agent"]?.includes("prefers-color-scheme: light")) {
      theme = "light";
    }

    const body = svg({ label, value, theme });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).send(body);
  } catch (err) {
    const fallback = svg({ value: 0, theme: "light" });
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(fallback);
  }
};
