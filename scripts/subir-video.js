// Sube un vídeo a Bunny a través de uptron y lo registra en el catálogo (#44).
// El media ID que imprime al final es el que va en movies.json (bunny_id / bunny_trailer_id).
//
// Uso (Node 20.6+, desde la raíz de flixs):
//   node --env-file=.env scripts/subir-video.js "/ruta/al/video.mp4"
//   node --env-file=.env scripts/subir-video.js --check    (solo comprueba conexión y lista la librería)

import { openAsBlob } from 'node:fs'
import { stat } from 'node:fs/promises'
import { basename } from 'node:path'

const API = process.env.BUNNY_API_URL
const KEY = process.env.BUNNY_API_KEY
const PROJECT = process.env.BUNNY_PROJECT_ID

if (!API || !KEY || !PROJECT) {
  console.error('Faltan BUNNY_API_URL / BUNNY_API_KEY / BUNNY_PROJECT_ID — ejecuta con: node --env-file=.env scripts/subir-video.js <archivo>')
  process.exit(1)
}

const headers = { 'X-API-Key': KEY, 'Content-Type': 'application/json' }

async function api(path, options = {}) {
  const res = await fetch(`${API}/api/v1${path}`, { ...options, headers: { ...headers, ...options.headers } })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`${path} → HTTP ${res.status}: ${body.message || JSON.stringify(body).slice(0, 200)}`)
  }
  return body
}

const arg = process.argv[2]
if (!arg) {
  console.error('Uso: node --env-file=.env scripts/subir-video.js <archivo.mp4> | --check')
  process.exit(1)
}

if (arg === '--check') {
  const media = await api(`/projects/${PROJECT}/media?type=video`)
  console.log(`Conexión ok — ${media.data.length} vídeos en la librería:`)
  for (const m of media.data) console.log(` ${m.id} · ${m.originalFilename || m.filename} · ${m.status}`)
  process.exit(0)
}

const filePath = arg
const { size } = await stat(filePath)
const filename = basename(filePath)
console.log(`Subiendo ${filename} (${(size / 1024 / 1024).toFixed(1)} MB)…`)

// 1. Inicializar: crea el registro y devuelve la URL de subida directa a Bunny
const init = await api('/upload/initialize', {
  method: 'POST',
  body: JSON.stringify({ filename, type: 'video', size, mimeType: 'video/mp4', projectId: PROJECT }),
})
console.log(`Registro creado: mediaId ${init.mediaId} — subiendo a Bunny (PUT directo)…`)

// 2. Subir el archivo directo a Bunny (sin cargarlo entero en memoria)
const blob = await openAsBlob(filePath)
const up = await fetch(init.uploadUrl, { method: 'PUT', headers: init.headers || {}, body: blob })
if (!up.ok) {
  console.error(`Fallo en la subida a Bunny: HTTP ${up.status} ${await up.text().catch(() => '')}`)
  process.exit(1)
}
console.log('Archivo subido — registrando en el catálogo…')

// 3. Completar: verifica el estado en Bunny y marca el media como listo
const done = await api('/upload/complete', {
  method: 'POST',
  body: JSON.stringify({ mediaId: init.mediaId }),
})

console.log('✅ Subida completada.')
console.log(`   media ID (para movies.json): ${init.mediaId}`)
console.log(`   estado: ${done.status || done.media?.status || 'ver /admin'}`)
console.log('Nota: Bunny tarda unos minutos en codificar; el vídeo aparecerá "ready" en /admin cuando termine.')
