'use client'

// src/components/map/SaveZoneModal.tsx
// Modal muncul setelah user selesai menggambar polygon

import { useState } from 'react'
import type { GeofenceCategory, IGeofence } from '@/types/geofence'

interface SaveZoneModalProps {
  coordinates: number[][][]
  onSave: (zone: IGeofence) => void
  onCancel: () => void
}

const CATEGORIES: { value: GeofenceCategory; label: string }[] = [
  { value: 'demographic', label: 'Demografis' },
  { value: 'logistics',   label: 'Logistik' },
  { value: 'restricted',  label: 'Restricted' },
  { value: 'custom',      label: 'Custom' },
]

const COLORS = ['#1D9E75', '#378ADD', '#E24B4A', '#EF9F27', '#7F77DD', '#D4537E']

export function SaveZoneModal({ coordinates, onSave, onCancel }: SaveZoneModalProps) {
  const [name, setName]           = useState('')
  const [category, setCategory]   = useState<GeofenceCategory>('custom')
  const [description, setDesc]    = useState('')
  const [color, setColor]         = useState(COLORS[0])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Nama zona wajib diisi'); return }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description,
          color,
          location: { type: 'Polygon', coordinates },
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan')

      onSave(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Simpan zona baru</h2>
          <p className="text-xs text-gray-400 mt-0.5">{coordinates[0].length - 1} titik sudut</p>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3">

          {/* Name */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nama zona</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="cth. Zona A, Kawasan Industri"
              className="w-full px-3 py-2 text-sm rounded-lg border text-slate-500 border-gray-200 focus:outline-none focus:border-teal-500 bg-gray-50"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as GeofenceCategory)}
              className="w-full px-3 py-2 text-sm rounded-lg border text-slate-500 border-gray-200 focus:outline-none focus:border-teal-500 bg-gray-50"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Warna</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: color === c ? '#111' : 'transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Deskripsi (opsional)</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder="Catatan atau keterangan zona..."
              className="w-full px-3 py-2 text-sm rounded-lg border text-slate-500 border-gray-200 focus:outline-none focus:border-teal-500 bg-gray-50 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Menyimpan...' : 'Simpan zona'}
          </button>
        </div>

      </div>
    </div>
  )
}