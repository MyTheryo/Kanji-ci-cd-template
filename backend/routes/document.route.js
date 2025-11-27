import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { updateAccessToken } from "../controllers/user.controller.js";
import {
  createDocument,
  deleteDocument,
  editDocument,
  findDocumentsByDoctorAndPatient,
  getDocumentById,
} from "../controllers/document.controller.js";

const router = express.Router();

router.post(
  "/create-document",
  
  isAuthenticated,
  createDocument
);
router.get(
  "/get-all-documents/:patientId",
  
  isAuthenticated,
  findDocumentsByDoctorAndPatient
);
router.get(
  "/documents/:documentId",
  
  isAuthenticated,
 getDocumentById
);
router.put(
  "/documents/:documentId",
  
  isAuthenticated,
 editDocument
);
router.delete(
  "/documents/:documentId",
  
  isAuthenticated,
 deleteDocument
);

export default router;
