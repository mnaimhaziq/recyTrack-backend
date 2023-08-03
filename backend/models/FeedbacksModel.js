import mongoose from "mongoose";

// Define the feedback schema
const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    required: false,
    default: false
  },
} , {
  // Automatically updates the creation and update timestamps
  timestamps: true,
});

// Create the feedback model
const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;