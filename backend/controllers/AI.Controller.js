import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import axios from "axios";
import aiptSum from "../model/aiptSum.model.js";
import therapistProfile from "../model/therapistProfile.model.js";
import userModel from "../model/user.model.js";
import Mood from "../model/mood.model.js";
import Notes from "../model/notes.model.js";
import sevenDaySum from "../model/sevenDaySum.model.js";
import notesSum from "../model/notesSum.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import mongoose from "mongoose";
import IJEmailTemplate from "../model/IJ.emailTemplate.model.js";
import dotenv, { config } from "dotenv";
import SharedSummary from "../model/SharedSummary.js";
import invitationModel from "../model/invitation.model.js";
import sendMail from "../utils/sendMail.js";
import carePlanSum from "../model/carePlan.model.js";
import patientInvitationModel from "../model/patientInvitation.model.js";
dotenv.config();

// Define a dynamic schema that can adapt to the structure of the data
const dynamicSchema = new mongoose.Schema({}, { strict: false });

// Use the collection name where your API stores data
export const DynamicModel = mongoose.model(
  "DynamicData",
  dynamicSchema,
  "AIP-PT-Chat"
);

export const sharedSummary = catchAsyncError(async (req, res, next) => {
  const { doctorEmail, summaryTableName } = req.body;

  if (!doctorEmail || !summaryTableName) {
    return res.status(400).json({
      success: false,
      message: "Invalid Data",
    });
  }

  try {
    // get patient and doctor id
    const patientData = req?.user;
    const providerData = await userModel.findOne({ email: doctorEmail });

    if (!patientData || !providerData) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong.",
      });
    }
    // Find the invitation entry
    let invitation = await invitationModel.findOne({
      senderId: patientData._id,
      doctorEmail: doctorEmail,
      invitationStatus: "accepted",
    });

    if (!invitation) {
      invitation = await patientInvitationModel.findOne({
        senderId: providerData._id,
        patientEmail: patientData.email,
        invitationStatus: "accepted",
      });
    }

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or not accepted.",
      });
    }

    const isSummaryShared = await SharedSummary.findOne({
      providerId: providerData._id,
      patientId: patientData._id,
      summaryTableName,
    });

    if (!isSummaryShared) {
      try {
        // Create a new shared summary entry
        const newShare = new SharedSummary({
          providerId: providerData._id,
          patientId: patientData._id,
          summaryTableName,
          timestamp: new Date(),
        });
        // Save the new shared summary entry
        await newShare.save();

        // send email to the provider
        const data = {
          providerName: providerData.firstName,
          patientName: `${patientData.firstName} ${patientData.lastName.charAt(
            0
          )}`,
          baseUrl: process.env.BASE_URL,
        };
        await sendMail({
          email: providerData.email,
          subject: "Theryo.ai Document Share Notification",
          template: "shared-summary.ejs",
          data,
        });

        if (summaryTableName.toLowerCase() === "aipt-sums") {
          const haveCareplan = await carePlanSum.findOne({
            providerId: providerData._id,
            patientId: patientData._id,
          });

          if (!haveCareplan) {
            const aiptSummary = await aiptSum
              .findOne({ userId: patientData._id })
              .sort({ createdAt: -1 });

            if (aiptSummary.summary) {
              // generateAIResponse("http://54.218.176.251/api/v1/prediction/469d5070-07c1-4d2e-89ae-8da84872a6ee", process.env.FLOWISE_AUTH_KEY, {
              generateAIResponse(
                "http://54.218.176.251/api/v1/prediction/899fe09e-5a8a-4f71-a40a-901d44fc6b00",
                process.env.FLOWISE_AUTH_KEY,
                {
                  question: {
                    "Mental Health Report Summary": aiptSummary.summary,
                  },
                }
              ).then(async (response) => {
                if (response.text) {
                  const primaryICD10Code =
                    extractPrimaryICD10Code(response.text) || "";
                  const newCarePlan = new carePlanSum({
                    providerId: providerData._id,
                    patientId: patientData._id,
                    carePlan: response.text,
                    primaryICD10Code: primaryICD10Code,
                  });
                  await newCarePlan.save();
                }
              });
            }
          }
        }

        // Send success response
        res.status(200).json({
          success: true,
          message: "Summary shared successfully",
          data: newShare,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Error retrieving or sharing summary",
          error: err.message,
        });
      }
    } else {
      res.status(200).json({
        success: true,
        message: "Summary Already Shared.",
      });
    }
  } catch (err) {
    console.error(err);
    // Handling any errors during the query or processing
    res.status(500).json({
      success: false,
      message: "Error retrieving or sharing summary",
      error: err.message,
    });
  }
});

