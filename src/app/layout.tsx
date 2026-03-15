// src/app/layout.tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import 'maplibre-gl/dist/maplibre-gl.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'GeoResearch — Platform Riset Geofencing',
  description: 'Tools interaktif untuk membuat, mengelola, dan mensimulasikan area geofencing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <html lang="id">
        <body><ClerkProvider>{children}</ClerkProvider></body>
      </html>
    
  )
}