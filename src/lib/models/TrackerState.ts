// src/lib/models/TrackerState.ts

import { Schema, model, models } from 'mongoose'
import type { ITrackerState } from '@/types/geofence'

const TrackerStateSchema = new Schema<ITrackerState>(
  {
    objectId: {
      type: String,
      required: true,
      unique: true, // satu dokumen per objek
      trim: true,
    },
    objectLabel: {
      type: String,
      default: '',
    },
    lastZoneId: {
      type: String,
      default: null,
    },
    lastZoneName: {
      type: String,
      default: null,
    },
    lastPosition: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
  },
  { timestamps: true }
)

TrackerStateSchema.index({ lastPosition: '2dsphere' })

export const TrackerState =
  models.TrackerState || model<ITrackerState>('TrackerState', TrackerStateSchema)