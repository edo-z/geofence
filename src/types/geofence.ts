// src/types/geofence.ts

export type GeofenceCategory = 'demographic' | 'logistics' | 'restricted' | 'custom'

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number]
}

export interface IGeofence {
  _id?: string
  name: string
  category: GeofenceCategory
  description?: string
  location: GeoJSONPolygon
  color?: string
  // ── Notifikasi ──
  notifPhone?: string   // nomor WA tujuan, format: 628xxx
  notifActive?: boolean // toggle notifikasi on/off
  createdAt?: Date
  updatedAt?: Date
}

export interface SimulationResult {
  isInside: boolean
  zoneName: string | null
  zoneId: string | null
  distanceToBoundary: number | null
  nearestEdge: string | null
}

export interface IntersectionResult {
  zoneA: string
  zoneB: string
  overlapAreaM2: number
  intersectionGeoJSON: GeoJSONPolygon | null
}

export type DrawMode = 'polygon' | 'circle' | 'line' | 'select' | null

// ── Tracker ──
export interface ITrackerState {
  _id?: string
  objectId: string        // ID unik objek/device
  objectLabel?: string    // nama tampilan (opsional)
  lastZoneId: string | null
  lastZoneName: string | null
  lastPosition: GeoJSONPoint
  updatedAt?: Date
}

export interface TrackerPayload {
  objectId: string
  objectLabel?: string
  lat: number
  lng: number
}

export type ZoneEvent = 'entry' | 'exit' | 'none'

export interface NotifResult {
  event: ZoneEvent
  zoneId: string | null
  zoneName: string | null
  notifSent: boolean
  notifPhone?: string
}