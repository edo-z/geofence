'use client'

// src/components/map/ExportPanel.tsx

import { useState, useRef } from 'react'
import { useMapStore } from '@/store/useMapStore'
import { exportZonesToCsv, exportZonesToPdf } from '@/lib/export/exportUtils'
import type { SimulationResult } from '@/types/geofence'

interface ExportPanelProps {
  captureMap: () => Promise<string | null>
}

export function ExportPanel({ captureMap }: ExportPanelProps) {
  const { zones, simulationResult } = useMapStore()
  const [csvLoading, setCsvLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [message, setMessage]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const simLogRef = useRef<SimulationResult[]>([])

  if (simulationResult && !simLogRef.current.includes(simulationResult)) {
    simLogRef.current = [...simLogRef.current, simulationResult]
  }

  const notify = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCsv = async () => {
    if (zones.length === 0) { notify('err', 'Belum ada zona tersimpan'); return }
    setCsvLoading(true)
    try {
      exportZonesToCsv(zones, simLogRef.current)
      notify('ok', 'CSV berhasil didownload')
    } catch {
      notify('err', 'Gagal export CSV')
    } finally {
      setCsvLoading(false)
    }
  }

  const handlePdf = async () => {
    if (zones.length === 0) { notify('err', 'Belum ada zona tersimpan'); return }
    setPdfLoading(true)
    try {
      // Capture screenshot peta saat frame aktif
      const mapImageDataUrl = await captureMap()
      await exportZonesToPdf(zones, simLogRef.current, mapImageDataUrl)
      notify('ok', 'PDF berhasil didownload')
    } catch (e) {
      console.error(e)
      notify('err', 'Gagal export PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCsv}
        disabled={csvLoading || zones.length === 0}
        className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        <span className="text-green-600 font-bold text-[11px]">CSV</span>
        <span className="text-gray-600">{csvLoading ? 'Exporting...' : 'Export to CSV'}</span>
      </button>

      <button
        onClick={handlePdf}
        disabled={pdfLoading || zones.length === 0}
        className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        <span className="text-red-500 font-bold text-[11px]">PDF</span>
        <span className="text-gray-600">
          {pdfLoading ? 'Generating...' : 'Export to PDF'}
        </span>
      </button>

      {message && (
        <p className={[
          'text-[10px] px-2 py-1 rounded-md',
          message.type === 'ok' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600',
        ].join(' ')}>
          {message.text}
        </p>
      )}

      {zones.length === 0 && (
        <p className="text-[10px] text-gray-400">Gambar zona dulu untuk mengaktifkan export.</p>
      )}
    </div>
  )
}