import RecyclingCollection from "../models/recyclingCollectionModel.js";
import RecyclingHistory from "../models/recyclingHistoryModel.js";
import asyncHandler from "express-async-handler";


// @desc     Create New Recycling Location
// @route    POST /api/recycle/location/create
// @access   Private/Admin
const createRecyclingLocation = asyncHandler(async (req, res) => {
  const { locationName, address, contactNumber, latitude, longitude } =
    req.body;

  // Check if a recycling location with the same name and address already exists
  const existingLocation = await RecyclingCollection.findOne({
    locationName,
    address,
  });
  if (existingLocation) {
    res.status(400);
    throw new Error("A recycling location with the same name and address already exists");

  }

  const recyclingLocation = await RecyclingCollection.create({
    locationName,
    address,
    contactNumber,
    latitude,
    longitude,
  });

  if (recyclingLocation) {
    res.status(201).json(recyclingLocation);
  } else {
    res.status(400).json({ error: "Invalid recycling location data" });
  }
});


// @desc     Get All Recycling Locations in Reverse Order
// @route    GET /api/recycle/location
// @access   Private
const getAllRecyclingLocations = asyncHandler(async (req, res, next) => {
  try {
    const recyclingLocations = await RecyclingCollection.find().sort({
      _id: -1,
    });

    res.json({
      data: recyclingLocations,
      page: 1,
      pages: 1,
    });
  } catch (error) {
    next(error);
  }
});

