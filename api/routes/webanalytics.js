import express from "express";

const routerWebanalytics = express.Router();

import { authAdmin, auth } from "../middleware/auth.js";
import {
  trackSession,
  trackEvent,
  trackLocation,
  trackPosition,
} from "../controlers/webanalytics.js";
import bodyParser from "body-parser";
import { checkApplication } from "../middleware/applications.js";

routerWebanalytics.post(
  "/trackBeacon",
  express.text(),
  checkApplication,
  trackEvent
);
routerWebanalytics.post(
  "/trackSession",
  express.text(),
  checkApplication,
  trackSession
);
routerWebanalytics.post(
  "/trackLocation",
  express.text(),
  checkApplication,
  trackLocation
);
routerWebanalytics.post(
  "/trackPosition",
  express.text(),
  checkApplication,
  trackPosition
);

export default routerWebanalytics;
