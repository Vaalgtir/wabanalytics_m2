import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

import routerUsers from "./routes/users.js";
import routerWebanalytics from "./routes/webanalytics.js";
import mongoose from "mongoose";
import routerDashboard from "./routes/dashboard.js";

import { prisma } from "./prisma/instance.js";
import { TrackingSession } from "./Mongo/Tracking.js";

export let allowedDomains;

// console.log("attempt");
// prisma.applications
//   .findMany({
//     select: { domain: true },
//   })
//   .then((domainsBdd) => {
//     console.log("done");
//     allowedDomains = [
//       process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
//       ...domainsBdd.map((item) => item.domain),
//     ];
//   })
//   .catch((err) => {
//     console.log(err);
//   });

mongoose
  .connect(
    "mongodb+srv://vaalgtir:L1aY3hoJNDldnlHl@cluster0.pjtzd.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connexion à MongoDB réussie !");
  })
  .catch((err) => console.log("Connexion à MongoDB échouée : ", err));

app.use(async (req, res, next) => {
  const origin = req.headers.origin;

  if (allowedDomains && allowedDomains.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", `${origin}`);
  } else {
    res.setHeader("Access-Control-Allow-Origin", `*`);
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, CSRF-Token"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use("/users", routerUsers);
app.use("/webanalytics", routerWebanalytics);
app.use("/dashboard", routerDashboard);

export default app;
