import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getPatientList,
  getUsersByIds,
  updateInvitationStatus,
  updateInvitationStatusById,
  addPatient,
  deleteInvitationById,
} from "../controllers/provider.controller.js";

const router = express.Router();

router.post("/get-patients", isAuthenticated, getPatientList);

router.post("/update-invitations", isAuthenticated, updateInvitationStatus);

router.get("/get-doc-patient", isAuthenticated, getUsersByIds);

router.put(
  "/update-patient-status",
  isAuthenticated,
  updateInvitationStatusById
);

router.put("/delete-patient-invitation", isAuthenticated, deleteInvitationById);

router.post("/add-patient", isAuthenticated, addPatient);

export default router;
