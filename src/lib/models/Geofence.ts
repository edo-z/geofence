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
    // GeoJSON Polygon — format standar MongoDB geospatial
    location: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // Array of rings, each ring is array of [lng, lat] pairs
        required: true,
      },
    },
    color: {
      type: String,
      default: '#1D9E75',
    },
  },
  {
    timestamps: true, // createdAt + updatedAt otomatis
  }
)

// Index 2dsphere — wajib untuk query geospatial MongoDB ($geoWithin, $geoIntersects)
GeofenceSchema.index({ location: '2dsphere' })

// Hindari model recompile saat hot reload Next.js
export const Geofence = models.Geofence || model<IGeofence>('Geofence', GeofenceSchema)