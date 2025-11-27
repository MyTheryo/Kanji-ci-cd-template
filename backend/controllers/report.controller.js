import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import axios from "axios";
import userModel from "../model/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import mongoose from "mongoose";
import dotenv, { config } from "dotenv";
import SharedWeeklyReport from "../model/SharedSummary.js";
import invitationModel from "../model/invitation.model.js";
import sendMail from "../utils/sendMail.js";
import patientInvitationModel from "../model/patientInvitation.model.js";
import WeeklyReportSummaries from "../model/weeklyReport.model.js";
import { logActivity } from "../utils/logger.js";
dotenv.config();

/**
 * @function weeklySharedReportWithProvider
 * This function handles the sharing of a patient's weekly report with a provider (doctor).
 * It checks if the provider has been invited and the invitation is accepted.
 * If the report has not been shared, it creates a new shared report entry, sends a notification email,
 * and saves the report to the database.
 */

export const weeklySharedReportWithProvider = catchAsyncError(
  async (req, res, next) => {
    // Extracting doctorEmail and weeklyReportTableName from the request body
    const { doctorEmail, weeklyReportTableName } = req.body;

    // If doctorEmail or weeklyReportTableName is missing, return a 400 Bad Request response
    if (!doctorEmail || !weeklyReportTableName) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
      });
    }

    try {
      // Get patient data from the authenticated user and fetch provider data by doctorEmail
      const patientData = req?.user;
      const providerData = await userModel.findOne({ email: doctorEmail });

      // If either the patient or provider is not found, return a 404 Not Found response
      if (!patientData || !providerData) {
        return res.status(404).json({
          success: false,
          message: "Something went wrong.",
        });
      }

      // Find the invitation entry where the invitation is accepted (from patient to provider or vice versa)
      let invitation = await invitationModel.findOne({
        senderId: patientData._id,
        doctorEmail: doctorEmail,
        invitationStatus: "accepted",
      });

      // If no invitation is found, try to find an invitation where the provider invited the patient
      if (!invitation) {
        invitation = await patientInvitationModel.findOne({
          senderId: providerData._id,
          patientEmail: patientData.email,
          invitationStatus: "accepted",
        });
      }

      // If no accepted invitation is found, return a 404 Not Found response
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found or not accepted.",
        });
      }

      // Check if the weekly report has already been shared between this patient and provider
      const isReportShared = await SharedWeeklyReport.findOne({
        providerId: providerData._id,
        patientId: patientData._id,
        summaryTableName: weeklyReportTableName,
      });

      // If the report has not been shared yet, create a new shared report entry
      if (!isReportShared) {
        try {
          // Creating a new entry in SharedWeeklyReport
          const newShare = new SharedWeeklyReport({
            providerId: providerData._id,
            patientId: patientData._id,
            summaryTableName: weeklyReportTableName,
            timestamp: new Date(),
          });

          // Save the new shared report entry to the database
          await newShare.save();
          // Prepare data for sending an email notification to the provider
          const data = {
            providerName: providerData.firstName,
            patientName: `${
              patientData.firstName
            } ${patientData.lastName.charAt(0)}`, // Mask patient's last name
            baseUrl: process.env.BASE_URL, // Base URL for links in the email
          };
          // Send an email notification to the provider
          await sendMail({
            email: providerData.email,
            subject: "Theryo.ai Weekly Report Share Notification",
            template: "shared-report.ejs",
            data,
          });

          // Log user activity
          await logActivity({
            userId: req.user?._id,
            action: "Report Shared",
            description: `User ${req?.user?.customerId} shared Weekly Report with ${providerData?.customerId}.`,
            metadata: {
              id: newShare._id,
              title: weeklyReportTableName,
            },
          });

          // Return a success response with the new shared report data
          res.status(200).json({
            success: true,
            message: "Weekly report shared successfully",
            data: newShare,
          });
        } catch (err) {
          // If an error occurs while saving the report or sending the email, return a 500 Internal Server Error
          console.error(err);
          res.status(500).json({
            success: false,
            message: "Error sharing the weekly report",
            error: err.message,
          });
        }
      } else {
        // If the report is already shared, return a message indicating it was already shared
        res.status(200).json({
          success: true,
          message: "Weekly report already shared.",
        });
      }
    } catch (err) {
      // Catch any other errors and return a 500 Internal Server Error
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error retrieving or sharing the weekly report",
        error: err.message,
      });
    }
  }
);

