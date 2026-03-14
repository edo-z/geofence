// src/store/useMapStore.ts

import { create } from 'zustand'
import type { IGeofence, DrawMode, SimulationResult } from '@/types/geofence'

interface MapState {
  // Zones
  zones: IGeofence[]
  selectedZoneId: string | null
  visibleZoneIds: Set<string>

  // Draw
  activeDrawMode: DrawMode
  draftCoordinates: number[][][] | null

  // Simulation
  testPoint: [number, number] | null // [lng, lat]
  simulationResult: SimulationResult | null

  // UI
  mapCenter: [number, number] // [lng, lat]
  mapZoom: number
  cursorCoords: [number, number] | null

  // Actions
  setZones: (zones: IGeofence[]) => void
  addZone: (zone: IGeofence) => void
  updateZone: (id: string, data: Partial<IGeofence>) => void
  removeZone: (id: string) => void
  selectZone: (id: string | null) => void
  toggleZoneVisibility: (id: string) => void

  setDrawMode: (mode: DrawMode) => void
  setDraftCoordinates: (coords: number[][][] | null) => void

  setTestPoint: (point: [number, number] | null) => void
  setSimulationResult: (result: SimulationResult | null) => void

  setMapCenter: (center: [number, number]) => void
  setMapZoom: (zoom: number) => void
  setCursorCoords: (coords: [number, number] | null) => void
}

export const useMapStore = create<MapState>((set) => ({
  zones: [],
  selectedZoneId: null,
  visibleZoneIds: new Set(),
  activeDrawMode: null,
  draftCoordinates: null,
  testPoint: null,
  simulationResult: null,
  mapCenter: [112.794, -7.279],
  mapZoom: 17,
  cursorCoords: null,

  setZones: (zones) =>
    set({ zones, visibleZoneIds: new Set(zones.map((z) => z._id!)) }),

  addZone: (zone) =>
    set((s) => ({
      zones: [...s.zones, zone],
      visibleZoneIds: new Set([...s.visibleZoneIds, zone._id!]),
    })),

  updateZone: (id, data) =>
    set((s) => ({
      zones: s.zones.map((z) => (z._id === id ? { ...z, ...data } : z)),
    })),

  removeZone: (id) =>
    set((s) => {
      const next = new Set(s.visibleZoneIds)
      next.delete(id)
      return { zones: s.zones.filter((z) => z._id !== id), visibleZoneIds: next }
    }),

  selectZone: (id) => set({ selectedZoneId: id }),

  toggleZoneVisibility: (id) =>
    set((s) => {
      const next = new Set(s.visibleZoneIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { visibleZoneIds: next }
    }),

  setDrawMode: (mode) => set({ activeDrawMode: mode }),
  setDraftCoordinates: (coords) => set({ draftCoordinates: coords }),
  setTestPoint: (point) => set({ testPoint: point }),
  setSimulationResult: (result) => set({ simulationResult: result }),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setCursorCoords: (coords) => set({ cursorCoords: coords }),
}))