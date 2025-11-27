import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createBetterme, deleteBetterme, getallBetterme } from "../controllers/betterme.controller.js";


const router = express.Router();

router.post("/create-betterme", isAuthenticated, createBetterme);
router.get(
  "/getall-betterme",
 
  isAuthenticated,
  getallBetterme
);
router.delete(
  "/delete-betterme",
 
  isAuthenticated,
  deleteBetterme
);

export default router;
