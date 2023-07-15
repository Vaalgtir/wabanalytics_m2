import mongoose from "mongoose";
const { Schema } = mongoose;

const trackingEventSchema = new Schema(
  {
    event: String,
    tag: String,
    visitorId: String,
    appId: String,
  },
  { timestamps: true }
);

export const TrackingEvent = mongoose.model(
  "TrackingEvent",
  trackingEventSchema
);

const trackingSessionSchema = new Schema(
  {
    page: String,
    start: Date,
    end: { type: Date, default: Date.now },
    tag: String,

    visitorId: String,
    appId: String,
  },
  { timestamps: true }
);

export const TrackingSession = mongoose.model(
  "TrackingSession",
  trackingSessionSchema
);

const trackingLocationSchema = new Schema(
  {
    location: String,

    visitorId: String,
    appId: String,
  },
  { timestamps: true }
);

export const TrackingLocation = mongoose.model(
  "TrackingLocation",
  trackingLocationSchema
);

const trackingPositionSchema = new Schema(
  {
    x: Number,
    y: Number,
    screenSize: String,
    width: Number,
    height: Number,
    location: String,

    visitorId: String,
    appId: String,
  },
  { timestamps: true }
);

export const TrackingPosition = mongoose.model(
  "TrackingPosition",
  trackingPositionSchema
);
