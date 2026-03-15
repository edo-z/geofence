'use client'

// src/components/map/MapClient.tsx

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { useMapStore } from '@/store/useMapStore'
import { DrawTools } from './DrawTools'
import { ZoneLayers } from './ZoneLayers'
import { LayerPanel } from './LayerPanel'
import { SaveZoneModal } from './SaveZoneModal'
import { SimulationPanel } from './SimulationPanel'
import { ExportPanel } from './ExportPanel'
import { pointInGeofences } from '@/lib/geo/analysis'
import type { IGeofence } from '@/types/geofence'
import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY

export function MapClient() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [draftCoords, setDraftCoords] = useState<number[][][] | null>(null)

  const { mapCenter, mapZoom, cursorCoords, setCursorCoords, setZones, addZone, zones, setTestPoint, setSimulationResult } = useMapStore()

  // Fungsi capture peta — dipanggil oleh ExportPanel saat export PDF.
  // Cara kerja: triggerRepaint() → dalam event 'render' (frame aktif) → toDataURL().
  // Ini satu-satunya cara reliable capture WebGL canvas tanpa preserveDrawingBuffer.
  const captureMap = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const map = mapRef.current
      if (!map) return resolve(null)

      const onRender = () => {
        map.off('render', onRender)
        try {
          const dataUrl = map.getCanvas().toDataURL('image/jpeg', 0.9)
          resolve(dataUrl)
        } catch {
          resolve(null)
        }
      }

      map.on('render', onRender)
      map.triggerRepaint()

      // Timeout fallback jika render tidak terpanggil
      setTimeout(() => { map.off('render', onRender); resolve(null) }, 2000)
    })
  }, [])

  // Init MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAPTILER_KEY
        ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
        : {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              maxzoom: 19,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
      center: mapCenter,
      zoom: mapZoom,
      maxZoom: 19,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')

    map.on('mousemove', (e) => setCursorCoords([e.lngLat.lng, e.lngLat.lat]))
    map.on('load', () => setMapReady(true))

    map.on('click', (e) => {
      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      setTestPoint(lngLat)
      const currentZones = useMapStore.getState().zones
      const activeMode = useMapStore.getState().activeDrawMode
      if (activeMode && activeMode !== 'select') return
      const result = pointInGeofences(lngLat, currentZones)
      setSimulationResult(result)
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetch('/api/geofences')
      .then(r => r.json())
      .then(json => { if (json.success) setZones(json.data) })
      .catch(console.error)
  }, [setZones])

  const handleDrawComplete = useCallback((coords: number[][][]) => {
    setDraftCoords(coords)
  }, [])

  const handleSaved = useCallback((zone: IGeofence) => {
    addZone(zone)
    setDraftCoords(null)
  }, [addZone])

  const formatCoord = (n: number, decimals = 4) => n.toFixed(decimals)

  return (
    <div className="relative w-full h-full flex">

      {/* ── Left sidebar ── */}
      <div className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col z-10">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-sm font-medium text-gray-800">GeoResearch</span>
        </div>

        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Saved zones</p>
          <LayerPanel />
        </div>

        {/* Export */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Export</p>
          <ExportPanel captureMap={captureMap} />
        </div>


        {/* Koordinat kursor */}
        <div className="mt-auto px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-gray-400 mb-0.5">Cursor</p>
          <p className="font-mono text-[11px] text-gray-600">
            {cursorCoords
              ? `${formatCoord(cursorCoords[1])}°, ${formatCoord(cursorCoords[0])}°`
              : '—'}
          </p>
        </div>

      </div>

      {/* ── Map ── */}
      <div className="relative flex-1">
        <div ref={mapContainer} className="w-full h-full" />

        {mapReady && mapRef.current && (
          <>
            <DrawTools map={mapRef.current} onDrawComplete={handleDrawComplete} />
            <ZoneLayers map={mapRef.current} />
          </>
        )}

        {mapReady && zones.length === 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 text-xs text-gray-500 pointer-events-none">
            Klik ⬠ untuk mulai menggambar zona
          </div>
        )}
      </div>

      {/* ── Right panel: Simulation ── */}
      <SimulationPanel />

      {/* ── Save modal ── */}
      {draftCoords && (
        <SaveZoneModal
          coordinates={draftCoords}
          onSave={handleSaved}
          onCancel={() => setDraftCoords(null)}
        />
      )}
    </div>
  )
}