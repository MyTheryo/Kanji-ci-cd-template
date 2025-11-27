import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createGoal,
  deleteGoal,
  getAllGoal,
  getAllCompletedGoal,
  getUserAllGoals,
  getSingleGoal,
  updateGoal,
} from "../controllers/goal.controller.js";
import { updateAccessToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create-goal", isAuthenticated, createGoal);
router.get("/getall-goal", isAuthenticated, getAllGoal);
router.get("/getuser-all-goals/:id", isAuthenticated, getUserAllGoals);
router.get("/getall-completed-goal", isAuthenticated, getAllCompletedGoal);
router.delete("/delete-goal/:id", isAuthenticated, deleteGoal);
router.get("/get-single-goal/:id", isAuthenticated, getSingleGoal);
router.put("/update-goal/:id", isAuthenticated, updateGoal);

export default router;
