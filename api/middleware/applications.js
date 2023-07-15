import jwt from "jsonwebtoken";

import { errorManagement } from "../security_public/error.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const applicationsCached = [];

export const checkApplication = (req, res, next) => {
  try {
    const { appId } = JSON.parse(req.body);

    if (applicationsCached.filter((item) => item.id === appId).length > 0) {
      next();
    } else {
      prisma.applications
        .findFirst({
          where: { id: appId },
        })
        .then((app) => {
          if (app) {
            applicationsCached.push(app);
            next();
          } else {
            throw "No application Id matched";
          }
        })
        .catch(() => {
          errorManagement(res, 401, { message: "Invalid request" });
        });
    }
  } catch (err) {
    errorManagement(res, 401, { message: "Invalid request" });
  }
};