/**
 * End of weeklySharedReportWithProvider function.
 * This function ensures that a weekly report can only be shared once between a patient and provider.
 * It also sends an email notification to the provider once the report is successfully shared.
 */

/**
 * @function fetchWeeklyReportForProvider
 * @description Fetches weekly reports shared by a specific patient with a provider and sorts them based on the latest week.
 *
 * @param {Object} req - The request object containing the provider's user information and patientId in the params.
 * @param {Object} res - The response object to send the result.
 * @param {Function} next - The next middleware function for error handling.
 */
export const fetchWeeklyReportForProvider = catchAsyncError(
  async (req, res, next) => {
    // Destructure patientId from the request params
    const { patientId } = req.params;

    // Check if patientId is provided; if not, return a 400 Bad Request
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
      });
    }

    try {
      // Get the authenticated provider's data from req.user
      const providerData = req?.user;

      // Ensure that the patientId is cast to a Mongoose ObjectId
      const patientObjectId = new mongoose.Types.ObjectId(patientId);

      // If provider data is not found, return a 404 Not Found
      if (!providerData) {
        return res.status(404).json({
          success: false,
          message: "Provider not found.",
        });
      }

      // Query the shared summaries table to find all summaries shared with the provider
      const sharedSummaries = await SharedWeeklyReport.find({
        patientId: patientObjectId, // Match the patientId with the one provided in the request
        providerId: providerData._id, // Match the providerId with the authenticated provider
        summaryTableName: { $regex: /^Weekly Report/ }, // Ensure the summaryTableName starts with "Weekly Report"
      });

      // If no shared summaries are found, return a 404 Not Found
      if (!sharedSummaries || sharedSummaries.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No weekly reports shared for the patient.",
        });
      }

      // Array to store the fetched weekly summaries
      const allWeeklySummaries = [];

      // Loop through all shared summaries and extract the week range
      for (const sharedSummary of sharedSummaries) {
        // Extract the week range from the summaryTableName using a regular expression
        const weekRangeMatch =
          sharedSummary.summaryTableName.match(/\((.*?) < > (.*?)\)/);

        // If the format does not match, skip this entry
        if (!weekRangeMatch || weekRangeMatch.length < 3) {
          continue; // Skip invalid summaries
        }

        // Extract the start and end dates from the regex match result
        const startDate = weekRangeMatch[1]; // Get the start date from the summaryTableName
        const endDate = weekRangeMatch[2]; // Get the end date from the summaryTableName

        // Format the extracted dates to match the "weekRange" field in the weeklyreportsummaries table
        const formattedWeekRange = `${startDate} to ${endDate}`;

        // Query the weeklyreportsummaries table for a matching weekRange entry for the patient
        const weeklySummary = await WeeklyReportSummaries.findOne({
          userId: patientObjectId, // Ensure the patientId matches
          weekRange: formattedWeekRange, // Match the weekRange with the extracted date range
        });

        // If a matching weekly summary is found, push it to the result array
        if (weeklySummary) {
          allWeeklySummaries.push({
            weeklySummary,
            endDate: new Date(endDate), // Store the endDate as a Date object for sorting
          });
        }
      }

      // If no matching weekly summaries are found, return a 404 Not Found
      if (allWeeklySummaries.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No weekly summaries found for the specified week ranges.",
        });
      }

      // Sort the summaries based on the latest week (latest endDate)
      allWeeklySummaries.sort((a, b) => b.endDate - a.endDate);

      // Map back to just weekly summaries for the response
      const sortedSummaries = allWeeklySummaries.map(
        (item) => item.weeklySummary
      );

      // Return the sorted array of all matching weekly summaries with a 200 OK status
      res.status(200).json({
        success: true,
        message: "Weekly reports fetched successfully.",
        data: sortedSummaries, // Return all found weekly report summaries, sorted by latest week
      });
    } catch (err) {
      // Catch any error during the process, log it for debugging, and return a 500 Internal Server Error
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error retrieving the weekly reports.",
        error: err.message, // Include the error message for additional context
      });
    }
  }
);

/**
 * End of fetchWeeklyReportForProvider function.
 * This function is designed to fetch all weekly reports shared by a specific patient with a provider,
 * sort them based on the latest week, and return them in descending order of their week range.
 */
