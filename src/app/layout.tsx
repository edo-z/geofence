// src/app/layout.tsx

import type { Metadata } from 'next'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'GeoResearch — Platform Riset Geofencing',
  description: 'Tools interaktif untuk membuat, mengelola, dan mensimulasikan area geofencing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}