import dayjs from "dayjs";
import { errorManagement as Error } from "../../security_public/error.js";

import {
  TrackingSession,
  TrackingEvent,
  TrackingLocation,
  TrackingPosition,
} from "../../Mongo/Tracking.js";
import { prisma } from "../../prisma/instance.js";

const getFilters = (reqFilter, from) => {
  console.log("debug", reqFilter, from);
  if (reqFilter?.isLastQuarter) {
    const lastQuarter = dayjs().subtract(15, "minutes").toDate();

    return { createdAt: { $gte: lastQuarter } };
  } else if (reqFilter?.isLastDay) {
    const lastDay = dayjs().subtract(1, "days").toDate();

    return { createdAt: { $gte: lastDay } };
  } else if (reqFilter?.maxDateFilter && reqFilter?.minDateFilter) {
    const minDate = dayjs(reqFilter.minDateFilter).toDate();
    const maxDate = dayjs(reqFilter.maxDateFilter).toDate();

    return { createdAt: { $gte: minDate, $lte: maxDate } };
  } else {
    return {};
  }
};

export const countVisitor = async (req, res, next) => {
  const { applicationId } = req.params;
  const { filter } = req.body;

  const countVisitors = await TrackingLocation.countDocuments({
    appId: applicationId,
    ...getFilters(filter, "countVisitor"),
  })
    .distinct("visitorId")
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json({ countVisitors: countVisitors.length });
};

export const countVisitorLastWeek = async (req, res, next) => {
  const { applicationId } = req.params;

  const sevenDaysAgo = dayjs().subtract(7, "days").toDate();

  const countVisitors = await TrackingLocation.countDocuments({
    appId: applicationId,
    createdAt: { $gte: sevenDaysAgo },
  })
    .distinct("visitorId")
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json({ countVisitors: countVisitors.length });
};

export const averageTime = async (req, res, next) => {
  const { applicationId } = req.params;
  const { filter } = req.body;

  const results = await TrackingSession.aggregate([
    {
      $match: {
        appId: applicationId,
        ...getFilters(filter, "averageTime"),
      },
    },
    {
      $group: {
        _id: null,
        averageTime: {
          $avg: {
            $dateDiff: {
              startDate: "$start",
              endDate: "$end",
              unit: "minute",
            },
          },
        },
      },
    },
  ]).catch((err) => {
    Error(res, 500, err);
  });

  res.status(200).json({ averageTime: results?.[0]?.averageTime || 0 });
};

export const bounceRate = async (req, res, next) => {
  const { applicationId } = req.params;
  const { filter } = req.body;

  const result = await TrackingLocation.aggregate([
    { $match: { appId: applicationId, ...getFilters(filter, "bounceRate") } },
    {
      $group: {
        _id: "$visitorId",
        uniqueLocations: { $addToSet: "$location" },
      },
    },
    { $match: { uniqueLocations: { $size: 1 } } },
    { $group: { _id: null, totalBounces: { $sum: 1 } } },
  ]);
  const countVisitors = await TrackingLocation.countDocuments({
    appId: applicationId,
    ...getFilters(filter, "bounceRate"),
  })
    .distinct("visitorId")
    .catch((err) => {
      Error(res, 500, err);
    });

  const totalBounces = result[0]?.totalBounces || 0;

  const bounceRateNan = ((totalBounces / countVisitors.length) * 100).toFixed(
    1
  );
  const bounceRate = isNaN(bounceRateNan) ? 0 : bounceRateNan;

  res.status(200).json({ bounceRate });
};

export const pagePerVisitor = async (req, res, next) => {
  const { applicationId } = req.params;
  const { filter } = req.body;

  const results = await TrackingLocation.aggregate([
    {
      $match: { appId: applicationId, ...getFilters(filter, "pagePerVisitor") },
    },
    {
      $group: {
        _id: "$visitorId",
        uniqueLocations: { $addToSet: "$location" },
      },
    },
    {
      $group: {
        _id: null,
        averageUniqueLocations: { $avg: { $size: "$uniqueLocations" } },
      },
    },
    {
      $project: {
        _id: 0,
        averageUniqueLocations: { $round: ["$averageUniqueLocations", 1] },
      },
    },
  ]).catch((err) => {
    Error(res, 500, err);
  });

  res
    .status(200)
    .json({ countPage: results?.[0]?.averageUniqueLocations || 0 });
};

