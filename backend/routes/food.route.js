import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createFood, deleteFood, getAllFoods } from "../controllers/food.ccontroller.js";
import { updateAccessToken } from "../controllers/user.controller.js";


const router = express.Router();

router.post("/create-food",  isAuthenticated, createFood);
router.get("/getall-food",  isAuthenticated, getAllFoods);
router.delete("/delete-food",  isAuthenticated, deleteFood);

export default router;
