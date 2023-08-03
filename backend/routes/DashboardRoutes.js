import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  getMostRecycledWasteType,
  getMostRecycledWasteTypeByUserId,
  getRecyclingPercentages,
  getRecyclingPercentagesByUser,
  getTotalRecyclingHistory,
  getTotalRecyclingHistoryByUserId,
} from "../controllers/DashboardController.js";

const router = express.Router();

router.get(
  "/total-recycling-history",
  protect,
  admin,
  getTotalRecyclingHistory
);
router
  .route("/getTotalRecyclingHistoryByUserId/:id")
  .get(protect, getTotalRecyclingHistoryByUserId); // Get Total Recycling History By User ID
router
  .route("/getMostRecycledWasteTypeByUserId/:id")
  .get(protect, getMostRecycledWasteTypeByUserId); // Get Most Recycled Waste Type
router
  .route("/getMostRecycledWasteType")
  .get(protect, admin, getMostRecycledWasteType); // Get Most Recycled Waste Type
router.route("/percentages/:id").get(protect, getRecyclingPercentagesByUser); // Get Recycling Percentages By User
router.route("/percentages").get(protect, getRecyclingPercentages);
export default router;