export const getEvents = async (req, res, next) => {
  const { applicationId } = req.params;

  const results = await TrackingEvent.aggregate([
    {
      $match: {
        appId: applicationId,
      },
    },
    {
      $addFields: {
        tagEventPair: {
          $concat: ["$tag", "-", "$event"],
        },
      },
    },
    {
      $group: {
        _id: null,
        uniquePairs: { $addToSet: "$tagEventPair" },
      },
    },
    {
      $project: {
        _id: 0,
        uniquePairs: 1,
      },
    },
  ]).catch((err) => {
    Error(res, 500, err);
  });

  res.status(200).json({ events: results?.[0]?.uniquePairs });
};

export const countEvents = async (req, res, next) => {
  const { applicationId } = req.params;
  const { name, filter } = req.body;

  const results = await TrackingEvent.aggregate([
    {
      $match: {
        appId: applicationId,
        ...getFilters(filter, "countEvents"),
      },
    },
    {
      $addFields: {
        tagEventPair: {
          $concat: ["$tag", "-", "$event"],
        },
      },
    },
    {
      $group: {
        _id: "$tagEventPair",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        _id: `${name}`,
      },
    },
  ]).catch((err) => {
    Error(res, 500, err);
  });

  res.status(200).json({ count: results?.[0]?.count || 0 });
};

export const graphVisitorLastWeek = async (req, res, next) => {
  const { applicationId } = req.params;

  const sevenDaysAgo = dayjs().subtract(7, "days").startOf("day");
  const dateArray = [];
  for (let i = 1; i < 8; i++) {
    dateArray.push(sevenDaysAgo.add(i, "day").format("MM/DD"));
  }

  const results = await TrackingLocation.aggregate([
    {
      $match: {
        appId: applicationId,
        createdAt: { $gte: sevenDaysAgo.toDate() },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } },
        visitorCount: { $addToSet: "$visitorId" },
      },
    },
    {
      $set: {
        visitorCounts: {
          $map: {
            input: dateArray,
            as: "date",
            in: {
              date: "$$date",
              visitorCount: {
                $cond: [
                  { $eq: ["$_id", "$$date"] },
                  { $size: "$visitorCount" },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $unwind: "$visitorCounts",
    },
    {
      $project: {
        _id: 0,
        date: "$visitorCounts.date",
        visitorCount: "$visitorCounts.visitorCount",
      },
    },
    {
      $sort: { date: 1 },
    },
  ]).catch((err) => {
    Error(res, 500, err);
  });

  res.status(200).json({ dataGraph: results });
};

export const getConversionTunnel = async (req, res, next) => {
  const { applicationId } = req.params;

  const tunnels = await prisma.conversion_tunnel
    .findMany({
      where: { applicationId },
      select: {
        id: true,
        name: true,
        path: true,
      },
    })
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json({ tunnels });
};

export const tunnelConversionrate = async (req, res, next) => {
  const { applicationId: appId } = req.params;
  const { path: pathRaw, filter } = req.body;

  const locations = JSON.parse(pathRaw);

  const results = await TrackingLocation.aggregate([
    {
      $match: {
        appId: appId,
        location: { $in: locations },
        ...getFilters(filter, "tunnelConversionrate"),
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: "$visitorId",
        count: { $sum: 1 },
        createdAt: { $min: "$createdAt" },
        documents: { $push: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "trackinglocations",
        let: { visitorId: "$_id", locations },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$visitorId", "$$visitorId"] },
                  { $in: ["$location", "$$locations"] },
                ],
              },
            },
          },
          {
            $sort: {
              createdAt: 1,
            },
          },
        ],
        as: "sortedDocuments",
      },
    },
    {
      $match: {
        $expr: {
          $eq: [{ $size: "$sortedDocuments" }, locations.length],
        },
      },
    },
  ]).catch((err) => {
    console.log(err);
  });

  const countVisitors = await TrackingLocation.countDocuments({
    appId,
    ...getFilters(filter, "tunnelConversionrate"),
  })
    .distinct("visitorId")
    .catch((err) => {
      Error(res, 500, err);
    });

  const countSuccess = results.length;

  res.status(200).json({
    successRate: ((countSuccess / countVisitors.length) * 100).toFixed(1),
  });
};

