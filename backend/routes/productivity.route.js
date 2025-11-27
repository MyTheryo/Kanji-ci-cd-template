import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createProductivty, deleteProductivity, getAllProductivity } from "../controllers/productivity.controller.js";
import { updateAccessToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post(
  "/create-productivity",
  
  isAuthenticated,
  createProductivty
);
router.get(
  "/getall-productivity",
  
  isAuthenticated,
  getAllProductivity
);
router.delete(
  "/delete-productivity",
  
  isAuthenticated,
  deleteProductivity
);


export default router;
