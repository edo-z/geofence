# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GeoResearch is a geofencing research platform built with Next.js 16, MapLibre GL, and Turf.js. Users can draw polygons on an interactive map, save zones to MongoDB, simulate point-in-polygon tests, and export data to CSV/PDF.

## Commands

```bash
npm run dev      # Development server (Turbopack enabled)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI` - MongoDB connection string
- `NEXT_PUBLIC_MAPTILER_KEY` - MapTiler API key (optional, falls back to OSM tiles)
- Clerk authentication variables (automatically configured by Clerk CLI)

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/public/    # Landing page (public route)
│   ├── api/geofences/      # CRUD API for geofence data
│   ├── map/                # Main map application (protected)
│   └── sign-in|sign-up/    # Clerk auth pages
├── components/map/         # MapLibre/GL components
│   ├── MapClient.tsx       # Main map component, initializes MapLibre
│   ├── DrawTools.tsx       # MapboxDraw integration for polygon drawing
│   ├── ZoneLayers.tsx      # Renders saved zones on map
│   ├── LayerPanel.tsx      # Zone list with visibility toggle
│   ├── SimulationPanel.tsx # Point-in-polygon simulation UI
│   └── ExportPanel.tsx     # CSV/PDF export buttons
├── lib/
│   ├── db/mongoose.ts      # MongoDB singleton connection pattern
│   ├── models/Geofence.ts  # Mongoose schema (GeoJSON Polygon + 2dsphere)
│   ├── geo/analysis.ts     # Turf.js utilities (pointInPolygon, area, etc.)
│   └── export/exportUtils.ts # Client-side CSV/PDF generation
├── store/useMapStore.ts    # Zustand global state
└── types/geofence.ts       # TypeScript interfaces
```

### Key Patterns

**State Management**: Zustand (`useMapStore`) manages zones, draw mode, simulation results, and map state. Components access state directly via hooks.

**Database**: Mongoose with singleton connection pattern (prevents multiple connections during Next.js hot reload). Geofences stored as GeoJSON Polygons with 2dsphere index for geospatial queries.

**Map Integration**: MapboxDraw is mounted onto MapLibre GL map instance. Custom DRAW_STYLES array fixes `line-dasharray` incompatibility between Mapbox and MapLibre using `["literal", [...]]`.

**Authentication**: Clerk protects `/map` route. Public routes: `/public`, `/sign-in`, `/sign-up`. Root `/` redirects to `/public`.

**Export**: PDF export captures WebGL canvas via `map.getCanvas().toDataURL()` after `triggerRepaint()`. CSV/PDF generation runs client-side.

### Data Flow

1. User draws polygon → MapboxDraw fires `draw.create` → `onDrawComplete` callback
2. Draft coordinates stored in component state → SaveZoneModal opens
3. On save → POST `/api/geofences` → MongoDB → `addZone` updates Zustand
4. ZoneLayers component watches Zustand, renders GeoJSON sources on map
5. Click on map → `pointInGeofences()` from `lib/geo/analysis.ts` checks all zones

### Geospatial Analysis (lib/geo/analysis.ts)

- `pointInGeofences(lngLat, zones)` - Check if point is inside any zone
- `distanceToBoundary(lngLat, zone)` - Meters to nearest edge
- `findIntersections(zones)` - Find overlapping zones
- `zoneAreaM2(zone)` / `zonePerimeterM(zone)` - Area and perimeter calculations

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **TypeScript** with path alias `@/*` → `./src/*`
- **Tailwind CSS 4** with PostCSS
- **MapLibre GL** for mapping, **Mapbox GL Draw** for drawing
- **Turf.js** for geospatial analysis
- **Clerk** for authentication
- **MongoDB/Mongoose** for persistence
- **Zustand** for client state
- **jsPDF** for PDF generation