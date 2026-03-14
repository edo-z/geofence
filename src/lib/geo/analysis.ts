// src/lib/geo/analysis.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import pointToLineDistance   from '@turf/point-to-line-distance'
import getBearing            from '@turf/bearing'
import intersect             from '@turf/intersect'
import centroid              from '@turf/centroid'
import area                  from '@turf/area'
import length                from '@turf/length'
import {
  point,
  polygon,
  lineString,
} from '@turf/helpers'

import type { IGeofence, SimulationResult, IntersectionResult } from '@/types/geofence'

function polygonBoundary(zone: IGeofence) {
  return lineString(zone.location.coordinates[0])
}

export function pointInGeofences(
  lngLat: [number, number],
  zones: IGeofence[]
): SimulationResult {
  const pt = point(lngLat)
  for (const zone of zones) {
    const poly = polygon(zone.location.coordinates)
    if (booleanPointInPolygon(pt, poly)) {
      const dist = distanceToBoundary(lngLat, zone)
      return {
        isInside: true,
        zoneName: zone.name,
        zoneId: zone._id ?? null,
        distanceToBoundary: dist,
        nearestEdge: nearestEdgeLabel(lngLat, zone),
      }
    }
  }
  return { isInside: false, zoneName: null, zoneId: null, distanceToBoundary: null, nearestEdge: null }
}

/** Jarak titik ke batas zona dalam meter */
export function distanceToBoundary(lngLat: [number, number], zone: IGeofence): number {
  const pt   = point(lngLat)
  const line = polygonBoundary(zone)
  const km   = pointToLineDistance(pt, line as any, { units: 'kilometers' })
  return Math.round(km * 1000) // meter, dibulatkan ke integer
}

export function nearestEdgeLabel(lngLat: [number, number], zone: IGeofence): string {
  const pt       = point(lngLat)
  const c        = centroid(polygon(zone.location.coordinates))
  const brng     = getBearing(pt, c)
  const opposite = ((brng + 180) % 360)
  const dirs     = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return `${zone.name} / ${dirs[Math.round(opposite / 45) % 8]} edge`
}

export function findIntersections(zones: IGeofence[]): IntersectionResult[] {
  const results: IntersectionResult[] = []
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      try {
        const polyA = polygon(zones[i].location.coordinates)
        const polyB = polygon(zones[j].location.coordinates)
        const intersection = intersect(polyA as any, polyB as any)
        if (!intersection) continue
        results.push({
          zoneA: zones[i].name,
          zoneB: zones[j].name,
          overlapAreaM2: Math.round(area(intersection)), // m²
          intersectionGeoJSON:
            intersection.geometry.type === 'Polygon'
              ? (intersection.geometry as GeoJSON.Polygon)
              : null,
        })
      } catch { /* skip */ }
    }
  }
  return results
}

/** Luas zona dalam m² */
export function zoneAreaM2(zone: IGeofence): number {
  return Math.round(area(polygon(zone.location.coordinates)))
}

/** Keliling zona dalam meter */
export function zonePerimeterM(zone: IGeofence): number {
  return Math.round(length(polygonBoundary(zone) as any, { units: 'kilometers' }) * 1000)
}

export function zoneCentroid(zone: IGeofence): [number, number] {
  return centroid(polygon(zone.location.coordinates)).geometry.coordinates as [number, number]
}