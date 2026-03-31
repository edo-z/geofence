// src/lib/wasender.ts

const WASENDER_API_URL = 'https://api.wasenderapi.com/api/send-message'
const API_KEY = process.env.WASENDER_API_KEY ?? ''

export interface WaSendResult {
  success: boolean
  error?: string
}

/**
 * Kirim pesan WhatsApp via WasenderAPI.
 * @param phone  Nomor tujuan format 628xxx (tanpa + atau spasi)
 * @param message Teks pesan
 */
export async function sendWhatsApp(
  phone: string,
  message: string
): Promise<WaSendResult> {
  if (!API_KEY) {
    console.error('[wasender] WASENDER_API_KEY belum diset di .env.local')
    return { success: false, error: 'API key tidak ditemukan' }
  }

  try {
    const res = await fetch(WASENDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        to: phone,
        text: message,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[wasender] Gagal kirim:', res.status, text)
      return { success: false, error: `HTTP ${res.status}` }
    }

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[wasender] Exception:', msg)
    return { success: false, error: msg }
  }
}

/** Format pesan entry/exit yang dikirim ke WhatsApp */
export function buildNotifMessage(params: {
  event: 'entry' | 'exit'
  objectLabel: string
  zoneName: string
  lat: number
  lng: number
  timestamp: Date
}): string {
  const { event, objectLabel, zoneName, lat, lng, timestamp } = params
  const waktu = timestamp.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'short',
    timeStyle: 'short',
  })
  const icon = event === 'entry' ? '🟢' : '🔴'
  const aksi = event === 'entry' ? 'memasuki' : 'meninggalkan'
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`

  return [
    `${icon} *GeoResearch Alert*`,
    ``,
    `Objek *${objectLabel}* ${aksi} zona *${zoneName}*`,
    ``,
    `📍 Posisi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    `🕐 Waktu: ${waktu}`,
    `🗺 Maps: ${mapsUrl}`,
  ].join('\n')
}