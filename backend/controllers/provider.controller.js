import userModel from "../model/user.model.js";
import invitationModel from "../model/invitation.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import dotenv from "dotenv";
import patientInvitationModel from "../model/patientInvitation.model.js";
import sendMail from "../utils/sendMail.js";

dotenv.config();

// get patient list
export const getPatientList = catchAsyncError(async (req, res, next) => {
  try {
    const providerId = req.user?._id;

    // Validate input
    if (!providerId) {
      throw new Error("Please provide provider ID.");
    }

    let allPatients = []; // Initialize empty array to store merged patient data

    // Fetch patients based on provider ID (if provided)
    if (providerId) {
      const providerPatients = await patientInvitationModel.find({
        senderId: providerId,
        patientName: { $exists: true }, // Ensure patient name exists
        patientEmail: { $exists: true }, // Ensure patient email exists
        // Should not include deleted patients
        invitationStatus: { $ne: "deleted" },
        // patientId: { $exists: true }, // Ensure customer ID exists
      });

      const providerInvitations = await invitationModel.find({
        // doctorId: req?.user?.customerId,
        doctorEmail: req?.user?.email,
        invitationStatus: { $ne: "deleted" },
        // senderId: { $exists: true }, // Ensure doctor senderId exists
      });

      // Process providerPatients data
      const processedProviderPatients = await Promise.all(
        providerPatients.map(async (patientInvitation) => {
          const patientSenderId = await userModel.findOne({
            email: patientInvitation.patientEmail,
          });

          if (patientSenderId) {
            return {
              patientinvitationId: patientInvitation._id,
              firstName: patientInvitation.patientName || "",
              patientId:
                patientInvitation.patientId || patientSenderId.customerId || "",
              email: patientInvitation.patientEmail || "",
              senderId: patientSenderId._id,
              phoneNumber: "",
              sentOn: patientInvitation.sentOn,
              getInvited: "sendInvitation",
              invitationStatus: patientInvitation.invitationStatus,
            };
          }
        })
      );

      // Process providerInvitations data
      const processedProviderInvitations = await Promise.all(
        providerInvitations.map(async (invitation) => {
          const patient = await userModel.findById(invitation.senderId);

          if (patient) {
            return {
              invitationId: invitation._id,
              firstName: patient.firstName + " " + patient.lastName || "",
              patientId: patient.customerId || "",
              email: patient.email || "",
              senderId: patient._id,
              phoneNumber: "",
              sentOn: invitation.sentOn,
              getInvited: "recieveInvitation",
              invitationStatus: invitation.invitationStatus,
            };
          }
        })
      );

      // Filter out null entries
      const validProviderPatients = processedProviderPatients.filter(Boolean);
      const validProviderInvitations =
        processedProviderInvitations.filter(Boolean);

      // Merge the processed data
      allPatients = [...validProviderInvitations, ...validProviderPatients];
    }

    res.status(200).json({
      success: true,
      patients: allPatients,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Handle errors using your error handler
  }
});

// Get all senderIds where npiNumber matches a specific value
const getSenderIdsByNpi = async (npiNumber) => {
  try {
    const senderIds = await invitationModel.find(
      { npiNumber },
      { senderId: 1, invitationStatus: 1, npiNumber: 1 }
    );
    if (senderIds.length > 0) {
      //   return senderIds.map((invitation) => invitation.senderId);
      return senderIds.map((invitation) => ({
        senderId: invitation.senderId,
        invitationStatus: invitation.invitationStatus,
      }));
    } else {
      console.log("No senderIds found for the given npiNumber.");
      return []; // Return an empty array if no matches
    }
  } catch (err) {
    console.error("Error getting senderIds by npiNumber:", err);
    throw err; // Re-throw the error for handling at the caller
  }
};

// Get data from users table where _id is equal to sender id
const getUserDataBySenderIds = async (senderIds) => {
  try {
    const patientAcceptance = senderIds.map((data) => data.senderId);
    const users = await userModel.find({ _id: { $in: patientAcceptance } });

    if (users.length > 0) {
      const transformedUsers = users.map((user) => ({
        ...user.toObject(), // Spread all user data
        invitationStatus: senderIds.find(
          (npiNumber) => senderIds.npiNumber === user.npiNumber
        )?.invitationStatus, // Find accepted for matching NPI
      }));
      return transformedUsers;
    } else {
      console.log("No users found with the given senderIds.");
    }
  } catch (err) {
    console.error("Error getting user data by senderIds:", err);
  }
};

// Update Invitation Status
export const updateInvitationStatus = catchAsyncError(
  async (req, res, next) => {
    try {
      const { newStatus } = req.body;

      if (!npiNumber) {
        throw new Error("Please provide the NPI number.");
      }

      const updatedDocument = await invitationModel.updateOne(
        { $set: { invitationStatus: newStatus } },
        { new: true } // Return the updated document
      );

      if (!updatedDocument) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      return res.status(200).json(updatedDocument);
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(500).json({ message: "Internal server error" }); // Handle generic errors gracefully
    }
  }
);
// get all patient of a specific doctor
export const getUsersByIds = catchAsyncError(async (req, res, next) => {
  try {
    // Extract user IDs from the query parameters
    const userIds = req.query.userIds.split(",");

    // Retrieve users with the extracted IDs
    const users = await userModel.find({ _id: { $in: userIds } });

    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Handle errors using your error handler
  }
});

// Update invitation status by ID
export const updateInvitationStatusById = catchAsyncError(
  async (req, res, next) => {
    try {
      const { newStatus, id } = req.body;

      if (!id || !newStatus) {
        throw new Error("Please provide the ID and new status.");
      }

      const updatedInvitation = await invitationModel.findByIdAndUpdate(
        id,
        { invitationStatus: newStatus },
        { new: true }
      );

      if (!updatedInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      res.status(200).json({
        success: true,
        updatedInvitation: updatedInvitation,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400)); // Handle errors using your error handler
    }
  }
);

// Delete invitation by ID
export const deleteInvitationById = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      throw new Error("Please provide the ID.");
    }

    const deleteInvitation = await invitationModel.findByIdAndDelete(id);

    if (!deleteInvitation) {
      const provider = await patientInvitationModel.findByIdAndDelete(id);
      if (!provider) {
        return res.status(404).json({ message: "Invitation not found" });
      }
    }

    res.status(200).json({
      success: true,
      deleteInvitation: deleteInvitation,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Handle errors using your error handler
  }
});

// Provider Invite Patient
export const addPatient = catchAsyncError(async (req, res, next) => {
  const { patientName, patientId } = req.body;
  const senderId = req.user?._id;
  const patientData = await userModel.findOne({ customerId: patientId });
  try {
    // Step 1: Fetch the current user details
    const ProviderUser = await userModel.findById(senderId);
    const userEmail = ProviderUser.email.trim(); // Trim whitespace from the Provider user's email

    if (!patientData) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const PatientUserEmail = patientData.email.trim(); // Trim whitespace from the Patient user's email
    const patientSenderId = patientData._id; // Get the Patient user's id

    // Step 2: Check if the user's patientId already exists in patientInvitations
    const patientInvitationData = await invitationModel.find({
      senderId: patientSenderId,
      doctorEmail: userEmail,
    });

    if (patientInvitationData.length > 0) {
      return res.status(400).json({
        success: false,
        message: `This user is already linked with a patient.`,
      });
    }

    // Check if the patient patientId already exists
    const isPatientIdExist = await userModel.findOne({
      customerId: patientId,
    });
    const isDuplicateInvitation = await patientInvitationModel.findOne({
      senderId: senderId,
      patientEmail: patientData.email,
    });

    if (isDuplicateInvitation) {
      res.status(200).json({
        success: false,
        message: `Invitation already exists for this patient against this sender.`,
      });
    } else {
      if (isPatientIdExist) {
        // Fetch the Existing user
        const user = await userModel.findById(senderId);
        const isPatient =
          isPatientIdExist.userRole === "Patient" ? true : false;
        if (isPatient) {
          // Construct the data object
          const username = user.firstName;
          const loginUrl = process.env.BASE_URL + "auth/login";
          const data = {
            user: {
              username,
              loginUrl,
              patientName,
              patientEmail: patientData.email,
            },
          };
          try {
            await sendMail({
              email: patientData.email,
              subject:
                "Reminder: Login to Your Theryo.ai Platform as a Client Account",
              template: "invitation-patient-mail.ejs", // Email template
              data,
            });

            const newPatientInvitation = await patientInvitationModel.create({
              senderId,
              patientName,
              patientId: patientId,
              patientEmail: patientData.email,
              invitationStatus: "pending",
            });
            await newPatientInvitation.save();

            res.status(200).json({
              success: true,
              message: `Invitation email sent to ${patientName} at ${patientData.email}`,
            });
          } catch (error) {
            return next(new ErrorHandler(error.message, 400));
          }
        } else {
          res.status(200).json({
            success: false,
            message: `This customer ID belongs to a Provider.`,
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: `Patient not found with the provided customer ID.`,
        });
      }
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
