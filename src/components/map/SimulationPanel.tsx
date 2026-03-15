'use client'

// src/components/map/SimulationPanel.tsx

import { useState, useCallback } from 'react'
import { useMapStore } from '@/store/useMapStore'
import {
  pointInGeofences,
  findIntersections,
  zoneAreaM2,
  zonePerimeterM,
  zoneCentroid,
} from '@/lib/geo/analysis'
import type { SimulationResult, IntersectionResult } from '@/types/geofence'

type Tab = 'simulate' | 'spatial'

export function SimulationPanel() {
  const { zones, testPoint, setTestPoint, simulationResult, setSimulationResult } = useMapStore()

  const [tab, setTab]           = useState<Tab>('simulate')
  const [lat, setLat]           = useState(testPoint ? testPoint[1].toFixed(6) : '')
  const [lng, setLng]           = useState(testPoint ? testPoint[0].toFixed(6) : '')
  const [intersections, setIntersections] = useState<IntersectionResult[] | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')
  const [running, setRunning]   = useState(false)

  const runSimulation = useCallback(() => {
    const latN = parseFloat(lat)
    const lngN = parseFloat(lng)
    if (isNaN(latN) || isNaN(lngN)) return

    setRunning(true)
    setTestPoint([lngN, latN])

    // Turf.js berjalan di client — tidak perlu async
    const result = pointInGeofences([lngN, latN], zones)
    setSimulationResult(result)
    setRunning(false)
  }, [lat, lng, zones, setTestPoint, setSimulationResult])

  const runIntersections = useCallback(() => {
    const results = findIntersections(zones)
    setIntersections(results)
  }, [zones])

  const selectedZone = zones.find(z => z._id === selectedZoneId) ?? zones[0]

  return (
    <div className="w-72 shrink-0 bg-white border-l border-gray-100 flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-800">Research tools</p>
        
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {([['simulate', 'Simulation'], ['spatial', 'Spatial Query']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              'flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors',
              tab === id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Simulation ── */}
      {tab === 'simulate' && (
        <div className="flex flex-col gap-4 p-4">

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400">Zones loaded</p>
              <p className="text-xl font-medium text-gray-800">{zones.length}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400">Total vertices</p>
              <p className="text-xl font-medium text-gray-800">
                {zones.reduce((sum, z) => sum + (z.location.coordinates[0]?.length ?? 0) - 1, 0)}
              </p>
            </div>
          </div>

          {/* Coordinate input */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
              Point-in-polygon test
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Latitude</label>
                <input
                  type="number"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  placeholder="-7.2575"
                  step="0.0001"
                  className="w-full px-2.5 py-2 text-xs text-slate-700 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-400 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Longitude</label>
                <input
                  type="number"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  placeholder="112.752"
                  step="0.0001"
                  className="w-full px-2.5 py-2 text-xs text-slate-700 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-400 font-mono"
                />
              </div>
            </div>
            <button
              onClick={runSimulation}
              disabled={running || zones.length === 0}
              className="w-full py-2 text-xs rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 font-medium transition-colors"
            >
              {running ? 'Menghitung...' : 'Run simulation'}
            </button>
            {zones.length === 0 && (
              <p className="text-[10px] text-gray-400 text-center mt-1">
                Belum ada zona — gambar dulu di peta
              </p>
            )}
          </div>

          {/* Result */}
          {simulationResult && <SimResult result={simulationResult} />}

        </div>
      )}

      {/* ── Tab: Spatial Query ── */}
      {tab === 'spatial' && (
        <div className="flex flex-col gap-4 p-4">

          {/* Zone stats */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Zone stats</p>
            {zones.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada zona tersimpan.</p>
            ) : (
              <>
                <select
                  value={selectedZoneId}
                  onChange={e => setSelectedZoneId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border text-gray-700 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-400 mb-3"
                >
                  {zones.map(z => (
                    <option key={z._id} value={z._id}>{z.name}</option>
                  ))}
                </select>

                {selectedZone && <ZoneStats zone={selectedZone} />}
              </>
            )}
          </div>

          {/* Intersection finder */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
              Intersection finder
            </p>
            <button
              onClick={runIntersections}
              disabled={zones.length < 2}
              className="w-full py-2 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors mb-3"
            >
              Find all intersections
            </button>

            {intersections !== null && (
              intersections.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">
                  Tidak ada zona yang saling beririsan.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {intersections.map((r, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-medium text-amber-800">
                        {r.zoneA} ∩ {r.zoneB}
                      </p>
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        Overlap: {r.overlapAreaM2.toLocaleString()} m²
                      </p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>
      )}
    </div>
  )
}

// ── Sub-component: simulation result card ──
function SimResult({ result }: { result: SimulationResult }) {
  const isInside = result.isInside

  return (
    <div className={[
      'rounded-xl p-3 border',
      isInside
        ? 'bg-teal-50 border-teal-200'
        : 'bg-red-50 border-red-200',
    ].join(' ')}>
      <div className="flex items-center gap-2 mb-2">
        <div className={[
          'w-2 h-2 rounded-full',
          isInside ? 'bg-teal-500' : 'bg-red-400',
        ].join(' ')} />
        <p className={[
          'text-xs font-medium',
          isInside ? 'text-teal-700' : 'text-red-600',
        ].join(' ')}>
          {isInside ? `Inside ${result.zoneName}` : 'Outside all zones'}
        </p>
      </div>

      {isInside && result.distanceToBoundary !== null && (
        <>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Distance to boundary</span>
            <span className="font-medium text-gray-700">{result.distanceToBoundary} m</span>
          </div>
          {/* Progress bar: max scale 2000m */}
          <div className="h-1 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-400 transition-all duration-500"
              style={{ width: `${Math.min((result.distanceToBoundary / 2000) * 100, 100)}%` }}
            />
          </div>
          {result.nearestEdge && (
            <p className="text-[10px] text-gray-400 mt-1.5">
              Nearest: {result.nearestEdge}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ── Sub-component: zone stats ──
function ZoneStats({ zone }: { zone: import('@/types/geofence').IGeofence }) {
  const area      = zoneAreaM2(zone)
  const perimeter = zonePerimeterM(zone)
  const centroid  = zoneCentroid(zone)

  const rows = [
    { label: 'Area',      value: `${area} m²` },
    { label: 'Perimeter', value: `${perimeter} m` },
    { label: 'Vertices',  value: `${zone.location.coordinates[0].length - 1}` },
    { label: 'Centroid',  value: `${centroid[1].toFixed(4)}, ${centroid[0].toFixed(4)}` },
    { label: 'Category',  value: zone.category },
  ]

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex justify-between items-center px-3 py-2 border-b border-gray-100 last:border-0"
        >
          <span className="text-[10px] text-gray-400">{label}</span>
          <span className="text-xs font-medium text-gray-700 font-mono">{value}</span>
        </div>
      ))}
    </div>
  )
}