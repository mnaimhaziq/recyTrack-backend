import Feedback from "../models/FeedbacksModel.js";
import asyncHandler from "express-async-handler";
import cloudinary from "../utils/cloudinary.js";


// Create a new feedback
export const createFeedback = async (req, res) => {
    const {  comment } = req.body;
    const user_id = req.user._id;
  
   
  
    // Create a new feedback document
    const newFeedback = new Feedback({
      user: user_id,
      comment,
    });
  
    try {
      // Save the feedback to the database
      const savedFeedback = await newFeedback.save();
      res.status(201).json(savedFeedback);
    } catch (error) {
      console.error('Error saving feedback:', error);
      res.status(500).json({ error: 'Error saving feedback' });
    }
  };

  // Get all feedback with user names
export const getAllFeedbacksByPages = async (req, res) => {

  const pageSize = 8;
  let page = Number(req.query.page) || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;


    try {
      // Retrieve all feedback and populate the "user" field with the user information
      const feedback = await Feedback.find().populate('user', 'name') .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize);;
      
      const totalCount = await Feedback.countDocuments();

      feedback.forEach((record) => {
        if (!record.comment) {
          record.comment = null;
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
        data: feedback,
        page: page,
        pages: Math.ceil(totalCount / pageSize),
      });

    } catch (error) {
      console.error('Error retrieving feedback:', error);
      res.status(500).json({ error: 'Error retrieving feedback' });
    }
  };


// Toggle feedback resolved status
export const toggleResolvedStatus = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;

  try {
    // Find the feedback by ID
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Toggle the resolved status
    feedback.resolved = !feedback.resolved;

    // Save the updated feedback
    const updatedFeedback = await feedback.save();

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error('Error toggling feedback resolved status:', error);
    res.status(500).json({ error: 'Error toggling feedback resolved status' });
  }
});

// @desc     Delete a Feedback
// @route    DELETE /api/feedback/delete/:id
// @access   Private/Admin
export const deleteFeedback = asyncHandler(async (req, res) => {
  const deletedFeedback = await Feedback.findByIdAndDelete(
    req.params.id
  );

  if (deletedFeedback) {
    res.json({ message: "Feedback removed" });
  } else {
    res.status(404).json({ error: "Feedback not found" });
  }
});

