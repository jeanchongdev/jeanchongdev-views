// API para contador de visitantes con SVG animado
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args))

function generateSVG({ label = "Visitors", value = 0 }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="35" viewBox="0 0 180 35" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  
  <!-- Fondo con bordes redondeados -->
  <rect width="180" height="35" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  
  <defs>
    <!-- Gradiente animado arcoíris para los números -->
    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6b6b">
        <animate attributeName="stop-color" values="#ff6b6b;#4ecdc4;#45b7d1;#96ceb4;#feca57;#ff9ff3;#ff6b6b" dur="3s" repeatCount="indefinite"/>
      </stop>
      <stop offset="25%" stop-color="#4ecdc4">
        <animate attributeName="stop-color" values="#4ecdc4;#45b7d1;#96ceb4;#feca57;#ff9ff3;#ff6b6b;#4ecdc4" dur="3s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" stop-color="#45b7d1">
        <animate attributeName="stop-color" values="#45b7d1;#96ceb4;#feca57;#ff9ff3;#ff6b6b;#4ecdc4;#45b7d1" dur="3s" repeatCount="indefinite"/>
      </stop>
      <stop offset="75%" stop-color="#96ceb4">
        <animate attributeName="stop-color" values="#96ceb4;#feca57;#ff9ff3;#ff6b6b;#4ecdc4;#45b7d1;#96ceb4" dur="3s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#feca57">
        <animate attributeName="stop-color" values="#feca57;#ff9ff3;#ff6b6b;#4ecdc4;#45b7d1;#96ceb4;#feca57" dur="3s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    
    <!-- Gradiente para el ojo -->
    <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58a6ff"/>
      <stop offset="100%" stop-color="#1f6feb"/>
    </linearGradient>
  </defs>

  <!-- Ícono del ojo mejorado -->
  <g transform="translate(8, 8)">
    <!-- Contorno del ojo -->
    <ellipse cx="10" cy="10" rx="12" ry="7" fill="none" stroke="url(#eyeGradient)" stroke-width="2"/>
    <!-- Pupila -->
    <circle cx="10" cy="10" r="4" fill="url(#eyeGradient)">
      <animate attributeName="r" values="4;3;4" dur="2s" repeatCount="indefinite"/>
    </circle>
    <!-- Brillo en el ojo -->
    <circle cx="12" cy="8" r="1.5" fill="#ffffff" opacity="0.8"/>
  </g>

  <!-- Texto "Visitors" -->
  <text x="35" y="15" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="11" fill="#7d8590">
    👁️ ${label}
  </text>

  <!-- Número de visitantes con animación -->
  <text x="35" y="28" font-family="'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace" font-weight="700" font-size="14" fill="url(#rainbow)">
    ${value.toLocaleString("en-US")}
    <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
  </text>
  
  <!-- Efecto de parpadeo sutil -->
  <rect width="180" height="35" rx="6" fill="url(#rainbow)" opacity="0.1">
    <animate attributeName="opacity" values="0.1;0.2;0.1" dur="4s" repeatCount="indefinite"/>
  </rect>
</svg>`
}

module.exports = async (req, res) => {
  try {
    // Obtener el username del query parameter
    const { username = "visitor" } = req.query

    // Crear un namespace único para tu contador
    const namespace = "github-profile-views"
    const key = encodeURIComponent(username.toLowerCase())

    // Headers para evitar cache y permitir CORS
    res.setHeader("Content-Type", "image/svg+xml")
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
    res.setHeader("Access-Control-Allow-Origin", "*")

    // Incrementar contador usando CountAPI
    const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`, {
      method: "GET",
      headers: {
        "User-Agent": "GitHub-Profile-Counter/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`CountAPI error: ${response.status}`)
    }

    const data = await response.json()
    const visitorCount = typeof data?.value === "number" ? data.value : 1

    // Generar SVG con el contador actualizado
    const svgContent = generateSVG({
      label: "Visitors",
      value: visitorCount,
    })

    res.status(200).send(svgContent)
  } catch (error) {
    console.error("Error en contador de visitantes:", error)

    // En caso de error, mostrar SVG con valor 0
    const fallbackSVG = generateSVG({
      label: "Visitors",
      value: 0,
    })

    res.setHeader("Content-Type", "image/svg+xml")
    res.status(200).send(fallbackSVG)
  }
}
