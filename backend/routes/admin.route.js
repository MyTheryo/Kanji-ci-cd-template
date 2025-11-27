import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
import { getAllUsers, toggleUserApproval, deleteUser } from "../controllers/admin.controller.js";

const router = express.Router();

router.get(
  "/getAllUsers",
  isAuthenticated,
  authorizeRoles("Admin"),
  getAllUsers,
);

router.post(
  "/users/:id/approve",
  isAuthenticated,
  authorizeRoles("Admin"),
  toggleUserApproval
);

// Admin route to delete user and archive the data
router.delete("/users/:id/delete", isAuthenticated, authorizeRoles("Admin"), deleteUser);

export default router;
