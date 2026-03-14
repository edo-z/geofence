'use client'

// src/components/map/ZoneLayers.tsx
// Render semua zona tersimpan ke MapLibre sebagai GeoJSON source + fill/line layers

import { useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/store/useMapStore'
import type { IGeofence } from '@/types/geofence'

interface ZoneLayersProps {
  map: maplibregl.Map
}

function zoneSourceId(id: string) { return `zone-source-${id}` }
function zoneFillId(id: string)   { return `zone-fill-${id}` }
function zoneLineId(id: string)   { return `zone-line-${id}` }

function addZoneToMap(map: maplibregl.Map, zone: IGeofence) {
  const sid = zoneSourceId(zone._id!)

  if (map.getSource(sid)) return // sudah ada

  map.addSource(sid, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: zone.location,
      properties: { name: zone.name },
    },
  })

  // Fill layer
  map.addLayer({
    id: zoneFillId(zone._id!),
    type: 'fill',
    source: sid,
    paint: {
      'fill-color': zone.color ?? '#1D9E75',
      'fill-opacity': 0.2,
    },
  })

  // Border layer
  map.addLayer({
    id: zoneLineId(zone._id!),
    type: 'line',
    source: sid,
    paint: {
      'line-color': zone.color ?? '#1D9E75',
      'line-width': 2,
    },
  })
}

function removeZoneFromMap(map: maplibregl.Map, id: string) {
  const fillId = zoneFillId(id)
  const lineId = zoneLineId(id)
  const srcId  = zoneSourceId(id)
  if (map.getLayer(fillId)) map.removeLayer(fillId)
  if (map.getLayer(lineId)) map.removeLayer(lineId)
  if (map.getSource(srcId)) map.removeSource(srcId)
}

export function ZoneLayers({ map }: ZoneLayersProps) {
  const { zones, visibleZoneIds } = useMapStore()

  // Tambah/hapus layer saat zones berubah
  useEffect(() => {
    if (!map.isStyleLoaded()) return

    zones.forEach((zone) => {
      if (visibleZoneIds.has(zone._id!)) {
        addZoneToMap(map, zone)
      } else {
        removeZoneFromMap(map, zone._id!)
      }
    })
  }, [map, zones, visibleZoneIds])

  // Cleanup semua layer saat unmount
  useEffect(() => {
    return () => {
      zones.forEach((zone) => removeZoneFromMap(map, zone._id!))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null // komponen ini hanya side-effect, tidak render UI
}