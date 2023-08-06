import Education from "../models/educationModel.js";
import asyncHandler from "express-async-handler";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// @desc     Create a new Education
// @route    POST /api/education/create
// @access   Private/Admin
export const createEducation = async (req, res) => {
  try {
    const { title, content, media } = req.body;
    const user_id = req.user._id;

    const newEducation = new Education({
      title,
      content,
      author_id: user_id,
      media,
    });

    try {
      // Save the education to the database
      const savedEducation = await newEducation.save();
      res.status(201).json(savedEducation);
    } catch (error) {
      console.error("Error saving education:", error);
      res.status(500).json({ error: "Error saving education" });
    }
  } catch (error) {
    console.error(error);
  }
};
 
// @desc     Get all Educations by Pages
// @route    GET /api/education/getAllEducationByPages?page=1
// @access   Private
export const getAllEducationByPages = async (req, res) => {
  const pageSize = 4;
  let page = Number(req.query.page) || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  try {
    // Retrieve all educations and populate the "user" field with the user information
    const education = await Education.find()
      .populate("author_id", "name picture isAdmin")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize);

    const totalCount = await Education.countDocuments();

    education.forEach((record) => {
      if (!record.content) {
        record.content = null;
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
      data: education,
      page: page,
      pages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error("Error retrieving education:", error);
    res.status(500).json({ error: "Error retrieving education" });
  }
};

// @desc     Delete an Educational Resource
// @route    DELETE /api/education/delete/:id
// @access   Private/Admin
export const deleteEducation = asyncHandler(async (req, res) => {
  const educationalresource = await Education.findByIdAndDelete(req.params.id);

  if (educationalresource) {
    if (educationalresource.media) {
      const media = educationalresource.media;

      // Loop through the media array and delete each item from Cloudinary
      for (const mediaItem of media) {
        await cloudinary.uploader.destroy(mediaItem.cloudinary.public_id);
      }
    }
    res.json({ message: "Educational resource removed" });
  } else {
    res.status(404).json({ error: "Educational resource not found" });
  }
});

// @desc     Update an educational resource
// @route    PUT /api/education/update/:id
// @access   Private/Admin
export const updateEducation = asyncHandler(async (req, res) => {
  const { title, content, media } = req.body;
  const education = await Education.findById(req.params.id);

  if (education) {
    education.title = title || education.title;
    education.content = content || education.content;
    education.media = media || education.media;

    const updatedEducation = await education.save();

    res.json(updatedEducation);
  } else {
    res.status(404).json({ error: "Recycling history not found" });
  }
});

// @desc     Controller function for handling file upload
// @route    PUT /api/education/upload
// @access   Private/Admin
export const uploadFile = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "recyTrack_education_media", // Specify the folder where the file will be stored
      use_filename: true, // Keep the original filename
    });

    // Clean up - remove the temporary file
    fs.unlinkSync(req.file.path);

    // Return the public URL of the uploaded file
    res.status(200).json(result);
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// @desc     Controller function for delete uploaded file
// @route    PUT /api/education/delete
// @access   Private/Admin
export const deleteFile = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({
      message: "Public ID is missing in the request body.",
    });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    res.status(200).json({
      message: `File with public ID '${publicId}' was successfully deleted.`,
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting the file.",
      error: error.message,
    });
  }
});