// @desc     Get Recycling Locations by Page and Search Keyword
// @route    GET /api/recycle/location?page=1&search=keyword
// @access   Private
const getRecyclingLocationsByPage = asyncHandler(async (req, res, next) => {
  const pageSize = 10;
  let page = Number(req.query.page) || 1;
  const searchKeyword = req.query.search || "";

  try {
    const query = searchKeyword
      ? {
          locationName: { $regex: new RegExp(searchKeyword, "i") },
        }
      : {};

    const count = await RecyclingCollection.countDocuments(query);

    const recyclingLocations = await RecyclingCollection.find(query)
      .sort({ _id: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.json({
      data: recyclingLocations,
      page,
      pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    next(error);
  }
});



// @desc     Delete a Recycling Location
// @route    DELETE /api/recycle/location/:id
// @access   Private/Admin
const deleteRecyclingLocation = asyncHandler(async (req, res) => {
  const recyclingLocation = await RecyclingCollection.findByIdAndDelete(
    req.params.id
  );

  if (recyclingLocation) {
    res.json({ message: "Recycling location removed" });
  } else {
    res.status(404).json({ error: "Recycling location not found" });
  }
});


// @desc     Update a Recycling Location
// @route    PUT /api/location/:id
// @access   Private/Admin
const updateRecyclingLocation = asyncHandler(async (req, res) => {
  const { locationName, address, contactNumber, latitude, longitude } =
    req.body;

  const recyclingLocation = await RecyclingCollection.findById(req.params.id);

  if (recyclingLocation) {
    recyclingLocation.locationName =
      locationName || recyclingLocation.locationName;
    recyclingLocation.address = address || recyclingLocation.address;
    recyclingLocation.contactNumber =
      contactNumber || recyclingLocation.contactNumber;
    recyclingLocation.latitude = latitude || recyclingLocation.latitude;
    recyclingLocation.longitude = longitude || recyclingLocation.longitude;

    const updatedRecyclingLocation = await recyclingLocation.save();
    res.json(updatedRecyclingLocation);
  } else {
    res.status(404).json({ error: "Recycling location not found" });
  }
});


// @desc     Get Recycling Location By ID
// @route    Get /api/location/:id
// @access   Private
const getRecyclingLocationById = asyncHandler(async (req, res) => {
  const recyclingLocation = await RecyclingCollection.findById(req.params.id);

  if (!recyclingLocation) {
    res.status(404);
    throw new Error("Recycling location not found");
  }

  res.json(recyclingLocation);
});


// @desc     Create New Recycling History
// @route    POST /api/recycle/create
// @access   Private
const createRecycle = asyncHandler(async (req, res) => {
  try {
    const { recyclingLocationId, recyclingMethod, quantity, wasteType, user_id } = req.body;
    let userId = null;
    if (req.user.isAdmin) {
      userId = user_id;
    } else {
      userId = req.user._id;
    }

    // Create a new recycling history record
    const recyclingHistory = new RecyclingHistory({
      user: userId,
      recyclingLocation: recyclingLocationId,
      recyclingMethod: recyclingMethod,
      quantity: quantity,
      wasteType: wasteType,
    });

    // Save the record to the database
    await recyclingHistory.save();

    // Send the response after the record is saved
    res.status(201).json({ message: "Recycling history record created successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while creating the recycling history record.",
    });
  }
});



// @desc     Delete a Recycling History
// @route    DELETE /api/recycle/delete/:id
// @access   Private
const deleteRecyclingHistory = asyncHandler(async (req, res) => {
  const recyclingHistory = await RecyclingHistory.findByIdAndDelete(
    req.params.id
  );

  if (recyclingHistory) {
    res.json({ message: "Recycling History removed" });
  } else {
    res.status(404).json({ error: "Recycling history not found" });
  }
});


// @desc     Update a Recycling History
// @route    PUT /api/recycle/update/:id
// @access   Private
const updateRecyclingHistory = asyncHandler(async (req, res) => {
  const { id, recyclingLocationId, recyclingMethod, quantity, wasteType } =
    req.body;

  const recyclingHistory = await RecyclingHistory.findById(req.params.id);

  if (recyclingHistory) {
    recyclingHistory.recyclingLocation =
      recyclingLocationId || recyclingHistory.recyclingLocationId;
    recyclingHistory.recyclingMethod =
      recyclingMethod || recyclingHistory.recyclingMethod;
    recyclingHistory.quantity = quantity || recyclingHistory.quantity;
    recyclingHistory.wasteType = wasteType || recyclingHistory.wasteType;

    const updatedRecyclingHistory = await recyclingHistory.save();
   
    res.json(updatedRecyclingHistory);
  } else {
    res.status(404).json({ error: "Recycling history not found" });
  }
});

// @desc     Get All Recycling Histories
// @route    GET /api/recycle/history
// @access   Private
const getAllRecyclingHistories = async (req, res, next) => {
  try {
    const recyclingHistories = await RecyclingHistory.find()
      .populate("user", "name _id")
      .populate("recyclingLocation", "locationName");
    const data = recyclingHistories.map((history) => ({
      id : history._id,
      user_id: history.user._id,
      user: history.user.name,
      recyclingLocationId: history.recyclingLocation._id,
      recyclingLocation: history.recyclingLocation ? history.recyclingLocation.locationName : "Unknown",
      recyclingMethod: history.recyclingMethod,
      wasteType: history.wasteType,
      quantity: history.quantity,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
    }));

    res.json({
      data: data,
      page: 1,
      pages: 1,
    });
  } catch (error) {
    next(error);
  }
};


const getRecyclingHistoryByUserIdAndPage = async (req, res) => {
  const pageSize = 8;
  let page = Number(req.query.page) || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  try {
    const userId = req.params.id;
    const recyclingHistory = await RecyclingHistory.find({ user: userId })
      .populate({
        path: "recyclingLocation",
        select: "locationName",
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize);

    const totalCount = await RecyclingHistory.countDocuments({ user: userId });

    recyclingHistory.forEach((record) => {
      if (!record.recyclingLocation) {
        record.recyclingLocation = null;
      }
    });

    const pagination = {};

    if (endIndex < totalCount) {
      pagination.next = {
        page: page + 1,
        pageSize: pageSize,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        pageSize: pageSize,
      };
    }

    res.status(200).json({
      data: recyclingHistory,
      page: page,
      pages: Math.ceil(totalCount / pageSize),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error:
        "An error occurred while retrieving the recycling history records.",
    });
  }
};

const getRecyclingHistoryForAllUsersByPage = async (req, res) => {
  const pageSize = 8;
  let page = Number(req.query.page) || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  try {
    const recyclingHistory = await RecyclingHistory.find()
    .populate({
      path: "user", 
      select: "name", 
    }).populate({
        path: "recyclingLocation",
        select: "locationName",
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize);

    const totalCount = await RecyclingHistory.countDocuments();

    recyclingHistory.forEach((record) => {
      if (!record.recyclingLocation) {
        record.recyclingLocation = null;
      }
    });

    const pagination = {};

    if (endIndex < totalCount) {
      pagination.next = {
        page: page + 1,
        pageSize: pageSize,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        pageSize: pageSize,
      };
    }

    res.status(200).json({
      data: recyclingHistory,
      page: page,
      pages: Math.ceil(totalCount / pageSize),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error:
        "An error occurred while retrieving the recycling history records.",
    });
  }
};



// @desc     GET Recycling History By its ID
// @route    GET /api/recycle/getRecyclingHistoryById/:id
// @access   Private
const getRecyclingHistoryById = asyncHandler(async (req, res) => {
  const recyclingHistory = await RecyclingHistory.findById(req.params.id);

  if (!recyclingHistory) {
    res.status(404);
    throw new Error("Recycling History not found");
  }

  res.json(recyclingHistory);
});












export {
  createRecyclingLocation,
  getAllRecyclingLocations,
  getRecyclingLocationsByPage,
  deleteRecyclingLocation,
  updateRecyclingLocation,
  getAllRecyclingHistories,
  getRecyclingLocationById,
  createRecycle,
  getRecyclingHistoryById,
  deleteRecyclingHistory,
  updateRecyclingHistory,
  getRecyclingHistoryByUserIdAndPage,
  getRecyclingHistoryForAllUsersByPage
};
