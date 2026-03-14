// src/app/map/page.tsx
// Server component — hanya render layout, MapClient adalah client component

import { MapClient } from '@/components/map/MapClient'

export default function MapPage() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <MapClient />
    </main>
  )
}