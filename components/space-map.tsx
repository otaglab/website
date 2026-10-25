'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent, MapLibreEvent, Marker, Popup } from 'maplibre-gl'
import { BAKU_CENTER, type LatLng, type MapBounds, type SpaceListing } from '@/lib/spaces'

// Free vector tiles, no API key: https://openfreemap.org
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const TEAL = '#1ABC9C'
const NAVY = '#0D2B4E'

type SpaceMapProps = {
  items: SpaceListing[]
  selected?: string
  onSelect?: (slug: string) => void
  // Called after the user pans or zooms (not after programmatic moves)
  onUserMove?: (bounds: MapBounds) => void
  userLocation?: LatLng | null
  // Changing this re-fits the view to the items (and user location)
  fitKey?: string | number
  cooperative?: boolean
  className?: string
}

function toGeoJSON(items: SpaceListing[]) {
  return {
    type: 'FeatureCollection' as const,
    features: items.filter((s) => s.lat !== null && s.lng !== null).map((s) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [s.lng!, s.lat!] }, properties: { slug: s.slug, name: s.name, district: s.district, price: s.price } })),
  }
}

function popupContent(space: SpaceListing) {
  const root = document.createElement('div')
  const name = document.createElement('strong')
  name.className = 'block text-xs text-[var(--navy)]'
  name.textContent = space.name
  const meta = document.createElement('span')
  meta.className = 'mt-1 block text-[11px] text-[var(--muted-text)]'
  meta.textContent = `${space.district} · from ${space.price}/day`
  root.append(name, meta)
  return root
}

