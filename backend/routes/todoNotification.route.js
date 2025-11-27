import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { createTodoNotification } from "../controllers/todoNotification.controller.js";

const router = express.Router();

// Route to create a new todo notification
router.post('/create-todo-notification', isAuthenticated, createTodoNotification);

// You can add more routes here for other operations like getting, updating, or deleting notifications
// For example, a route to get all notifications for a specific doctor:
// router.get('/notifications/:doctorId', isAuthenticated, getAllNotificationsForDoctor);

export default router;
