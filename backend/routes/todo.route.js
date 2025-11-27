import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createTodo,
  deleteTodo,
  editTodo,
  getAllTodo,
  getTodoById,
  getAllTodoData,
} from "../controllers/todo.controller.js";
import { updateAccessToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create-todo", isAuthenticated, createTodo);
router.get("/todos/:todoId", isAuthenticated, getTodoById);
router.get("/get-all-todo-data/:providerId", isAuthenticated, getAllTodoData);

router.get(
  "/get-all-todo/:patientId",

  isAuthenticated,
  getAllTodo
);
router.delete("/todos/:todoId", isAuthenticated, deleteTodo);
router.put("/todos/:todoId", isAuthenticated, editTodo);

export default router;
