import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createMood,
  getAllmoods,
  getLatestmoods,
  getCurrentWeekMoods,
  groupByMoodForLastTwoWeeks,
  groupByDate,
  groupByMood,
  getAllActivities,
  groupByActivity,
  groupBySleepActivity,
  updateMoodSwpById,
  findMoodByDoctorAndPatient,
  findLatestMoodByDoctorAndPatient,
  updateMood,
  // reportByMoodForLastFourWeeks,
  reportByMoodForLastEightWeeks,
  generateWeeklyReport,
} from "../controllers/mood.controller.js";
import { updateAccessToken } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create-mood",  isAuthenticated, createMood);
router.put("/update-mood/:id",  isAuthenticated, updateMood);
router.get("/get-all-mood",  isAuthenticated, getAllmoods);
router.get("/get-latest-mood",  isAuthenticated, getLatestmoods);
router.get(
  "/get-mood-by-count",
  
  isAuthenticated,
  groupByMood
);
router.get(
  "/get-mood-by-date",
  isAuthenticated,
  groupByDate
);

router.get(
  "/get-mood-by-week",
  
  isAuthenticated,
  getCurrentWeekMoods
);

router.get(
  "/get-mood-by-two-weeks",
  
  isAuthenticated,
  groupByMoodForLastTwoWeeks
);

router.get(
  "/get-all-activities",
  
  isAuthenticated,
  getAllActivities
);
router.get(
  "/get-activity-by-count",
  
  isAuthenticated,
  groupByActivity
);
router.get(
  "/get-sleep-activity-by-count",
  
  isAuthenticated,
  groupBySleepActivity
);
router.put(
  "/update-mood-swp",
  isAuthenticated,
  updateMoodSwpById
);
router.get(
  "/get-all-patient-mood/:patientId",
  isAuthenticated,
  findMoodByDoctorAndPatient
);
router.get(
  "/get-latest-patient-mood/:patientId",
  isAuthenticated,
  findLatestMoodByDoctorAndPatient
);

router.get(
  "/get-mood-report-by-four-weeks",
  isAuthenticated,
  // reportByMoodForLastFourWeeks
  reportByMoodForLastEightWeeks
);

// POST route to generate a weekly report based on startDate and endDate
router.post(
  '/generate-weekly-report',
  isAuthenticated,
  generateWeeklyReport
);
export default router;
