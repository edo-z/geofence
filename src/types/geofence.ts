// src/types/geofence.ts

export type GeofenceCategory = 'demographic' | 'logistics' | 'restricted' | 'custom'

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

export interface IGeofence {
  _id?: string
  name: string
  category: GeofenceCategory
  description?: string
  location: GeoJSONPolygon
  color?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface SimulationResult {
  isInside: boolean
  zoneName: string | null
  zoneId: string | null
  distanceToBoundary: number | null // meter
  nearestEdge: string | null
}

export interface IntersectionResult {
  zoneA: string
  zoneB: string
  overlapAreaM2: number
  intersectionGeoJSON: GeoJSONPolygon | null
}

export type DrawMode = 'polygon' | 'circle' | 'line' | 'select' | null