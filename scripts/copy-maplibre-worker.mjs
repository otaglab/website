// MapLibre runs its tile parsing in a web worker that bundlers don't emit, so serve it from public/
import { copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

await copyFile(fileURLToPath(import.meta.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs')), 'public/maplibre-gl-worker.js')
