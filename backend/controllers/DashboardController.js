import RecyclingHistory from "../models/recyclingHistoryModel.js";
import asyncHandler from "express-async-handler";

const convertPointsToAbbreviation = (points) => {
  if (points >= 1000000000000) {
    return (points / 1000000000000).toFixed(2) + "T";
  } else if (points >= 1000000000) {
    return (points / 1000000000).toFixed(2) + "B";
  } else if (points >= 1000000) {
    return (points / 1000000).toFixed(2) + "M";
  } else if (points >= 1000) {
    return (points / 1000).toFixed(2) + "K";
  } else {
    return points.toFixed(2);
  }
};

export const getTotalRecyclingHistory = async (req, res) => {
  try {
    // Query the database to get all recycling history
    const allTimeHistory = await RecyclingHistory.find({}).select("quantity");

    // Calculate the total recycling quantity for all time
    const totalQuantity = allTimeHistory.reduce(
      (acc, entry) => acc + entry.quantity,
      0
    );

    // Get the start and end dates for the current month
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Query the database to get the recycling history for the current and previous months
    const currentMonthHistory = await RecyclingHistory.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }, // Get records from the current month
    }).select("quantity");

    // Calculate the total recycling quantity for the current month
    const currentMonthTotal = currentMonthHistory.reduce(
      (acc, entry) => acc + entry.quantity,
      0
    );
    // Calculate the percentage increment for the current month compared to all time
    const percentageIncrement = (
      (currentMonthTotal / (totalQuantity - currentMonthTotal)) *
      100
    ).toFixed(2);

    const totalEntries = allTimeHistory.length;
    const formattedTotalQuantity = convertPointsToAbbreviation(totalQuantity);
    const formattedCurrentMonthTotal = convertPointsToAbbreviation(currentMonthTotal);

   
    return res.json({
      totalQuantity: formattedTotalQuantity,
      totalEntries,
      currentMonthTotal : formattedCurrentMonthTotal,
      percentageChange: percentageIncrement,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch total recycling history" });
  }
};

