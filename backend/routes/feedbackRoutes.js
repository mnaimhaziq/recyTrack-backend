import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  createFeedback,
  deleteFeedback,
  getAllFeedbacksByPages,
  toggleResolvedStatus,
} from "../controllers/FeedbackController.js";
const router = express.Router();

router.post("/create", protect, createFeedback);
router.get("/getAllFeedbacksByPages", protect, admin, getAllFeedbacksByPages);
router.put("/toggleResolve/:feedbackId", protect, admin, toggleResolvedStatus);
router.delete('/delete/:id', protect, admin, deleteFeedback)
export default router;