export function SpaceMap({ items, selected, onSelect, onUserMove, userLocation, fitKey, cooperative = false, className = 'h-[420px]' }: SpaceMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const libRef = useRef<typeof import('maplibre-gl') | null>(null)
  const popupRef = useRef<Popup | null>(null)
  const userMarkerRef = useRef<Marker | null>(null)
  const callbacks = useRef({ onSelect, onUserMove })
  callbacks.current = { onSelect, onUserMove }
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let map: MapLibreMap | undefined
    let resizeObserver: ResizeObserver | undefined
    import('maplibre-gl').then((lib) => {
      if (cancelled || !container.current) return
      lib.setWorkerUrl(`/maplibre-gl-worker.js?v=${lib.getVersion()}`)
      libRef.current = lib
      map = new lib.Map({ container: container.current, style: STYLE_URL, center: [BAKU_CENTER.lng, BAKU_CENTER.lat], zoom: 11.5, attributionControl: { compact: true }, cooperativeGestures: cooperative, dragRotate: false, pitchWithRotate: false })
      map.touchZoomRotate.disableRotation()
      map.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right')
      mapRef.current = map
      map.on('error', (event) => console.error('Map error', event.error))
      map.on('load', () => {
        if (!map) return
        // Street and place labels in Azerbaijani, falling back to the Latin or local name
        for (const layer of map.getStyle().layers) {
          if (layer.type === 'symbol' && map.getLayoutProperty(layer.id, 'text-field')) map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name:az'], ['get', 'name:latin'], ['get', 'name']])
        }
        map.addSource('spaces', { type: 'geojson', data: toGeoJSON([]), cluster: true, clusterRadius: 48, clusterMaxZoom: 14 })
        map.addLayer({ id: 'clusters', type: 'circle', source: 'spaces', filter: ['has', 'point_count'], paint: { 'circle-color': NAVY, 'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30], 'circle-stroke-width': 4, 'circle-stroke-color': 'rgba(255,255,255,0.85)' } })
        map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'spaces', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 13 }, paint: { 'text-color': '#fff' } })
        map.addLayer({ id: 'spaces', type: 'circle', source: 'spaces', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': TEAL, 'circle-radius': 9, 'circle-stroke-width': 3, 'circle-stroke-color': '#fff' } })
        map.addLayer({ id: 'space-selected', type: 'circle', source: 'spaces', filter: ['==', ['get', 'slug'], ''], paint: { 'circle-color': TEAL, 'circle-radius': 13, 'circle-stroke-width': 4, 'circle-stroke-color': '#fff' } })

        map.on('click', 'clusters', async (event: MapLayerMouseEvent) => {
          const feature = event.features?.[0]
          if (!map || !feature || feature.geometry.type !== 'Point') return
          const zoom = await (map.getSource('spaces') as GeoJSONSource).getClusterExpansionZoom(feature.properties.cluster_id)
          map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom }, { userMove: true })
        })
        map.on('click', 'spaces', (event: MapLayerMouseEvent) => {
          const slug = event.features?.[0]?.properties.slug
          if (slug) callbacks.current.onSelect?.(slug)
        })
        for (const layer of ['clusters', 'spaces']) {
          map.on('mouseenter', layer, () => { if (map) map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', layer, () => { if (map) map.getCanvas().style.cursor = '' })
        }
        // Drag inertia ends without an original event, so decide when the move starts
        let userMoving = false
        map.on('movestart', (event: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined> & { userMove?: boolean }) => { userMoving = Boolean(event.originalEvent || event.userMove) })
        map.on('moveend', () => {
          if (!map || !userMoving) return
          userMoving = false
          const b = map.getBounds()
          callbacks.current.onUserMove?.({ west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() })
        })
        setReady(true)
      })
      // The map can start hidden (mobile list view), so resize whenever its box changes
      resizeObserver = new ResizeObserver(() => map?.resize())
      resizeObserver.observe(container.current)
    }).catch((error) => {
      console.error('Failed to load the map', error)
      if (!cancelled) setFailed(true)
    })
    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      map?.remove()
      mapRef.current = null
    }
  }, [cooperative])

  // Keep the pins in sync with the listings
  useEffect(() => {
    if (!ready) return
    ;(mapRef.current?.getSource('spaces') as GeoJSONSource | undefined)?.setData(toGeoJSON(items))
  }, [ready, items])

  // Fit the view to the listings when asked
  useEffect(() => {
    const map = mapRef.current
    const lib = libRef.current
    if (!ready || !map || !lib) return
    const points = items.filter((s) => s.lat !== null && s.lng !== null).map((s) => [s.lng!, s.lat!] as [number, number])
    if (userLocation) points.push([userLocation.lng, userLocation.lat])
    if (!points.length) return
    // The container may have just become visible, so measure it before fitting
    map.resize()
    if (points.length === 1) map.jumpTo({ center: points[0], zoom: 14.5 })
    else map.fitBounds(points.reduce((bounds, point) => bounds.extend(point), new lib.LngLatBounds(points[0], points[0])), { padding: 56, maxZoom: 14, duration: 600 })
    // Only re-fit when fitKey changes, not on every listing update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey])

  // Highlight the selected space and show its popup
  useEffect(() => {
    const map = mapRef.current
    const lib = libRef.current
    if (!ready || !map || !lib) return
    map.setFilter('space-selected', ['==', ['get', 'slug'], selected ?? ''])
    popupRef.current?.remove()
    const space = items.find((s) => s.slug === selected)
    if (!space || space.lat === null || space.lng === null) return
    popupRef.current = new lib.Popup({ closeButton: false, closeOnClick: false, offset: 16, className: 'space-map-popup' }).setLngLat([space.lng, space.lat]).setDOMContent(popupContent(space)).addTo(map)
  }, [ready, selected, items])

  // Show where the user is
  useEffect(() => {
    const map = mapRef.current
    const lib = libRef.current
    if (!ready || !map || !lib) return
    userMarkerRef.current?.remove()
    userMarkerRef.current = null
    if (!userLocation) return
    const dot = document.createElement('div')
    dot.className = 'size-4 rounded-full border-[3px] border-white bg-[#2563EB] shadow-[0_0_0_6px_rgba(37,99,235,0.2)]'
    dot.setAttribute('aria-label', 'Your location')
    userMarkerRef.current = new lib.Marker({ element: dot }).setLngLat([userLocation.lng, userLocation.lat]).addTo(map)
  }, [ready, userLocation])

  return <div className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#e8eef0] ${className}`}>
    <div ref={container} className="size-full" />
    {failed && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-[var(--muted-text)]">The map could not be loaded. Please refresh the page.</div>}
  </div>
}
