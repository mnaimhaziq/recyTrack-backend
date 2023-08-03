import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import { authUser, registerUser, updateUserProfile, updateDarkMode, getUsersByPage, getAllUsers, getUserById, changeUserRole } from "../controllers/userController.js";
const router = express.Router();

// Users 
router.route("/getUsersByPage").get(protect, admin, getUsersByPage);                // Admin Get All Users
router.route("/getAllUsers").get(protect, admin, getAllUsers);
router.post("/login", authUser);                                // Login
router.post("/register", registerUser);                         // Register
router.route("/profile").put(protect,updateUserProfile)         // Update User Profile
router.get("/:id", protect, admin, getUserById);
router.patch('/users/:userId/dark-mode', protect,updateDarkMode);          // Update Dark Mode
router.patch('/change-role/:id', protect, admin, changeUserRole);
export default router;