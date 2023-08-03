import RecyclingHistory from "../models/recyclingHistoryModel.js";
import User from "../models/userModel.js";

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


export const calculatePoints = async (req, res) => {
    try {
  
      const recyclingHistory = await RecyclingHistory.find();
      let totalPoints = 0;
  
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
  
      // Customize the calculation logic based on your requirements
      for (const record of recyclingHistory) {
        // Base points calculation based on quantity
        let basePoints = record.quantity * 10;
  
        // Add bonus points based on recycling method and waste type
        if (record.recyclingMethod === "composting") {
          basePoints += 50; // Bonus points for composting
        } else if (record.recyclingMethod === "E-waste Recycling") {
          basePoints += 30; // Bonus points for E-waste recycling
        }
  
  
        totalPoints += basePoints;
      }
  
      // Get the points earned in the current month
      const currentMonthHistory = await RecyclingHistory.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });
  
      let currentMonthPoints = 0;
      for (const record of currentMonthHistory) {
        let basePoints = record.quantity * 10;
        if (record.recyclingMethod === "composting") {
          basePoints += 50;
        } else if (record.recyclingMethod === "E-waste Recycling") {
          basePoints += 30;
        }
        currentMonthPoints += basePoints;
      }
  
      // Calculate the percentage change in points earned for the current month compared to the previous month
  
      const percentageChange = (
        (currentMonthPoints / (totalPoints - currentMonthPoints)) *
        100
      ).toFixed(2);
      const formattedTotalPoints = convertPointsToAbbreviation(totalPoints);
      const formattedCurrentMonthPoints = convertPointsToAbbreviation(currentMonthPoints);
  
      res.json({
        totalPoints: formattedTotalPoints,
        currentMonthPoints: formattedCurrentMonthPoints,
        percentageChange,
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
export const calculatePointsById = async (req, res) => {
  try {
    const userId = req.params.id;

    const recyclingHistory = await RecyclingHistory.find({ user: userId });
    let totalPoints = 0;

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

    // Customize the calculation logic based on your requirements
    for (const record of recyclingHistory) {
      // Base points calculation based on quantity
      let basePoints = record.quantity * 10;

      // Add bonus points based on recycling method and waste type
      if (record.recyclingMethod === "composting") {
        basePoints += 50; // Bonus points for composting
      } else if (record.recyclingMethod === "E-waste Recycling") {
        basePoints += 30; // Bonus points for E-waste recycling
      }


      totalPoints += basePoints;
    }

    // Get the points earned in the current month
    const currentMonthHistory = await RecyclingHistory.find({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let currentMonthPoints = 0;
    for (const record of currentMonthHistory) {
      let basePoints = record.quantity * 10;
      if (record.recyclingMethod === "composting") {
        basePoints += 50;
      } else if (record.recyclingMethod === "E-waste Recycling") {
        basePoints += 30;
      }
      currentMonthPoints += basePoints;
    }

    // Calculate the percentage change in points earned for the current month compared to the previous month

    const percentageChange = (
      (currentMonthPoints / (totalPoints - currentMonthPoints)) *
      100
    ).toFixed(2);
    const formattedTotalPoints = convertPointsToAbbreviation(totalPoints);
    const formattedCurrentMonthPoints = convertPointsToAbbreviation(currentMonthPoints);

    res.json({
      totalPoints: formattedTotalPoints,
      currentMonthPoints: formattedCurrentMonthPoints,
      percentageChange,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const calculateAndRankUsers = async (req, res) => {
  try {
    // Retrieve all users from the User model
    const users = await User.find({ isAdmin: false });

    // Initialize an array to store user points and information
    const userPointsArray = [];

    for (const user of users) {
      // Retrieve the recycling history for the current user
      const recyclingHistory = await RecyclingHistory.find({ user: user._id });

      // Calculate the total points for the user
      let totalPoints = 0;

      for (const record of recyclingHistory) {
        // Base points calculation based on quantity
        let basePoints = record.quantity * 10;

        // Add bonus points based on recycling method and waste type
        if (record.recyclingMethod === "composting") {
          basePoints += 50; // Bonus points for composting
        } else if (record.recyclingMethod === "E-waste Recycling") {
          basePoints += 30; // Bonus points for E-waste recycling
        }

        totalPoints += basePoints;
      }


      // Add user points and information to the array
      userPointsArray.push({
        username: user.name,
        user_picture: user.picture.secure_url,
        totalPoints,
      });

    }


    // Sort the userPointsArray in descending order based on totalPoints
    userPointsArray.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks to users based on their position in the sorted array
    userPointsArray.forEach((userPoints, index) => {
      userPoints.rank = index + 1;

      userPoints.totalPoints = convertPointsToAbbreviation(userPoints.totalPoints);

    });

    res.json(userPointsArray);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

