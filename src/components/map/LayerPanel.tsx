'use client'

// src/components/map/LayerPanel.tsx

import { useMapStore } from '@/store/useMapStore'

export function LayerPanel() {
  const { zones, visibleZoneIds, selectedZoneId, toggleZoneVisibility, selectZone, removeZone } =
    useMapStore()

  if (zones.length === 0) {
    return (
      <div className="p-4 text-xs text-gray-400 text-center leading-relaxed">
        Belum ada zona tersimpan.<br />Gambar polygon di peta untuk memulai.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {zones.map((zone) => {
        const isVisible  = visibleZoneIds.has(zone._id!)
        const isSelected = selectedZoneId === zone._id

        return (
          <div
            key={zone._id}
            onClick={() => selectZone(isSelected ? null : zone._id!)}
            className={[
              'flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors',
              isSelected ? 'bg-teal-50' : 'hover:bg-gray-50',
            ].join(' ')}
          >
            {/* Color dot */}
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: zone.color ?? '#1D9E75' }}
            />

            {/* Name + category */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{zone.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{zone.category}</p>
            </div>

            {/* Toggle visibility */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleZoneVisibility(zone._id!) }}
              className="text-gray-300 hover:text-gray-600 transition-colors text-xs px-1"
              title={isVisible ? 'Sembunyikan' : 'Tampilkan'}
            >
              {isVisible ? '👁' : '🫣'}
            </button>

            {/* Delete */}
            <button
              onClick={async (e) => {
                e.stopPropagation()
                if (!confirm(`Hapus zona "${zone.name}"?`)) return
                await fetch(`/api/geofences/${zone._id}`, { method: 'DELETE' })
                removeZone(zone._id!)
              }}
              className="text-gray-300 hover:text-red-400 transition-colors text-xs px-1"
              title="Hapus zona"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}