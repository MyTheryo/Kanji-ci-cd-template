import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  generateJourneySummary,
  generateNotesSummary,
  generateSevenDaySummary,
  getConversation,
  getIJEmailTemplate,
  getTherapistProfile,
  getSevenDaySummary,
  initialJourney,
  getPatientNotesSummary,
  sharedSummary,
  getSharedSummaries,
  getCarePlan,
  generateCarePlan,
  carePlanItems,
  getCarePlanById,
  updateCarePlanById,
} from "../controllers/AI.Controller.js";

const router = express.Router();

// router.post("/generate-journey-summary", generateJourneySummary);
router.post(
  "/generate-journey-summary",
  isAuthenticated,
  generateJourneySummary
);
router.post(
  "/initial-journey",
  isAuthenticated,
  initialJourney
);
router.post(
  "/get-conversation",
  isAuthenticated,
  getConversation
);
router.post(
  "/generate-sevenday-summary",
  isAuthenticated,
  generateSevenDaySummary
);
router.post(
  "/get-sevenday-summary",
  isAuthenticated,
  getSevenDaySummary
);
router.post(
  "/get-ij-emailTemplate",
  isAuthenticated,
  getIJEmailTemplate
);
router.post(
  "/get-therapist-profile",
  isAuthenticated,
  getTherapistProfile,
);
router.post(
  "/generate-notes-summary",
  isAuthenticated,
  generateNotesSummary
);
router.post(
  "/get-patient-notes-summary",
  isAuthenticated,
  getPatientNotesSummary
);
router.post(
  "/share-summary",
  isAuthenticated,
  sharedSummary
);
router.get(
  '/shared-summaries/:providerId',
  isAuthenticated,
  getSharedSummaries
);
router.get(
  '/get-careplan/:patientId/:limit?',
  isAuthenticated,
  getCarePlan,
);
router.get(
  '/get-careplan-by-id/:planId',
  isAuthenticated,
  getCarePlanById,
);
router.put(
  '/update-careplan/:planId',
  isAuthenticated,
  updateCarePlanById,
);
router.get(
  '/careplanItems/:patientId',
  isAuthenticated,
  carePlanItems,
);
router.post(
  "/generate-careplan",
  isAuthenticated,
  generateCarePlan
);

export default router;
