import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { weeklySharedReportWithProvider, fetchWeeklyReportForProvider  } from "../controllers/report.controller.js";

const router = express.Router();

// Route to share the weekly report with a provider
router.post("/share-weekly-report", isAuthenticated, weeklySharedReportWithProvider);

// Route to fetch weekly report of patient
router.get('/fetch-weekly-report/:patientId', isAuthenticated, fetchWeeklyReportForProvider);


export default router;
