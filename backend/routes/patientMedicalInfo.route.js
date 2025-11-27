import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { editPatientMedicalInfo } from "../controllers/patientMedicalInfo.controller.js";
import { updateAccessToken } from "../controllers/user.controller.js";

const router = express.Router();

// router.get(
//   "/patientMedicalInfo/:patientId",
//   isAuthenticated,
//   getPatientMedicalInfoById
// );

router.post(
  "/patientMedicalInfo/:patientId",
  isAuthenticated,
  editPatientMedicalInfo
);

export default router;
