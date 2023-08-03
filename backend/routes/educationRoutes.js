import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import { createEducation, deleteEducation, deleteFile, getAllEducationByPages, updateEducation, uploadFile } from "../controllers/educationController.js";
import multer from "multer";


const upload = multer({dest: 'backend/recyTrack_education_media'})
const router = express.Router();

router.post("/create", protect, admin, createEducation);
router.get("/getAllEducationByPages", protect, getAllEducationByPages)
router.delete("/delete/:id", protect, admin, deleteEducation);
router.put("/update/:id", protect, admin, updateEducation);  
router.post('/upload', protect, admin, upload.single('file'), uploadFile);
router.post('/delete', protect, admin, deleteFile);
export default router;