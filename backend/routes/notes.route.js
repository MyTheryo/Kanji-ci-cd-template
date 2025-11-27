import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { updateAccessToken } from "../controllers/user.controller.js";
import { createNote, editNote, findNotesByDoctorAndPatient, getNoteById, findNotesByProvider, generateAISummary } from "../controllers/notes.controller.js";


const router = express.Router();

router.post(
  "/create-notes",
  
  isAuthenticated,
  createNote
);

router.post(
  "/generate-ai-summary",
  
  isAuthenticated,
  generateAISummary
);

router.get(
  "/get-all-notes/:patientId",
  
  isAuthenticated,
  findNotesByDoctorAndPatient
);

router.get(
  "/get-all-session-notes",
  
  isAuthenticated,
  findNotesByProvider
);

router.get(
  "/notes/:noteId",
  
  isAuthenticated,
  getNoteById
);
router.put("/notes/:noteId",  isAuthenticated, editNote);
// router.delete(
//   "/documents/:documentId",
//   isAuthenticated,
//   deleteDocument
// );

export default router;
