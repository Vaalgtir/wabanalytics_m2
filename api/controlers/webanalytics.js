import {
  TrackingEvent,
  TrackingLocation,
  TrackingPosition,
  TrackingSession,
} from "../Mongo/Tracking.js";
import { errorManagement as Error } from "../security_public/error.js";

export const trackEvent = (req, res, next) => {
  const tracking = new TrackingEvent(JSON.parse(req.body));

  tracking
    .save()
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      Error(res, 500, err);
    });
};

export const trackSession = (req, res, next) => {
  const session = new TrackingSession(JSON.parse(req.body));

  session
    .save()
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      Error(res, 500, err);
    });
};

export const trackLocation = (req, res, next) => {
  const location = new TrackingLocation(JSON.parse(req.body));

  location
    .save()
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      Error(res, 500, err);
    });
};

export const trackPosition = (req, res, next) => {
  const { mousePosition, ...body } = JSON.parse(req.body);

  const promises = mousePosition.map((position) => {
    const positions = new TrackingPosition({ ...position, ...body });

    positions.save();
  });

  Promise.all(promises)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      Error(res, 500, err);
    });
};
