import { errorManagement as Error } from "../../security_public/error.js";
import { prisma } from "../../prisma/instance.js";
import { allowedDomains } from "../../app.js";

export const fetchApps = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const userId = parseInt(headers[2]);

  const applications = await prisma.applications
    .findMany({
      where: { userId },
      select: { id: true, name: true, domain: true },
    })
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json(applications);
};

export const fetchOneApp = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const userId = parseInt(headers[2]);
  const appId = req.params.id;

  const applications = await prisma.applications
    .findFirst({
      where: { userId, id: appId },
      select: { name: true, domain: true },
    })
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json(applications);
};

export const createApp = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const userId = parseInt(headers[2]);
  const { name, domain } = req.body;

  const { userIdRelation, ...results } = await prisma.applications
    .create({
      data: {
        userId,
        name,
        domain,
      },
    })
    .catch((err) => {
      Error(res, 500, err);
    });

  if (!allowedDomains.includes(domain)) {
    allowedDomains.push(domain);
  }

  res.status(200).json(results);
};

export const editApp = async (req, res, next) => {
  const { name, domain } = req.body;
  const appId = req.params.id;

  const { userIdRelation, ...results } = await prisma.applications
    .update({
      where: { id: appId },
      data: {
        name,
        domain,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  if (!allowedDomains.includes(domain)) {
    allowedDomains.push(domain);
  }

  res.status(200).json(results);
};

export const deleteApp = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const userId = parseInt(headers[2]);
  const { id: appId } = req.params;

  await prisma.applications
    .deleteMany({
      where: {
        AND: [{ id: appId }, { userId }],
      },
    })
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json({ message: "app supprimé" });
};

export const saveLayout = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const userId = parseInt(headers[2]);
  const { applicationId, layout } = req.body;

  const results = await prisma.dashboard
    .upsert({
      where: {
        applicationId,
      },
      update: { layout },
      create: {
        userId,
        applicationId,
        layout,
      },
    })
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(201).json(results);
};

export const getLayout = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const userId = parseInt(headers[2]);
  const { applicationId } = req.params;

  const results = await prisma.dashboard
    .findMany({
      select: {
        // id: true,
        layout: true,
      },
      where: {
        AND: [{ userId }, { applicationId }],
      },
    })
    .catch((err) => {
      // Error(res, 500, err);
    });

  res.status(200).json(results?.[0]?.layout || "null");
};

export const editLayout = async (req, res, next) => {
  const headers = req.headers.authorization.split(" ");
  const userId = parseInt(headers[2]);
  const { applicationId } = req.params;
  const { layout } = req.body;

  const results = await prisma.dashboard
    .updateMany({
      data: { layout },
      where: {
        AND: [{ userId }, { applicationId }],
      },
    })
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json(results);
};

export const createTunnelConversion = async (req, res, next) => {
  const { applicationId } = req.params;
  const { path, name } = req.body;

  const results = await prisma.conversion_tunnel
    .create({
      data: { applicationId, path, name },
    })
    .catch((err) => {
      console.log(err);
      Error(res, 500, err);
    });

  res.status(200).json(results);
};