// @desc     GET Total Recycling History By User ID
// @route    GET /api/recycle/getTotalRecyclingHistoryByUserId/:id
// @access   Private
// Controller function to get the total recycling history of the user for all time
export const getTotalRecyclingHistoryByUserId = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming you're getting the user ID from the request parameters

    // Query the database to get all recycling history for the specific user
    const allTimeHistory = await RecyclingHistory.find({
      user: userId,
    }).select("quantity");

    // Calculate the total recycling quantity for all time
    const totalQuantity = allTimeHistory.reduce(
      (acc, entry) => acc + entry.quantity,
      0
    );

    // Get the start and end dates for the current month
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Query the database to get the recycling history for the current and previous months for the specific user
    const currentMonthHistory = await RecyclingHistory.find({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }, // Get records from the current month
    }).select("quantity");

    // Calculate the total recycling quantity for the current month
    const currentMonthTotal = currentMonthHistory.reduce(
      (acc, entry) => acc + entry.quantity,
      0
    );
    // Calculate the percentage increment for the current month compared to all time
    const percentageIncrement = (
      (currentMonthTotal / (totalQuantity - currentMonthTotal)) *
      100
    ).toFixed(2);

    const totalEntries = allTimeHistory.length;

    const formattedTotalQuantity = convertPointsToAbbreviation(totalQuantity);
    const formattedCurrentMonthTotal = convertPointsToAbbreviation(currentMonthTotal);

   
    return res.json({
      totalQuantity: formattedTotalQuantity,
      totalEntries,
      currentMonthTotal : formattedCurrentMonthTotal,
      percentageChange: percentageIncrement,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// @desc     GET Total Recycling History By User ID
// @route    GET /api/recycle/getMostRecycledWasteType/:id
// @access   Private
export const getMostRecycledWasteTypeByUserId = asyncHandler(
  async (req, res) => {
    const userId = req.params.id;
    const recyclingHistory = await RecyclingHistory.find({ user: userId });

    if (!recyclingHistory || recyclingHistory.length === 0) {
      // Return an empty response or an appropriate message
      return res.status(200).json("None");
    }

    const wasteTypeMap = {};
    recyclingHistory.forEach((record) => {
      if (wasteTypeMap[record.wasteType]) {
        wasteTypeMap[record.wasteType] += record.quantity;
      } else {
        wasteTypeMap[record.wasteType] = record.quantity;
      }
    });

    const sortedWasteTypes = Object.entries(wasteTypeMap).sort(
      (a, b) => b[1] - a[1]
    );

    const mostRecycledWasteType = sortedWasteTypes[0][0];
    res.status(200).json(mostRecycledWasteType);
  }
);

export const getMostRecycledWasteType = asyncHandler(async (req, res) => {
  // Get all recycling history records
  const allRecyclingHistory = await RecyclingHistory.find();

  if (!allRecyclingHistory || allRecyclingHistory.length === 0) {
    // Return an empty response or an appropriate message
    return res.status(200).json("None");
  }

  const wasteTypeMap = {};
  allRecyclingHistory.forEach((record) => {
    if (wasteTypeMap[record.wasteType]) {
      wasteTypeMap[record.wasteType] += record.quantity;
    } else {
      wasteTypeMap[record.wasteType] = record.quantity;
    }
  });

  const sortedWasteTypes = Object.entries(wasteTypeMap).sort(
    (a, b) => b[1] - a[1]
  );

  const mostRecycledWasteType = sortedWasteTypes[0][0];

  res.status(200).json(mostRecycledWasteType);
});

export const getRecyclingPercentagesByUser = asyncHandler(
  async (req, res, next) => {
    const userId = req.params.id;

    try {
      // Get all recycling records for the user
      const userRecycling = await RecyclingHistory.find({ user: userId });

      // Calculate recycling quantities for each waste type
      const wasteTypes = await RecyclingHistory.distinct("wasteType", {
        user: userId,
      });
      const totalRecyclingQuantities = {};
      for (const wasteType of wasteTypes) {
        const wasteTypeRecycling = userRecycling.filter(
          (recycling) => recycling.wasteType === wasteType
        );
        const wasteTypeQuantity = wasteTypeRecycling.reduce(
          (total, recycling) => {
            return total + recycling.quantity;
          },
          0
        );
        totalRecyclingQuantities[wasteType] = wasteTypeQuantity;
      }

      // Calculate recycling percentages for each waste type
      const recyclingPercentages = {};
      const totalQuantity = Object.values(totalRecyclingQuantities).reduce(
        (total, quantity) => {
          return total + quantity;
        },
        0
      );
      for (const [wasteType, quantity] of Object.entries(
        totalRecyclingQuantities
      )) {
        const percentage = ((quantity / totalQuantity) * 100).toFixed(2);
        recyclingPercentages[wasteType] = percentage;
      }

      // Sort the result by percentage values in ascending order
      const sortedResult = Object.entries(recyclingPercentages).sort(
        (a, b) => b[1] - a[1]
      );
      const sortedRecyclingPercentages = {};
      for (const [wasteType, percentage] of sortedResult) {
        sortedRecyclingPercentages[wasteType] = percentage;
      }

      res.json(sortedRecyclingPercentages);
    } catch (error) {
      next(error);
    }
  }
);

export const getRecyclingPercentages = asyncHandler(async (req, res, next) => {
  try {
    // Get all recycling records for all users
    const allRecycling = await RecyclingHistory.find();

    // Calculate recycling quantities for each waste type across all users
    const wasteTypes = await RecyclingHistory.distinct("wasteType");
    const totalRecyclingQuantities = {};
    for (const wasteType of wasteTypes) {
      const wasteTypeRecycling = allRecycling.filter(
        (recycling) => recycling.wasteType === wasteType
      );
      const wasteTypeQuantity = wasteTypeRecycling.reduce(
        (total, recycling) => {
          return total + recycling.quantity;
        },
        0
      );
      totalRecyclingQuantities[wasteType] = wasteTypeQuantity;
    }

    // Calculate recycling percentages for each waste type
    const recyclingPercentages = {};
    const totalQuantity = Object.values(totalRecyclingQuantities).reduce(
      (total, quantity) => {
        return total + quantity;
      },
      0
    );
    for (const [wasteType, quantity] of Object.entries(
      totalRecyclingQuantities
    )) {
      const percentage = ((quantity / totalQuantity) * 100).toFixed(2);
      recyclingPercentages[wasteType] = percentage;
    }

    // Sort the result by percentage values in descending order
    const sortedResult = Object.entries(recyclingPercentages).sort(
      (a, b) => b[1] - a[1]
    );
    const sortedRecyclingPercentages = {};
    for (const [wasteType, percentage] of sortedResult) {
      sortedRecyclingPercentages[wasteType] = percentage;
    }

    res.json(sortedRecyclingPercentages);
  } catch (error) {
    next(error);
  }
});
