import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import { calculateAndRankUsers, calculatePoints, calculatePointsById } from "../controllers/LeaderboardController.js";

const router = express.Router();

router.get('/calculatePoints', protect,admin, calculatePoints);
router.get("/calculatePointsById/:id", protect, calculatePointsById);
router.get('/calculateAndRankUsers', protect, admin, calculateAndRankUsers);
export default router;
