'use client'

// src/components/map/DrawTools.tsx
// Toolbar draw yang mount MapboxDraw ke instance MapLibre

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { useMapStore } from '@/store/useMapStore'
import type { DrawMode } from '@/types/geofence'

interface DrawToolsProps {
  map: maplibregl.Map
  onDrawComplete: (coordinates: number[][][]) => void
}

const TOOLS: { mode: DrawMode; label: string; icon: string }[] = [
  { mode: 'select',  label: 'Select',  icon: '↖' },
  { mode: 'polygon', label: 'Polygon', icon: '⬠' },
  { mode: 'line',    label: 'Line',    icon: '╱' },
]

// Style override — fix line-dasharray incompatibility antara MapboxDraw dan MapLibre.
// MapboxDraw menggunakan ekspresi Mapbox GL, MapLibre butuh ["literal", [...]] untuk array.
const DRAW_STYLES = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: { 'fill-color': '#3bb2d0', 'fill-outline-color': '#3bb2d0', 'fill-opacity': 0.1 },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: { 'fill-color': '#fbb03b', 'fill-outline-color': '#fbb03b', 'fill-opacity': 0.1 },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#3bb2d0', 'line-width': 2 },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    // Gunakan ["literal", [...]] agar kompatibel dengan MapLibre
    paint: { 'line-color': '#fbb03b', 'line-dasharray': ['literal', [0.2, 2]], 'line-width': 2 },
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#3bb2d0', 'line-width': 2 },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#fbb03b', 'line-dasharray': ['literal', [0.2, 2]], 'line-width': 2 },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 5, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 3, 'circle-color': '#fbb03b' },
  },
  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 5, 'circle-opacity': 1, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 3, 'circle-color': '#3bb2d0' },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    paint: { 'circle-radius': 7, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    paint: { 'circle-radius': 5, 'circle-color': '#fbb03b' },
  },
]

export function DrawTools({ map, onDrawComplete }: DrawToolsProps) {
  const drawRef = useRef<InstanceType<typeof MapboxDraw> | null>(null)
  const { activeDrawMode, setDrawMode, setDraftCoordinates } = useMapStore()

  // Mount MapboxDraw ke map sekali saja
  useEffect(() => {
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      defaultMode: 'simple_select',
      styles: DRAW_STYLES as object[],
    })

    // MapboxDraw kompatibel dengan MapLibre via interface yang sama
    map.addControl(draw as unknown as maplibregl.IControl)
    drawRef.current = draw

    // Event: selesai menggambar satu feature
    const handleCreate = (e: { features: GeoJSON.Feature[] }) => {
      const feature = e.features[0]
      if (!feature || feature.geometry.type !== 'Polygon') return
      const coords = (feature.geometry as GeoJSON.Polygon).coordinates
      setDraftCoordinates(coords)
      onDrawComplete(coords)
      // Kembali ke mode select setelah selesai gambar
      draw.changeMode('simple_select')
      setDrawMode('select')
    }

    map.on('draw.create', handleCreate)

    return () => {
      map.off('draw.create', handleCreate)
      if (map.hasControl(draw as unknown as maplibregl.IControl)) {
        map.removeControl(draw as unknown as maplibregl.IControl)
      }
      drawRef.current = null
    }
  }, [map, onDrawComplete, setDraftCoordinates, setDrawMode])

  // Sync mode aktif ke MapboxDraw
  useEffect(() => {
    if (!drawRef.current) return
    if (activeDrawMode === 'polygon') {
      drawRef.current.changeMode('draw_polygon')
    } else {
      drawRef.current.changeMode('simple_select')
    }
  }, [activeDrawMode])

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
      {TOOLS.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => setDrawMode(activeDrawMode === mode ? null : mode)}
          title={label}
          className={[
            'w-10 h-10 rounded-lg border text-base font-medium transition-all',
            'flex items-center justify-center shadow-sm',
            activeDrawMode === mode
              ? 'bg-teal-600 text-white border-teal-700'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
          ].join(' ')}
        >
          {icon}
        </button>
      ))}

      {/* Separator + clear button */}
      <div className="h-px bg-gray-200 my-1" />
      <button
        onClick={() => drawRef.current?.deleteAll()}
        title="Hapus semua draft"
        className="w-10 h-10 rounded-lg border border-gray-200 bg-white text-red-400 hover:bg-red-50 hover:border-red-200 flex items-center justify-center text-sm transition-all shadow-sm"
      >
        ✕
      </button>
    </div>
  )
}