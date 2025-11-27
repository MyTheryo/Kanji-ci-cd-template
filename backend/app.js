import express from "express";
import dotenv from "dotenv";
dotenv.config();
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error.js";
import userRouter from "./routes/user.route.js";
import goalRouter from "./routes/goal.route.js";
import moodRouter from "./routes/mood.route.js";
import emotionRouter from "./routes/emotion.route.js";
import foodRouter from "./routes/food.route.js";
import bettermeRouter from "./routes/betterme.route.js";
import productivityRouter from "./routes/productivity.route.js";
import providerRouter from "./routes/provider.route.js";
import todosRouter from "./routes/todo.route.js";
import documentRouter from "./routes/document.route.js";
import patientMedicalInfoRouter from "./routes/patientMedicalInfo.route.js";
import notesRouter from "./routes/notes.route.js";
import notificationRouter from "./routes/notification.route.js";
import todoNotification from "./routes/todoNotification.route.js";
import aiRouter from "./routes/ai.route.js";
import adminRouter from "./routes/admin.route.js";
import reportRouter from "./routes/report.route.js";
import { sendSlackNotification } from "./utils/slackNotifier.js";

// Set trust proxy if your app is behind a proxy (e.g., in production environments)
app.set("trust proxy", true);
// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie Parser
app.use(cookieParser());
// const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:3000'; // Default if not set

// Cors
app.use(
  cors({
    origin: [process.env.BASE_URL, "http://localhost:3000"],
    credentials: true,
  })
);

// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", goalRouter);
app.use("/api/v1", moodRouter);
app.use("/api/v1", emotionRouter);
app.use("/api/v1", foodRouter);
app.use("/api/v1", bettermeRouter);
app.use("/api/v1", productivityRouter);
app.use("/api/v1", providerRouter);
app.use("/api/v1", todosRouter);
app.use("/api/v1", documentRouter);
app.use("/api/v1", patientMedicalInfoRouter);
app.use("/api/v1", notesRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", todoNotification);
app.use("/api/v1", aiRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", reportRouter);

// Testing api
app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.use(express.urlencoded({ extended: true }));

//Route to notify about Git pushes to the main branch
app.post("/send-slack-notification", async (req, res) => {
  const { commitId, title, branchName } = req.body;

  let notificationMessage;

  if (commitId && title) {
    // If both commitId and title are provided, use the Git push notification format
    notificationMessage = `Code pushed to branch "${branchName}" Commit ID: ${commitId}, Title: ${title}`;
  } else {
    // If neither a Git push message nor a custom message is provided, respond with an error
    return res.status(400).send("Error: Either 'commitId' and 'title'  is required.");
  }

  try {
    await sendSlackNotification(notificationMessage);
    res.send("Slack notification sent successfully.");
  } catch (error) {
    console.error("Failed to send Slack notification:", error.message);
    res.status(500).send("Failed to send Slack notification.");
  }
});

//Route to notify about deployment to production
app.post("/notify-deployment", async (req, res) => {
  const { commitId, title, branchName } = req.body;

  // Check if both commitId and title are provided
  if (!commitId || !title) {
    return res.status(400).send("Error: Both 'commitId' and 'title' are required for deployment notification.");
  }

  const message = `Code pulled to branch "${branchName}" and deployed live. Commit ID: ${commitId}, Title: ${title}`;

  try {
    await sendSlackNotification(message);
    res.send("Deployment notification sent to Slack successfully.");
  } catch (error) {
    console.error("Failed to send deployment Slack notification:", error.message);
    res.status(500).send("Failed to send deployment Slack notification.");
  }
});


// Unknown routes
app.use("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