export const tunnelConversionTab = async (req, res, next) => {
  const { applicationId: appId } = req.params;
  const { path: pathRaw, filter } = req.body;

  const results = {};

  const allLocations = JSON.parse(pathRaw);

  const countVisitors = await TrackingLocation.countDocuments({
    appId,
    ...getFilters(filter, "tunnelConversionTab"),
  })
    .distinct("visitorId")
    .catch((err) => {
      Error(res, 500, err);
    });

  for (let index = 0; index < allLocations.length; index++) {
    const locations = allLocations.slice(0, index + 1);

    const countSuccess = await TrackingLocation.aggregate([
      {
        $match: {
          appId: appId,
          location: { $in: locations },
          ...getFilters(filter, "tunnelConversionTab"),
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$visitorId",
          count: { $sum: 1 },
          createdAt: { $min: "$createdAt" },
          documents: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "trackinglocations",
          let: { visitorId: "$_id", locations },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$visitorId", "$$visitorId"] },
                    { $in: ["$location", "$$locations"] },
                  ],
                },
              },
            },
            {
              $sort: {
                createdAt: 1,
              },
            },
          ],
          as: "sortedDocuments",
        },
      },
      {
        $match: {
          $expr: {
            $eq: [{ $size: "$sortedDocuments" }, locations.length],
          },
        },
      },
    ]).catch((err) => {
      console.log(err);
    });

    results[allLocations[index]] = {
      successRate: ((countSuccess.length / countVisitors.length) * 100).toFixed(
        1
      ),
    };
  }

  res.status(200).json({
    detailConversion: results,
  });
};

export const visitorPerPageTab = async (req, res, next) => {
  const { applicationId } = req.params;
  const { filter } = req.body;

  const results = await TrackingLocation.aggregate([
    {
      $match: {
        appId: applicationId,
        ...getFilters(filter, "visitorPerPageTab"),
      },
    },
    {
      $group: {
        _id: "$location",
        visitorCount: { $addToSet: "$visitorId" },
      },
    },
    {
      $project: {
        _id: 0,
        location: "$_id",
        visitorCount: "$visitorCount",
      },
    },
  ]).catch((err) => {
    Error(res, 500, err);
  });

  res.status(200).json({ visitorPerPage: results });
};

export const getHeatmapsLocations = async (req, res, next) => {
  const { applicationId } = req.params;

  const results = await TrackingPosition.countDocuments({
    appId: applicationId,
  })
    .distinct("location")
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json({ locations: results });
};

export const getHeatmapsSizes = async (req, res, next) => {
  const { applicationId } = req.params;
  const { location } = req.body;

  const results = await TrackingPosition.countDocuments({
    appId: applicationId,
    location,
  })
    .distinct("screenSize")
    .catch((err) => {
      Error(res, 500, err);
    });

  res.status(200).json({ screenSizes: results });
};

export const getHeatmapsPositions = async (req, res, next) => {
  const { applicationId } = req.params;
  const { location, screenSize } = req.body;

  const results = await TrackingPosition.aggregate([
    {
      $match: {
        appId: applicationId,
        location,
        screenSize,
      },
    },
    {
      $group: {
        _id: { x: "$x", y: "$y", width: "$width", height: "$height" },
        value: { $sum: 1 },
      },
    },
  ]).catch((err) => {
    Error(res, 500, err);
  });

  res.status(200).json({ positions: results });
};

export const minDateStats = async (req, res, next) => {
  const { applicationId } = req.params;

  const pipeline = [
    {
      $match: { appId: applicationId },
    },
    {
      $project: {
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: null,
        minCreatedAt: { $min: "$createdAt" },
      },
    },
  ];

  const schemas = [TrackingEvent, TrackingSession, TrackingLocation];

  Promise.all(
    schemas.map((schema) => {
      return schema.aggregate(pipeline).exec();
    })
  )
    .then((results) => {
      const minCreatedAtValues = results.map((result) => {
        return result.length > 0 ? result[0].minCreatedAt : null;
      });

      const minCreatedAt = new Date(Math.min(...minCreatedAtValues));

      res.status(200).json({ minDateReq: minCreatedAt });
    })
    .catch((err) => {
      Error(res, 500, err);
    });
};
