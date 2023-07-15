import express from "express";

const routerDashboard = express.Router();

import { authAdmin, auth } from "../middleware/auth.js";
import {
  createApp,
  fetchApps,
  deleteApp,
  saveLayout,
  getLayout,
  editApp,
  createTunnelConversion,
  fetchOneApp,
} from "../controlers/dashboard/application.js";
import {
  countVisitor,
  averageTime,
  countVisitorLastWeek,
  bounceRate,
  pagePerVisitor,
  getEvents,
  countEvents,
  graphVisitorLastWeek,
  getConversionTunnel,
  tunnelConversionrate,
  tunnelConversionTab,
  visitorPerPageTab,
  getHeatmapsLocations,
  getHeatmapsPositions,
  getHeatmapsSizes,
  minDateStats,
} from "../controlers/dashboard/data.js";

routerDashboard.post("/fetchApps", auth, fetchApps);
routerDashboard.post("/fetchOneApp/:id", auth, fetchOneApp);
routerDashboard.post("/createApp", auth, createApp);
routerDashboard.post("/editApp/:id", auth, editApp);
routerDashboard.delete("/applications/:id", auth, deleteApp);

routerDashboard.post("/saveLayout", auth, saveLayout);
routerDashboard.post("/getLayout/:applicationId", auth, getLayout);

routerDashboard.post(
  "/createTunnelConversion/:applicationId",
  auth,
  createTunnelConversion
);
routerDashboard.post(
  "/tunnelConversionrate/:applicationId",
  auth,
  tunnelConversionrate
);
routerDashboard.post(
  "/tunnelConversionTab/:applicationId",
  auth,
  tunnelConversionTab
);
routerDashboard.post(
  "/getConversionTunnel/:applicationId",
  auth,
  getConversionTunnel
);

routerDashboard.post("/countVisitor/:applicationId", auth, countVisitor);
routerDashboard.post(
  "/countVisitorLastWeek/:applicationId",
  auth,
  countVisitorLastWeek
);
routerDashboard.post("/averageTime/:applicationId", auth, averageTime);
routerDashboard.post("/bounceRate/:applicationId", auth, bounceRate);
routerDashboard.post("/pagePerVisitor/:applicationId", auth, pagePerVisitor);
routerDashboard.post("/getEvents/:applicationId", auth, getEvents);
routerDashboard.post("/countEvents/:applicationId", auth, countEvents);
routerDashboard.post(
  "/graphVisitorLastWeek/:applicationId",
  auth,
  graphVisitorLastWeek
);
routerDashboard.post(
  "/visitorPerPageTab/:applicationId",
  auth,
  visitorPerPageTab
);

routerDashboard.post(
  "/getHeatmapsLocations/:applicationId",
  auth,
  getHeatmapsLocations
);
routerDashboard.post(
  "/getHeatmapsSizes/:applicationId",
  auth,
  getHeatmapsSizes
);
routerDashboard.post(
  "/getHeatmapsPositions/:applicationId",
  auth,
  getHeatmapsPositions
);
routerDashboard.post("/minDateStats/:applicationId", auth, minDateStats);

export default routerDashboard;
