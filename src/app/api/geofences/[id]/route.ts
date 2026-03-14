// src/app/api/geofences/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Geofence } from '@/lib/models/Geofence'

type Params = { params: Promise<{ id: string }> }

// GET /api/geofences/:id
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const { id } = await params
    const zone = await Geofence.findById(id).lean()
    if (!zone) {
      return NextResponse.json({ success: false, error: 'Zona tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: zone })
  } catch (error) {
    console.error('[GET /api/geofences/:id]', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/geofences/:id — update sebagian field
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()

    const updated = await Geofence.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Zona tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PATCH /api/geofences/:id]', error)
    return NextResponse.json({ success: false, error: 'Gagal update' }, { status: 400 })
  }
}

// DELETE /api/geofences/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const { id } = await params
    await Geofence.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Zona berhasil dihapus' })
  } catch (error) {
    console.error('[DELETE /api/geofences/:id]', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}