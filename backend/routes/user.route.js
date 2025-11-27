import express from "express";
import {
  activateUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationUser,
  updateAccessToken,
  updatePassword,
  updateUserInfo,
  updateUserRole,
  addDoctor,
  resetPassword,
  setPassword,
  getInvitedDoctors,
  verifyUser,
  getUserInfoById,
  updateInvitationStatusById,
  sendActivationCode,
  updateEmail,
  verifyNewEmail,
} from "../controllers/user.controller.js";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

router.post("/registration", registrationUser);
router.put("/set-password", setPassword);
router.post("/activate-user", activateUser);
router.post("/verify-new-email", verifyNewEmail);
router.post("/resend-otp", sendActivationCode);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/refresh", updateAccessToken);
router.get("/me", isAuthenticated, getUserInfo);
router.get("/user-detail/:id", isAuthenticated, getUserInfoById);
router.get("/verify-user", isAuthenticated, verifyUser);
router.get("/invite-doctor", isAuthenticated, getInvitedDoctors);
// Making patientId an optional parameter in the route
router.get(
  "/patient-invite-doctor/:patientId?",
  isAuthenticated,
  getInvitedDoctors
);

router.put("/update-user-info", isAuthenticated, updateUserInfo);
router.put("/update-user-password", isAuthenticated, updatePassword);
router.put("/update-user-email", isAuthenticated, updateEmail);
router.get(
  "/get-users",
  isAuthenticated,
  authorizeRoles("Admin", "Patient", "Provider"),
  getAllUsers
);
router.put(
  "/update-user",
  isAuthenticated,
  authorizeRoles("Admin", "Patient", "Provider"),
  updateUserRole
);

router.put(
  "/update-doctor-status",
  isAuthenticated,
  updateInvitationStatusById
);

router.post("/reset-user-password", resetPassword);

router.post(
  "/add-doctor",
  isAuthenticated,
  addDoctor,
  updateInvitationStatusById
);

export default router;
