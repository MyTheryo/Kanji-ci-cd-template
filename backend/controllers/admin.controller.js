import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import userModel from "../model/user.model.js";
import archivedUserModel from "../model/archivedUser.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { DynamicModel } from "./AI.Controller.js";
import aiptSum from "../model/aiptSum.model.js";
import Goal from "../model/goal.model.js";
import Mood from "../model/mood.model.js";
import sevenDaySum from "../model/sevenDaySum.model.js";
import sharedSummary from "../model/SharedSummary.js";
import Todo from "../model/todo.model.js";
import WeekSummary from "../model/weeklyReport.model.js";
import TodoNotification from "../model/todoNotification.model.js";
import PatientInvitation from "../model/patientInvitation.model.js";
import Invitation from "../model/invitation.model.js";
import therapistProfile from "../model/therapistProfile.model.js";

/**
 * @desc    Get all users with userRole of either 'Patient' or 'Provider'
 * @route   GET /api/v1/users
 * @access  Private (Admin only)
 */
export const getAllUsers = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the user role from the database using the user ID
    const adminData = await userModel.findById(userId).select("userRole");

    // Ensure the requesting user has admin privileges
    if (!adminData || adminData.userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Fetch users with userRole 'Patient' or 'Provider'
    const users = await userModel.find({
      userRole: { $in: ["Patient", "Provider"] },
    });

    // Return response with found users
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    // Return a response directly to prevent server crash
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @desc    Toggle user approval status by admin
 * @route   PATCH /api/v1/users/:id/approve
 * @access  Private (Admin only)
 */
export const toggleUserApproval = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user._id;
    const targetUserId = req.params.id;

    // Fetch the user role from the database using the user ID
    const adminData = await userModel.findById(userId).select("userRole");

    if (!adminData || adminData.userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      targetUserId,
      { $set: { approvedByAdmin: !user.approvedByAdmin } },
      { new: true, select: "approvedByAdmin" }
    );

    return res.status(200).json({
      success: true,
      message: updatedUser.approvedByAdmin
        ? "User has been approved by admin."
        : "User has been removed from admin approval.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @function deleteUser
 * @description
 * This function is used by administrators to delete a user from the `users` collection
 * and move their data to the `archivedUsers` collection for archival purposes.
 *
 * @route DELETE /users/:id
 * @access Admin only
 *
 * @param {Object} req - Express request object containing the admin's user ID and the ID of the user to be deleted.
 * @param {String} req.params.id - The ID of the user to be deleted.
 * @param {Object} req.user._id - The ID of the admin user making the request, extracted from the JWT token.
 * @param {Object} res - Express response object to send back the response.
 * @param {Function} next - Express middleware function to handle errors.
 *
 * @returns {Object} res - Returns a success or failure message depending on the operation outcome.
 *
 * @throws {Error} - Returns an error if the user is not found, if the user is not an admin, or if there is an issue archiving/deleting the user.
 */

// export const deleteUser = catchAsyncError(async (req, res, next) => {
//   try {
//     const { id } = req.params; // The ID of the user to be deleted
//     const userId = req.user._id; // The admin user ID from the token
//     const userAdmin = await userModel.findById(userId); // Admin user data
//     const deleteUser = await userModel.findById(id); // User to be deleted

//     // Fetch the admin's role and ensure the request is from an Admin
//     const adminData = await userModel.findById(userId).select("userRole");

//     // Check if the user making the request is an Admin
//     if (!adminData || adminData.userRole !== "Admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. Admins only.",
//       });
//     }

//     // Check if the user to be deleted exists
//     if (!deleteUser) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     // Move user data to archivedUsers collection before deletion
//     const archivedUser = new archivedUserModel(deleteUser.toObject()); // Use toObject to copy the user data
//     await archivedUser.save(); // Save the archived user

//     // Delete the user from the users collection
//     await deleteUser.deleteOne();

//     // Return success response
//     res.status(200).json({
//       success: true,
//       message: "User deleted successfully",
//     });
//   } catch (error) {
//     // Handle any errors
//     return next(new ErrorHandler(error.message, 400));
//   }
// });

//Shoaib Updated
export const deleteUser = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params; // The ID of the user to be deleted
    const userId = req.user._id; // The admin user ID from the token
    const userAdmin = await userModel.findById(userId); // Admin user data
    const deleteUser = await userModel.findById(id); // User to be deleted

    // Fetch the admin's role and ensure the request is from an Admin
    const adminData = await userModel.findById(userId).select("userRole");

    // Check if the user making the request is an Admin
    if (!adminData || adminData.userRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Check if the user to be deleted exists
    if (!deleteUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (deleteUser.userRole === "Provider") {
      //Delete TodoNotifications of Provider with id
      await TodoNotification.deleteMany({ doctorId: id });

      //Delete patientInvitations of Provider with id
      await PatientInvitation.deleteMany({ senderId: id });

      //Delete all Invitations with doctorEmail
      await Invitation.deleteMany({ doctorEmail: deleteUser.email });

      //Delete all Todos with id
      await Todo.deleteMany({ providerId: id });

      //Delete all Shared Summaries with id
      await sharedSummary.deleteMany({ providerId: id });
    } else {
      //Delete Initial Journey
      await DynamicModel.deleteOne({ sessionId: id });

      //Delete Invitations with patient id
      await Invitation.deleteMany({ senderId: id });

      //Delete patientInvitations of Provider with patientEmail
      await PatientInvitation.deleteMany({ patientEmail: deleteUser.email });

      //Delete all AIPT Sums with userid
      await aiptSum.deleteMany({ userId: id });

      //Delete all Goals with userid
      await Goal.deleteMany({ userId: id });

      //Delete all Moods with userid
      await Mood.deleteMany({ userId: id });

      //Delete all Seven Day Summaries with userid
      await sevenDaySum.deleteMany({ userId: id });

      //Delete all Todos with id
      await Todo.deleteMany({ patientId: id });

      //Delete all Weekly Report Summaries with userId
      await WeekSummary.deleteMany({ userId: id });

      //Delete therapist profile with userId
      await therapistProfile.deleteMany({ userId: id });

      //Delete all Shared Summaries with id
      await sharedSummary.deleteMany({ patientId: id });
    }

    // Move user data to archivedUsers collection before deletion
    const archivedUser = new archivedUserModel(deleteUser.toObject()); // Use toObject to copy the user data
    await archivedUser.save(); // Save the archived user
    // Delete the user from the users collection
    await deleteUser.deleteOne();

    // Return success response
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    // Handle any errors
    return next(new ErrorHandler(error.message, 400));
  }
});
