// src/app/api/geofences/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Geofence } from '@/lib/models/Geofence'

// GET /api/geofences — ambil semua zona
export async function GET() {
  try {
    await connectDB()
    const zones = await Geofence.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: zones })
  } catch (error) {
    console.error('[GET /api/geofences]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data geofence' },
      { status: 500 }
    )
  }
}

// POST /api/geofences — simpan zona baru
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const zone = await Geofence.create({
      name: body.name,
      category: body.category ?? 'custom',
      description: body.description ?? '',
      location: body.location, // GeoJSON Polygon
      color: body.color ?? '#1D9E75',
    })

    return NextResponse.json({ success: true, data: zone }, { status: 201 })
  } catch (error: unknown) {
    console.error('[POST /api/geofences]', error)
    const msg =
      error instanceof Error ? error.message : 'Gagal menyimpan geofence'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}