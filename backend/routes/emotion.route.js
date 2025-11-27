import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createEmotion, deleteEmotion, getAllEmotions } from "../controllers/emotion.controller.js";
import { updateAccessToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post(
  "/create-emotion",
  
  isAuthenticated,
  createEmotion
);
router.get(
  "/getall-emotion",
  
  isAuthenticated,
  getAllEmotions
);
router.delete("/delete-emotion", isAuthenticated, deleteEmotion);

export default router;
