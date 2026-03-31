// src/app/api/tracker/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Geofence } from '@/lib/models/Geofence'
import { TrackerState } from '@/lib/models/TrackerState'
import { pointInGeofences } from '@/lib/geo/analysis'
import { sendWhatsApp, buildNotifMessage } from '@/lib/wasender'
import type { IGeofence, TrackerPayload, ZoneEvent, NotifResult } from '@/types/geofence'

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as TrackerPayload
        const { objectId, objectLabel = objectId, lat, lng } = body

        if (!objectId || typeof lat !== 'number' || typeof lng !== 'number') {
            return NextResponse.json(
                { error: 'objectId, lat, dan lng wajib diisi' },
                { status: 400 }
            )
        }

        await connectDB()

        // 1. Ambil semua zona dari MongoDB
        const zones = (await Geofence.find({}).lean()) as IGeofence[]

        // 2. Cek posisi saat ini ada di zona mana
        const checkResult = pointInGeofences([lng, lat], zones)
        const currentZoneId = checkResult.isInside ? checkResult.zoneId : null
        const currentZoneName = checkResult.isInside ? checkResult.zoneName : null

        // 3. Ambil state terakhir objek ini
        const prevState = await TrackerState.findOne({ objectId }).lean()
        const prevZoneId = prevState?.lastZoneId ?? null

        // 4. Deteksi event entry / exit
        let event: ZoneEvent = 'none'
        if (!prevZoneId && currentZoneId) {
            event = 'entry' // sebelumnya di luar, sekarang di dalam
        } else if (prevZoneId && !currentZoneId) {
            event = 'exit'  // sebelumnya di dalam, sekarang di luar
        } else if (prevZoneId && currentZoneId && prevZoneId !== currentZoneId) {
            // Pindah langsung antar zona — anggap exit lama + entry baru
            // Untuk simplisitas, kita fire entry ke zona baru
            event = 'entry'
        }

        // 5. Update TrackerState (upsert — insert jika belum ada)
        await TrackerState.findOneAndUpdate(
            { objectId },
            {
                objectId,
                objectLabel,
                lastZoneId: currentZoneId,
                lastZoneName: currentZoneName,
                lastPosition: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
            },
            { upsert: true, returnDocument: 'after' }
        )

        // 6. Kirim notifikasi jika ada event dan zona punya notif aktif
        let notifResult: NotifResult = {
            event,
            zoneId: currentZoneId ?? prevZoneId,
            zoneName: currentZoneName ?? prevState?.lastZoneName ?? null,
            notifSent: false,
        }

        if (event !== 'none') {
            // Zona yang relevan: entry → zona baru, exit → zona lama
            const relevantZoneId = event === 'entry' ? currentZoneId : prevZoneId
            const relevantZone = zones.find(
                z => String(z._id) === String(relevantZoneId)
            )

            if (!relevantZone) {
                console.log('[tracker] relevantZone tidak ditemukan, relevantZoneId:', relevantZoneId)
                console.log('[tracker] zones ids:', zones.map(z => String(z._id)))
            }

            if (relevantZone?.notifActive && relevantZone?.notifPhone) {
                const message = buildNotifMessage({
                    event,
                    objectLabel,
                    zoneName: relevantZone.name,
                    lat,
                    lng,
                    timestamp: new Date(),
                })

                const waResult = await sendWhatsApp(relevantZone.notifPhone, message)
                notifResult.notifSent = waResult.success
                notifResult.notifPhone = relevantZone.notifPhone

                if (!waResult.success) {
                    console.error('[tracker] Notif gagal:', waResult.error)
                }
            }
        }

        return NextResponse.json({
            ok: true,
            objectId,
            currentZoneId,
            currentZoneName,
            prevZoneId,
            ...notifResult,
        })
    } catch (err) {
        console.error('[tracker] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET — ambil semua state tracker (untuk monitoring)
export async function GET() {
    try {
        await connectDB()
        const states = await TrackerState.find({}).sort({ updatedAt: -1 }).lean()
        return NextResponse.json({ states })
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}   