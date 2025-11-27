import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  goalNotification,
  sendTodoNotificationsController,
} from "../controllers/notification.controller.js";
import { updateAccessToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post(
  "/goal-notification",
  isAuthenticated,
  goalNotification
);

router.get(
  "/send-todo-notifications",
  // updateAccessToken,
  // isAuthenticated,
  sendTodoNotificationsController
);
export default router;
