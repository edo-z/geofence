// src/lib/export/exportUtils.ts
// Export ke CSV dan PDF — berjalan di client side (browser)

import type { IGeofence, SimulationResult } from '@/types/geofence'
import { zoneAreaM2, zonePerimeterM, zoneCentroid } from '@/lib/geo/analysis'

// ─────────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  const str = String(val ?? '')
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

function buildCsvRow(cells: unknown[]): string {
  return cells.map(escapeCsv).join(',')
}

export function exportZonesToCsv(
  zones: IGeofence[],
  simLog: SimulationResult[]
): void {
  const rows: string[] = []

  // ── Sheet 1: Zone metadata + stats ──
  rows.push('# ZONE DATA')
  rows.push(
    buildCsvRow([
      'Name', 'Category', 'Description',
      'Area (m2)', 'Perimeter (m)',
      'Centroid Lat', 'Centroid Lng',
      'Vertices', 'Color', 'Created At',
    ])
  )

  for (const z of zones) {
    const area      = zoneAreaM2(z)
    const perimeter = zonePerimeterM(z)
    const [lng, lat] = zoneCentroid(z)
    const vertices  = z.location.coordinates[0].length - 1
    rows.push(
      buildCsvRow([
        z.name,
        z.category,
        z.description ?? '',
        area,
        perimeter,
        lat.toFixed(6),
        lng.toFixed(6),
        vertices,
        z.color ?? '#1D9E75',
        z.createdAt ? new Date(z.createdAt).toISOString() : '',
      ])
    )
  }

  // ── Sheet 2: GeoJSON coordinates ──
  rows.push('')
  rows.push('# ZONE COORDINATES (GeoJSON)')
  rows.push(buildCsvRow(['Name', 'Ring Index', 'Point Index', 'Longitude', 'Latitude']))

  for (const z of zones) {
    z.location.coordinates.forEach((ring, ri) => {
      ring.forEach(([lng, lat], pi) => {
        rows.push(buildCsvRow([z.name, ri, pi, lng.toFixed(8), lat.toFixed(8)]))
      })
    })
  }

  // ── Sheet 3: Simulation log ──
  if (simLog.length > 0) {
    rows.push('')
    rows.push('# SIMULATION LOG')
    rows.push(buildCsvRow(['Zone Name', 'Status', 'Distance to Boundary (m)', 'Nearest Edge']))
    for (const s of simLog) {
      rows.push(
        buildCsvRow([
          s.zoneName ?? 'Outside all zones',
          s.isInside ? 'Inside' : 'Outside',
          s.distanceToBoundary ?? '',
          s.nearestEdge ?? '',
        ])
      )
    }
  }

  // Trigger download
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `georesearch-export-${formatDate()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────────
// PDF Export
// ─────────────────────────────────────────────

export async function exportZonesToPdf(
  zones: IGeofence[],
  simLog: SimulationResult[],
  mapImageDataUrl?: string | null
): Promise<void> {
  const { default: jsPDF } = await import('jspdf')

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W    = 210
  const margin = 16
  let y = margin

  const teal  = [13, 158, 117]  as [number, number, number]
  const dark  = [30, 30, 30]    as [number, number, number]
  const muted = [120, 120, 120] as [number, number, number]
  const light = [245, 247, 245] as [number, number, number]

  // ── Helper functions ──
  const setFont = (size: number, style: 'normal' | 'bold' = 'normal', color = dark) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
  }

  const checkPage = (needed = 12) => {
    if (y + needed > 280) { doc.addPage(); y = margin }
  }

  const sectionHeader = (title: string) => {
    checkPage(16)
    doc.setFillColor(...teal)
    doc.roundedRect(margin, y, W - margin * 2, 8, 1, 1, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), margin + 4, y + 5.5)
    y += 12
  }

  // ── Cover / Header ──
  doc.setFillColor(...teal)
  doc.rect(0, 0, W, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GeoResearch', margin, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Geofencing Research Report', margin, 26)
  doc.setFontSize(8)
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, margin, 33)
  doc.text(`Total zones: ${zones.length}`, W - margin - 28, 33)
  y = 48

  // ── Map Screenshot ──
  // MapLibre menggunakan WebGL canvas — html2canvas tidak bisa capture WebGL.
  // Solusi: ambil langsung WebGL canvas element via querySelector,
  // ── Map Screenshot ──
  if (mapImageDataUrl) {
    try {
      sectionHeader('Map Overview')
      // Buat image element untuk dapat dimensi asli
      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.src = mapImageDataUrl
      })
      const imgW   = W - margin * 2
      const imgH   = (img.height / img.width) * imgW
      const clampH = Math.min(imgH, 85)
      checkPage(clampH + 4)
      doc.addImage(mapImageDataUrl, 'JPEG', margin, y, imgW, clampH)
      y += clampH + 6
    } catch {
      // Skip jika image gagal dimuat
    }
  }

  // ── Zone Summary Table ──
  sectionHeader('Zone Summary')

  const cols = {
    name:      { x: margin,      w: 42, label: 'Name' },
    category:  { x: margin + 42, w: 28, label: 'Category' },
    area:      { x: margin + 70, w: 24, label: 'Area (m²)' },
    perimeter: { x: margin + 94, w: 28, label: 'Perimeter (m)' },
    vertices:  { x: margin + 122, w: 22, label: 'Vertices' },
    centroid:  { x: margin + 144, w: 36, label: 'Centroid (lat, lng)' },
  }

  // Header row
  doc.setFillColor(230, 240, 230)
  doc.rect(margin, y, W - margin * 2, 7, 'F')
  Object.values(cols).forEach(({ x, label }) => {
    setFont(7, 'bold', [60, 60, 60])
    doc.text(label, x + 1, y + 5)
  })
  y += 7

  // Data rows
  zones.forEach((z, i) => {
    checkPage(8)
    if (i % 2 === 0) {
      doc.setFillColor(...light)
      doc.rect(margin, y, W - margin * 2, 7, 'F')
    }
    const area      = zoneAreaM2(z)
    const perimeter = zonePerimeterM(z)
    const [lng, lat] = zoneCentroid(z)
    const vertices  = z.location.coordinates[0].length - 1

    // Color dot
    const hex = z.color ?? '#1D9E75'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    doc.setFillColor(r, g, b)
    doc.circle(margin + 2, y + 3.5, 1.5, 'F')

    setFont(7, 'normal', dark)
    doc.text(z.name.slice(0, 20), cols.name.x + 5, y + 4.8)
    doc.text(z.category, cols.category.x + 1, y + 4.8)
    doc.text(String(area), cols.area.x + 1, y + 4.8)
    doc.text(String(perimeter), cols.perimeter.x + 1, y + 4.8)
    doc.text(String(vertices), cols.vertices.x + 1, y + 4.8)
    doc.text(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, cols.centroid.x + 1, y + 4.8)
    y += 7
  })

  y += 6

  // ── Zone Detail Cards ──
  sectionHeader('Zone Details')

  for (const z of zones) {
    checkPage(40)
    const area       = zoneAreaM2(z)
    const perimeter  = zonePerimeterM(z)
    const [lng, lat] = zoneCentroid(z)
    const cardY      = y  // snapshot y setelah checkPage agar card dimulai dari posisi benar

    const hex = z.color ?? '#1D9E75'
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    // Card border
    doc.setDrawColor(220, 230, 220)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, cardY, W - margin * 2, 32, 2, 2, 'D')

    // Color accent bar
    doc.setFillColor(r, g, b)
    doc.roundedRect(margin, cardY, 3, 32, 1, 1, 'F')

    // Zone name + category
    setFont(10, 'bold', dark)
    doc.text(z.name, margin + 7, cardY + 8)
    setFont(7, 'normal', muted)
    doc.text(z.category.toUpperCase(), margin + 7, cardY + 13)

    // Stats 2x2 grid
    const stats = [
      ['Area',      `${area} m\u00B2`],
      ['Perimeter', `${perimeter} m`],
      ['Vertices',  String(z.location.coordinates[0].length - 1)],
      ['Centroid',  `${lat.toFixed(5)}, ${lng.toFixed(5)}`],
    ]
    stats.forEach(([label, val], i) => {
      const sx = margin + 7 + (i % 2) * 80
      const sy = cardY + 20 + Math.floor(i / 2) * 7
      setFont(7, 'bold', muted)
      doc.text(label + ':', sx, sy)
      setFont(7, 'normal', dark)
      doc.text(val, sx + 20, sy)
    })

    // Description
    if (z.description) {
      setFont(7, 'normal', muted)
      doc.text(`Note: ${z.description.slice(0, 80)}`, margin + 7, cardY + 30)
    }

    y = cardY + 36
  }

  // ── Simulation Log ──
  if (simLog.length > 0) {
    sectionHeader('Simulation Log')

    simLog.forEach((s, i) => {
      checkPage(10)
      if (i % 2 === 0) {
        doc.setFillColor(...light)
        doc.rect(margin, y, W - margin * 2, 8, 'F')
      }

      // Status badge
      if (s.isInside) {
        doc.setFillColor(...teal)
      } else {
        doc.setFillColor(220, 60, 60)
      }
      doc.roundedRect(margin + 1, y + 1.5, 16, 5, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(s.isInside ? 'INSIDE' : 'OUTSIDE', margin + 3, y + 5)

      setFont(7, 'normal', dark)
      doc.text(s.zoneName ?? 'Outside all zones', margin + 20, y + 5)
      if (s.distanceToBoundary !== null) {
        setFont(7, 'normal', muted)
        doc.text(`${s.distanceToBoundary} m to boundary`, margin + 80, y + 5)
        if (s.nearestEdge) doc.text(s.nearestEdge, margin + 120, y + 5)
      }
      y += 8
    })
  }

  // ── Footer on all pages ──
  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(245, 247, 245)
    doc.rect(0, 287, W, 10, 'F')
    setFont(7, 'normal', muted)
    doc.text('GeoResearch — Geofencing Research Platform', margin, 293)
    doc.text(`Page ${p} / ${totalPages}`, W - margin - 16, 293)
  }

  doc.save(`georesearch-report-${formatDate()}.pdf`)
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(): string {
  return new Date().toISOString().slice(0, 10)
}