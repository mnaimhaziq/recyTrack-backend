import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import { createFeedback,  getAllFeedbacksByPages } from "../controllers/FeedbackController.js";
const router = express.Router();

router.post("/create", protect, createFeedback);
router.get("/getAllFeedbacksByPages", protect,admin, getAllFeedbacksByPages);
export default router;