// Function for getSharedSummaries
export const getSharedSummaries = catchAsyncError(async (req, res, next) => {
  const { providerId } = req.params;
  const providerIdn = new mongoose.Types.ObjectId(providerId);
  const doctorId = req?.user._id;
  try {
    if (!providerIdn || !doctorId) {
      throw new Error(
        "Missing required parameters: provider and patient id are required."
      );
    }
    const summaries = await SharedSummary.find({
      patientId: providerIdn,
      providerId: doctorId,
    }).sort({ timestamp: -1 });

    const detailedSummaries = await Promise.all(
      summaries.map(async (summary) => {
        let summaryData = null;
        let createdAt = null;

        switch (summary.summaryTableName) {
          case "sevenday-sums":
            const sevenDaySummary = await sevenDaySum
              .findOne({ userId: providerIdn })
              .sort({ createdAt: -1 });
            if (sevenDaySummary) {
              summaryData = sevenDaySummary.summary;
              createdAt = sevenDaySummary.createdAt;
            }
            break;

          case "aipt-sums":
            const mentalHealthReport = await aiptSum
              .findOne({ userId: providerIdn })
              .sort({ createdAt: -1 });
            if (mentalHealthReport) {
              summaryData = mentalHealthReport.summary;
              createdAt = mentalHealthReport.createdAt;
            }
            break;

          case "AIP-PT-Chat":
            const chatHistory = await DynamicModel.findOne({
              sessionId: providerId,
            }).sort({ createdAt: -1 });
            if (chatHistory) {
              summaryData = chatHistory.messages;
              createdAt = "";
            }
            break;

          case "ij-emailtemplates":
            const emailTemplate = await IJEmailTemplate.findOne({
              userId: providerIdn,
            }).sort({ createdAt: -1 });
            if (emailTemplate) {
              summaryData = emailTemplate.template;
              createdAt = emailTemplate.createdAt;
            }
            break;

          case "therapist-profiles":
            const therapistProfiles = await therapistProfile
              .findOne({ userId: providerIdn })
              .sort({ createdAt: -1 });
            if (therapistProfiles) {
              summaryData = therapistProfiles.therapistProfile;
              createdAt = therapistProfiles.createdAt;
            }
            break;

          default:
            summaryData = "";
            createdAt = null;
            break;
        }

        return {
          ...summary.toObject(),
          summary: summaryData,
          createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: detailedSummaries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const getCarePlan = catchAsyncError(async (req, res, next) => {
  const { patientId, limit } = req.params;
  const patientIdn = new mongoose.Types.ObjectId(patientId);
  const providerId = req?.user._id;
  try {
    if (!patientIdn || !providerId) {
      throw new Error(
        "Missing required parameters: provider and patient id are required."
      );
    }

    let carePlans;
    if (limit) {
      const limitValue = parseInt(limit, 10);
      if (isNaN(limitValue) || limitValue <= 0) {
        throw new Error(
          "Invalid limit parameter. It must be a positive number."
        );
      }
      carePlans = await carePlanSum
        .find({ patientId: patientIdn, providerId: providerId })
        .sort({ createdAt: -1 })
        .limit(limitValue);
    } else {
      carePlans = await carePlanSum
        .find({ patientId: patientIdn, providerId: providerId })
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: carePlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

/**
 * @desc    Get Care Plan by Plan ID
 * @route   GET /api/careplan/:planId
 * @access  Private
 * @param   {String} planId - The ID of the Care Plan to retrieve
 * @returns {Object} - The Care Plan document if found
 */

export const getCarePlanById = catchAsyncError(async (req, res, next) => {
  const { planId } = req.params;

  try {
    // Validate planId
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: planId is required.",
      });
    }

    let planIdn;
    try {
      planIdn = new mongoose.Types.ObjectId(planId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid planId format. Must be a valid ObjectId.",
      });
    }

    const carePlan = await carePlanSum.findById(planIdn);

    if (!carePlan) {
      return res.status(404).json({
        success: false,
        message: "Care Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: carePlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const updateCarePlanById = catchAsyncError(async (req, res, next) => {
  const { planId } = req.params;
  const { isSigned, carePlan } = req.body;
  let formattedCareplan = carePlan || "";

  try {
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: planId is required.",
      });
    }

    const updateFields = {};

    if (isSigned !== undefined) {
      updateFields.isSigned = isSigned;
    }

    if (carePlan !== undefined) {
      await generateAIResponse(
        "http://54.218.176.251/api/v1/prediction/29231976-3264-4e92-abb2-90a0f5931832",
        process.env.FLOWISE_AUTH_KEY,
        {
          question: carePlan,
        }
      ).then(async (response) => {
        if (response.text) {
          formattedCareplan = response.text;
        }
      });

      updateFields.carePlan = formattedCareplan;
    }

    const updatedCarePlan = await carePlanSum.findByIdAndUpdate(
      planId,
      updateFields,
      { new: true }
    );

    if (!updatedCarePlan) {
      return res.status(404).json({
        success: false,
        message: "Care Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: formattedCareplan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const carePlanItems = catchAsyncError(async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const providerId = req?.user?._id;

    // Validate required parameters
    if (!patientId || !providerId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: provider and patient id are required.",
      });
    }

    const patientIdn = new mongoose.Types.ObjectId(patientId);

    // Fetch care plans and notes summary concurrently
    const [carePlans, notes] = await Promise.all([
      carePlanSum
        .find({ patientId: patientIdn, providerId })
        .sort({ createdAt: -1 })
        .limit(2),
      notesSum.findOne({ patientId: patientIdn }).sort({ createdAt: -1 }),
    ]);

    // Provide default values if results are null or undefined
    const safeCarePlans = carePlans || [];
    const safeNotes = notes || {};

    // Send the response to the frontend
    res.status(200).json({
      success: true,
      data: {
        carePlans: safeCarePlans,
        notes: safeNotes,
      },
    });
  } catch (error) {
    // Improved error handling
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const generateCarePlan = catchAsyncError(async (req, res, next) => {
  const { patientId, progressNotes, psychotherapyNotes, carePlans } = req.body;
  if (!carePlans.carePlan0 && !carePlans.carePlan1) {
    return res.status(200).json({
      success: false,
      message: "A Care Plan is Required.",
    });
  }
  if (
    progressNotes == false &&
    psychotherapyNotes == false &&
    !(carePlans.carePlan0 || carePlans.carePlan1)
  ) {
    return res.status(200).json({
      success: false,
      message: "No option was selected!",
    });
  }
  const patientIdn = new mongoose.Types.ObjectId(patientId);
  const providerId = req?.user._id;

  try {
    if (!patientIdn || !providerId) {
      throw new Error(
        "Missing required parameters: provider and patient id are required."
      );
    }

    // Check if there is already a care plan created today based on the timestamp
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingCarePlan = await carePlanSum.findOne({
      patientId: patientIdn,
      providerId: providerId,
      createdAt: { $gte: todayStart.getTime() },
    });

    if (existingCarePlan) {
      return res.status(200).json({
        success: false,
        message: "A care plan has already been created today.",
      });
    }

    let clinicalNote = "";
    let processNote = "";
    let careplan0 = "";
    let careplan1 = "";

    if (progressNotes || psychotherapyNotes) {
      const response = await notesSum
        .findOne({ patientId: patientIdn })
        .sort({ createdAt: -1 });

      if (progressNotes) {
        clinicalNote = response.summary[0].content;
      }
      if (psychotherapyNotes) {
        processNote = response.summary[1].content;
      }
    }

    if (carePlans?.carePlan0) {
      const cpId = new mongoose.Types.ObjectId(carePlans.carePlan0);
      const response = await carePlanSum.find({ _id: cpId });
      careplan0 = response[0].carePlan;
    }

    if (carePlans?.carePlan1) {
      const cpId = new mongoose.Types.ObjectId(carePlans.carePlan1);
      const response = await carePlanSum.find({ _id: cpId });
      careplan1 = response[0].carePlan;
    }

    const careplanData = {
      "Most recent progress notes": clinicalNote,
      "Psychological testing results": processNote,
      "Latest Care Plan": careplan0,
      "Old Care Plan": careplan1,
    };

    // generateAIResponse("http://54.218.176.251/api/v1/prediction/469d5070-07c1-4d2e-89ae-8da84872a6ee", process.env.FLOWISE_AUTH_KEY, {
    generateAIResponse(
      "http://54.218.176.251/api/v1/prediction/899fe09e-5a8a-4f71-a40a-901d44fc6b00",
      process.env.FLOWISE_AUTH_KEY,
      {
        question: careplanData,
      }
    ).then(async (response) => {
      if (response.text) {
        const primaryICD10Code = extractPrimaryICD10Code(response.text) || "";
        const newCarePlan = new carePlanSum({
          providerId: providerId,
          patientId: patientIdn,
          carePlan: response.text,
          primaryICD10Code: primaryICD10Code,
        });
        await newCarePlan.save();
        res.status(200).json({
          success: true,
          message: "Careplan generated successfully.",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const generateJourneySummary = catchAsyncError(
  async (req, res, next) => {
    const { Types } = mongoose;
    const userId = req?.user?._id;
    const { patientId } = req.body;

    const patientIdn = new Types.ObjectId(patientId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    try {
      let summary;
      if (!patientId || patientId === "") {
        summary = await aiptSum
          .findOne({ userId: userId })
          .sort({ createdAt: -1 });
      } else {
        summary = await aiptSum
          .findOne({ userId: patientIdn })
          .sort({ createdAt: -1 });
      }
      // Check if a summary was found
      if (!summary) {
        return res.status(204).json({
          success: false,
          message: "No summary found for the given user",
        });
      }

      // Send the summary data as response
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      console.error(err);
      // Handling any errors during the query or processing
      res.status(500).json({
        success: false,
        message: "Error retrieving journey summary",
        error: err.message,
      });
    }
  }
);

export const getPatientNotesSummary = catchAsyncError(
  async (req, res, next) => {
    const { Types } = mongoose;
    const userId = req?.user?._id;

    const { patientId } = req.body;

    const patientIdn = new Types.ObjectId(patientId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    try {
      let notesummary;
      // if (!patientId || patientId === '') {
      //   notesummary = await notesSum.findOne({ 'patientId': userId }).sort({ 'createdAt': -1 });
      // } else {
      notesummary = await notesSum
        .findOne({ patientId: patientIdn })
        .sort({ createdAt: -1 });
      // }
      // Check if a notesummary was found
      if (!notesummary) {
        return res.status(404).json({
          success: false,
          message: "No notesummary found for the given user",
        });
      }

      // Send the notesummary data as response
      res.status(200).json({
        success: true,
        data: notesummary,
      });
    } catch (err) {
      console.error(err);
      // Handling any errors during the query or processing
      res.status(500).json({
        success: false,
        message: "Error retrieving patient note summary",
        error: err.message,
      });
    }
  }
);

export const getSevenDaySummary = catchAsyncError(async (req, res, next) => {
  const { Types } = mongoose;
  const userId = req?.user?._id;

  const { patientId } = req.body;

  const patientIdn = new Types.ObjectId(patientId);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    let summary;
    if (!patientId || patientId === "") {
      summary = await sevenDaySum
        .findOne({ userId: userId })
        .sort({ createdAt: -1 });
    } else {
      summary = await sevenDaySum
        .findOne({ userId: patientIdn })
        .sort({ createdAt: -1 });
    }
    // Check if a summary was found
    if (!summary) {
      return res.status(204).json({
        success: false,
        message: "No summary found for the given user",
      });
    }

    // Send the summary data as response
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    console.error(err);
    // Handling any errors during the query or processing
    res.status(500).json({
      success: false,
      message: "Error retrieving journey summary",
      error: err.message,
    });
  }
});

export const getIJEmailTemplate = catchAsyncError(async (req, res, next) => {
  const { Types } = mongoose;
  const userId = req?.user?._id;

  const { patientId } = req.body;

  const patientIdn = new Types.ObjectId(patientId);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    let template;
    if (!patientId || patientId === "") {
      template = await IJEmailTemplate.findOne({ userId: userId }).sort({
        createdAt: -1,
      });
    } else {
      template = await IJEmailTemplate.findOne({ userId: patientIdn }).sort({
        createdAt: -1,
      });
    }
    // Check if a template was found
    if (!template) {
      return res.status(204).json({
        success: false,
        message: "No template found for the given user",
      });
    }

    // Send the template data as response
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (err) {
    console.error(err);
    // Handling any errors during the query or processing
    res.status(500).json({
      success: false,
      message: "Error retrieving journey template",
      error: err.message,
    });
  }
});

export const getTherapistProfile = catchAsyncError(async (req, res, next) => {
  const { Types } = mongoose;
  const userId = req?.user?._id;

  const { patientId } = req.body;

  const patientIdn = new Types.ObjectId(patientId);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    let tp;
    if (!patientId || patientId === "") {
      tp = await therapistProfile.findOne({ userId: userId }).sort({
        createdAt: -1,
      });
    } else {
      tp = await therapistProfile.findOne({ userId: patientIdn }).sort({
        createdAt: -1,
      });
    }
    // Check if a tp was found
    if (!tp) {
      return res.status(204).json({
        success: false,
        message: "No Therapist Profile found for the given user",
      });
    }

    // Send the tp data as response
    res.status(200).json({
      success: true,
      data: tp,
    });
  } catch (err) {
    console.error(err);
    // Handling any errors during the query or processing
    res.status(500).json({
      success: false,
      message: "Error retrieving Therapist Profile",
      error: err.message,
    });
  }
});

export const generateSevenDaySummary = catchAsyncError(
  async (req, res, next) => {
    const userId = req?.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    try {
      const summary = await Mood.find({ userId: userId })
        .sort({ date: -1 })
        .limit(7);

      async function query(data) {
        const response = await fetch(
          "http://localhost:3000/api/v1/prediction/75d70b3a-7bfa-4b3a-8fde-09f80dacd48e",
          {
            headers: {
              Authorization:
                "Bearer GmdEI8hEX0Xzqc+EMO8yzfCYHCckNzac8Kj4zfxhm+o=",
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        const result = await response.json();
        return result;
      }

      // Check if a summary was found
      if (!summary) {
        return res.status(204).json({
          success: false,
          message: "No summary found for the given user",
        });
      } else {
        query({
          question: summary,
        }).then((response) => {
          async function saveTextAndSessionId() {
            try {
              const newsevenDaySum = new sevenDaySum({
                userId: userId,
                summary: response.text,
              });
              await newsevenDaySum.save();
            } catch (err) {
              console.error("Error saving data", err);
            }
          }
          saveTextAndSessionId();
        });
      }

      // Send the summary data as response
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      console.error(err);
      // Handling any errors during the query or processing
      res.status(500).json({
        success: false,
        message: "Error retrieving journey summary",
        error: err.message,
      });
    }
  }
);

export const generateNotesSummary = catchAsyncError(async (req, res, next) => {
  const userId = req?.user?._id;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const summary = await Notes.find({ patiendId: userId })
      .sort({ createdAt: -1 })
      .limit(7);

    async function query(data) {
      const response = await fetch(
        "http://localhost:3000/api/v1/prediction/2f868040-0158-434d-bcbf-44023ee6c82f",
        {
          headers: {
            Authorization:
              "Bearer GmdEI8hEX0Xzqc+EMO8yzfCYHCckNzac8Kj4zfxhm+o=",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      return result;
    }

    // Check if a summary was found
    if (!summary) {
      return res.status(204).json({
        success: false,
        message: "No summary found for the given user",
      });
    } else {
      query({
        question: summary,
      }).then((response) => {
        // async function saveTextAndSessionId() {
        //   try {
        //     const newsevenDaySum = new sevenDaySum({ userId: userId, summary: response.text });
        //     await newsevenDaySum.save();
        //   } catch (err) {
        //     console.error('Error saving data', err);
        //   }
        // }
        // saveTextAndSessionId();
      });
    }

    // Send the summary data as response
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    console.error(err);
    // Handling any errors during the query or processing
    res.status(500).json({
      success: false,
      message: "Error retrieving journey summary",
      error: err.message,
    });
  }
});

export const initialJourney = catchAsyncError(async (req, res, next) => {
  const user_id = req.user?._id;
  const question = req.body.message;
  let mentalHealthData = "";
  let dayCount = 0;

  // function for initial journey chat
  // async function query(data) {
  //   const response = await fetch(
  //     "https://aipersona-test.onrender.com/api/v1/prediction/762ca78c-f88a-4cb0-9f33-764c4070b722",
  //     {
  //       headers: {
  //         Authorization: "Bearer zG6LwoYOCyabyvlmPJ7W115xbY85SYhw8qKY8K371+c=",
  //         "Content-Type": "application/json"
  //       },
  //       method: "POST",
  //       body: JSON.stringify(data)
  //     }
  //   );
  //   const result = await response.json();
  //   return result;
  // }

  // function for day extraction from initial journey
  // async function days(data) {
  //   const response = await fetch(
  //     "https://aipersona-test.onrender.com/api/v1/prediction/e7f56c5e-15f0-4389-9431-ebfafac990f1",
  //     {
  //       headers: {
  //         Authorization: "Bearer zG6LwoYOCyabyvlmPJ7W115xbY85SYhw8qKY8K371+c=",
  //         "Content-Type": "application/json"
  //       },
  //       method: "POST",
  //       body: JSON.stringify(data)
  //     }
  //   );
  //   const result = await response.json();
  //   return result;
  // }
  // initial journey flowise chatflow request
  generateAIResponse(
    process.env.INITIAL_jOURNEY_FLOWISE_API,
    process.env.FLOWISE_AUTH_KEY,
    {
      question: question,
      overrideConfig: {
        sessionId: user_id,
      },
    }
  ).then(async (response) => {
    const newQuestionSetBegan = extractQuestionSetNumber(response?.text);
    if (newQuestionSetBegan) {
      try {
        const update = { initialJourneyCount: newQuestionSetBegan };
        const user = await userModel.findOneAndUpdate(
          { _id: user_id },
          update,
          {
            new: true,
            upsert: true,
          }
        );
        if (!user) {
          throw new Error("User not found or failed to update");
        }
        response.journeyCount = newQuestionSetBegan;
      } catch (err) {
        console.error("Error updating user data", err);
        throw new Error("Failed to update user data");
      }
    }
    // Initial journey code for claud api in progress
    if (response.text && response.text.includes("Therapist Profile")) {
      mentalHealthData = response.text;
      // if (mentalHealthData.length > 0 && mentalHealthData[0].heading == 'Target Therapist Profile:') {
      //   const profileData = "**" + mentalHealthData[0].heading + "** \n\n" + mentalHealthData[0].content;
      //   try {
      //     const newTherapistProfile = new therapistProfile({
      //       userId: response.sessionId,
      //       therapistProfile: profileData,
      //     });
      //     await newTherapistProfile.save();
      //     console.log('profile data saved successfully');
      //   } catch (err) {
      //     console.error("Error saving data", err);
      //   }
      // }
      // if (mentalHealthData.length > 0 && mentalHealthData[1].heading == 'Email Template for Therapists:') {
      //   const emailData = "**" + mentalHealthData[1].heading + "** \n\n" + mentalHealthData[1].content;
      //   try {
      //     const IJEmailTemp = new IJEmailTemplate({
      //       userId: response.sessionId,
      //       template: emailData,
      //     });
      //     await IJEmailTemp.save();
      //     console.log("Email Template Saved Successfully");
      //   } catch (err) {
      //     console.error("Error saving data", err);
      //   }
      // }
      // generateSummary('mental health report summary', response.sessionId);
      response.completed = true;
      response.journeyCount = 12;
    }

    // initial journey code with openAI
    // if (hasDay(response.text)) {
    //   // day extractor flowse chatflow request
    //   generateAIResponse(process.env.DAY_EXTRACTOR_FLOWISE_API, process.env.FLOWISE_AUTH_KEY ,{
    //     question: response.text,
    //     overrideConfig: {
    //       sessionId: user_id,
    //     },
    //   }).then((response) => {
    //     console.log(response);
    //     async function myFunction(user_id, response) {
    //       const initialJourney = await getInitialJourneyCount(user_id);
    //       if (initialJourney + 1 === response.json.day) {
    //         checkAndUpdateInitialJourneyCount(user_id, response.json.day);
    //       }
    //       if (response.json.day == 10) {
    //         summary(user_id);
    //       }
    //     }
    //     myFunction(user_id, response);
    //   });
    // } else {
    // }
    res.status(201).json({
      success: true,
      response,
    });

    if (response.completed) {
      setImmediate(() => {
        generateSummary(
          mentalHealthData,
          "mental health report summary",
          response.sessionId
        );
      });
    }
  });
});

export const getConversation = catchAsyncError(async (req, res, next) => {
  const sessionId = req.user?._id?.toString(); // Assuming user is properly populated from some middleware
  try {
    const data = await DynamicModel.find({ sessionId: sessionId });
    res.json(data[0]?.messages);
  } catch (error) {
    console.error("Error fetching messages", error);
    res.status(500).send("Failed to fetch messages");
  }
});

// const hasDay = (str) => {
//   const regex = /Day/;
//   return regex.test(str);
// };

// function hasInsightDayPattern(str) {
//   const regex = /Insight \(Day (\d+)\)/;
//   return regex.test(str);
// }

// const summary = async (userId) => {
//   async function query(data) {
//     const response = await fetch(
//       "https://aipersona-test.onrender.com/api/v1/prediction/2fd17255-bf21-47f9-bd32-150356d7a9ed",
//       {
//         headers: {
//           Authorization: "Bearer zG6LwoYOCyabyvlmPJ7W115xbY85SYhw8qKY8K371+c=",
//           "Content-Type": "application/json"
//         },
//         method: "POST",
//         body: JSON.stringify(data)
//       }
//     );
//     const result = await response.json();
//     return result;
//   }

//   const sessionId = userId.toString();

//   const data = await DynamicModel.find({ sessionId: sessionId });
//   const jsonData = data[0]?.messages;

//   if (jsonData) {
//     generateAIResponse(process.env.INITIAL_jOURNEY_SUMMARY_FLOWISE_API, process.env.FLOWISE_AUTH_KEY, {
//       question: jsonData,
//       overrideConfig: {
//         sessionId: userId,
//       },
//     }).then((response) => {
//       async function saveTextAndSessionId() {
//         try {
//           const newAiptSum = new aiptSum({
//             userId: response.sessionId,
//             summary: response.text,
//           });
//           await newAiptSum.save();
//         } catch (err) {
//           console.error("Error saving data", err);
//         }
//       }
//       saveTextAndSessionId();

//       generateAIResponse(process.env.EMAIL_TEMPLATE_FLOWISE_API, process.env.FLOWISE_AUTH_KEY, { question: response.text }).then(
//         (response) => {
//           async function saveTextAndSessionId() {
//             try {
//               const IJEmailTemp = new IJEmailTemplate({
//                 userId: userId,
//                 template: response.text,
//               });
//               await IJEmailTemp.save();
//               console.log("Email Template Saved Successfully");
//             } catch (err) {
//               console.error("Error saving data", err);
//             }
//           }
//           saveTextAndSessionId();
//         }
//       );
//     });
//   }
// };

// async function generateInitialJourneyEmailTemplate(data) {
//   const response = await fetch(
//     "https://aipersona-test.onrender.com/api/v1/prediction/0d1d1d83-09be-4e3b-93e2-059909a7766a",
//     {
//       headers: {
//         Authorization: "Bearer zG6LwoYOCyabyvlmPJ7W115xbY85SYhw8qKY8K371+c=",
//         "Content-Type": "application/json"
//       },
//       method: "POST",
//       body: JSON.stringify(data)
//     }
//   );
//   const result = await response.json();
//   return result;
// }

async function generateAIResponse(chatflowApi, authKey, data = {}) {
  try {
    if (!chatflowApi || !authKey) {
      throw new Error(
        "Missing required parameters: chatflowApi and authKey are required."
      );
    }

    const response = await fetch(chatflowApi, {
      headers: {
        Authorization: `Bearer ${authKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Handle HTTP errors
      const errorDetail = await response.json();
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${errorDetail.message}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error.cause && error.cause.code === "UND_ERR_CONNECT_TIMEOUT") {
      // Handle connect timeout error specifically
      console.error("Connect timeout error:", error.message);
      return { error: "Connect timeout error", message: error.message };
    } else {
      // Handle other errors
      console.error("An error occurred:", error.message);
      return { error: "An error occurred", message: error.message };
    }
  }
}

async function generateSummary(mentalHealthData, question, userId) {
  try {
    if (mentalHealthData) {
      const extractedData = extractSections(mentalHealthData);
      if (
        extractedData.length > 0 &&
        (extractedData[0].heading == "Target Therapist Profile:" ||
          extractedData[0].heading == "Target Therapist Profile")
      ) {
        const profileData =
          "**" +
          extractedData[0].heading +
          "** \n\n" +
          extractedData[0].content;
        try {
          const newTherapistProfile = new therapistProfile({
            userId: userId,
            therapistProfile: profileData,
          });
          await newTherapistProfile.save();
          // console.log("profile data saved successfully");
        } catch (err) {
          console.error("Error saving data", err);
        }
      }
      if (
        extractedData.length > 0 &&
        (extractedData[1].heading == "Email Template for Therapists:" ||
          extractedData[1].heading == "Email Template for Therapists")
      ) {
        const emailData =
          "**" +
          extractedData[1].heading +
          "** \n\n" +
          extractedData[1].content;
        try {
          const IJEmailTemp = new IJEmailTemplate({
            userId: userId,
            template: emailData,
          });
          await IJEmailTemp.save();
        } catch (err) {
          console.error("Error saving data", err);
        }
      }
    }
    const response = await generateAIResponse(
      process.env.INITIAL_jOURNEY_FLOWISE_API,
      process.env.FLOWISE_AUTH_KEY,
      {
        question: question,
        overrideConfig: {
          sessionId: userId,
        },
      }
    );

    if (!response || !response.sessionId || !response.text) {
      console.error("Invalid response from AI service");
    }

    try {
      const newAiptSum = new aiptSum({
        userId: response.sessionId,
        summary: response.text,
      });
      await newAiptSum.save();
    } catch (err) {
      console.error("Error saving summary data", err);
      throw new Error("Failed to save summary data");
    }

    try {
      const update = { initialJourneyCount: 12 };
      const user = await userModel.findOneAndUpdate({ _id: userId }, update, {
        new: true,
        upsert: true,
      });
      if (!user) {
        throw new Error("User not found or failed to update");
      }
    } catch (err) {
      console.error("Error updating user data", err);
      throw new Error("Failed to update user data");
    }
  } catch (err) {
    console.error("Error in generateSummary function", err);
    return {
      success: false,
      message: `Failed to generate summary: ${err.message}`,
    };
  }
}

// Function to check and update initialJourneyCount (can be used in your routes or logic)
// const checkAndUpdateInitialJourneyCount = async (userId, dayCount) => {
//   try {
//     const update = { initialJourneyCount: dayCount }; // Use $inc operator
//     const user = await userModel.findOneAndUpdate({ _id: userId }, update, {
//       new: true,
//       upsert: true,
//     });

//     if (user) {
//     } else {
//     }
//   } catch (error) { }
// };

// const getInitialJourneyCount = async (userId) => {
//   try {
//     const user = await userModel.findById(userId);

//     if (user) {
//       return user.initialJourneyCount;
//     } else {
//       return null; // Or any default value you prefer
//     }
//   } catch (error) {
//     console.error(
//       `Error getting initialJourneyCount for user ${userId}: ${error.message}`
//     );
//     return null; // Or any default value you prefer in case of errors
//   }
// };

function extractSections(text) {
  // Define the section headings
  // const headings = [
  //     "**Target Therapist Profile:**",
  //     "**Therapist Interview Questionnaire:**",
  //     "**Email Template for Therapists:**"
  // ];
  const headings = [
    "**Target Therapist Profile:**",
    "**Email Template for Therapists:**",
    "**Target Therapist Profile**",
    "**Email Template for Therapists**",
  ];

  // Initialize an array to store the sections
  const sections = [];

  // Split the text into lines
  const lines = text.split("\n");

  // Initialize variables to keep track of the current section and its content
  let currentSection = null;
  let currentContent = [];

  // Iterate over each line to extract content based on the headings
  for (const line of lines) {
    if (headings.includes(line.trim())) {
      // If a new heading is found, store the previous section's content
      if (currentSection !== null) {
        sections.push({
          heading: currentSection,
          content: currentContent.join("\n").trim(),
        });
      }
      // Update the current section
      currentSection = line.trim().replace(/^\*\*|\*\*$/g, "");
      currentContent = [];
    } else if (currentSection !== null) {
      // If within a section, add the line to the current content
      currentContent.push(line);
    }
  }

  // Store the last section's content
  if (currentSection !== null) {
    sections.push({
      heading: currentSection,
      content: currentContent.join("\n").trim(),
    });
  }

  // Return the sections as a JSON array
  return sections;
  // return JSON.stringify(sections, null, 2);
}

function extractPrimaryICD10Code(text) {
  const match = text.match(/\*\*Primary ICD-10 code:\*\*\s*([A-Za-z0-9.-]+)/i);
  return match ? match[1] : null;
}

function extractQuestionSetNumber(text = "") {
  if (text) {
    const match = text.match(/question set\s*(\d+)/i);
    return match ? match[1] : null;
  }
  return null;
}
