// src/lib/models/Geofence.ts

import mongoose, { Schema, model, models } from 'mongoose'
import type { IGeofence } from '@/types/geofence'

const GeofenceSchema = new Schema<IGeofence>(
  {
    name: {
      type: String,
      required: [true, 'Nama zona wajib diisi'],
      trim: true,
      maxlength: [100, 'Nama maksimal 100 karakter'],
    },
    category: {
      type: String,
      enum: ['demographic', 'logistics', 'restricted', 'custom'],
      default: 'custom',
    },
    description: {
      type: String,
      maxlength: [500, 'Deskripsi maksimal 500 karakter'],
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    color: {
      type: String,
      default: '#1D9E75',
    },
    // ── Notifikasi ──
    notifPhone: {
      type: String,
      default: '',
      validate: {
        validator: (v: string) => !v || /^62\d{9,13}$/.test(v),
        message: 'Format nomor harus diawali 62 (contoh: 6281234567890)',
      },
    },
    notifActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

GeofenceSchema.index({ location: '2dsphere' })

export const Geofence = models.Geofence || model<IGeofence>('Geofence', GeofenceSchema)