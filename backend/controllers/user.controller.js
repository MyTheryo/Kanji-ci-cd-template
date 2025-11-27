import userModel from "../model/user.model.js";
import invitationModel from "../model/invitation.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendMail from "../utils/sendMail.js";
import { sendToken } from "../utils/jwt.js";
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/user.servic.js";
import cloudinary from "cloudinary";
import patientInvitationModel from "../model/patientInvitation.model.js";
import Goal from "../model/goal.model.js";
import bcrypt from "bcryptjs";
import axios from "axios";
import PatientInvitation from "../model/patientInvitation.model.js";
import Invitation from "../model/invitation.model.js";
import { logActivity } from "../utils/logger.js";

dotenv.config();
import mongoose from "mongoose";
// Define a dynamic schema that can adapt to the structure of the data
const dynamicSchema = new mongoose.Schema({}, { strict: false });

/**
 * @function registrationUser
 * @description Registers a new user by validating input details, checking for email uniqueness,
 *              hashing the password, and creating a user record in the database.
 *              Initiates sending an activation code for email verification.
 * @param {Object} req - The Express request object containing user registration details.
 * @param {Object} res - The Express response object to send responses.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const registrationUser = catchAsyncError(async (req, res, next) => {
  try {
    // Extract user details from the request body
    const { firstName, lastName, email, password, userRole, npiNumber } =
      req.body;

    // Check if the email already exists in the database
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    // Check if NPI number already exists in the database
    const isNpiNumberExist = await userModel.findOne({ npiNumber });
    if (isNpiNumberExist && userRole == "Provider") {
      return next(new ErrorHandler("License number already exists", 400));
    }

    // Hash the password for secure storage
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database with hashed password
    const user = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      userRole,
      npiNumber,
    });

    // Send activation code to the user's email
    sendActivationCode(req, res, next);
  } catch (error) {
    // Handle any errors during registration
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function sendActivationCode
 * @description Sends an activation code to the user's email for account verification.
 *              Verifies that the user exists and their account is not already activated.
 * @param {Object} req - The Express request object containing the user email.
 * @param {Object} res - The Express response object to send responses.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const sendActivationCode = catchAsyncError(async (req, res, next) => {
  try {
    let email, newEmail;
    if (req.body.newEmail) {
      newEmail = req.body.newEmail;
      email = req.body.currentEmail;
    } else {
      // Extract email from the request body
      email = req.body.email;
    }

    // Find user by email
    let user = await userModel.findOne({ email });

    // Return error if user is not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.body.newEmail) {
      user = { ...user._doc, newEmail: newEmail };
    } else {
      // Check if the user's email is already verified
      if (user?.emailVerifiedStatus) {
        return res.status(400).json({
          success: false,
          message: "Account is already activated",
        });
      }
    }

    // Create an activation token containing an activation code
    const activationToken = createActivationToken(user);

    // Prepare activation code and user data for the email template
    const activationCode = activationToken.activationCode;
    const data = { name: user.firstName, activationCode: activationCode };

    try {
      // Send activation email to the user
      await sendMail({
        email: user?.newEmail ? user.newEmail : user.email,
        subject: user?.newEmail ? "Verify New Email" : "Activate your account",
        template: user?.newEmail
          ? "change-email-mail.ejs"
          : "activation-mail.ejs",
        data,
      });

      // Send a successful response with email and activation token details
      res.status(200).json({
        success: true,
        message: user?.newEmail
          ? `Please check your new email: ${newEmail} to verify and update it.`
          : `Please check your email: ${user.email} to activate your account`,
        activationToken: activationToken.token,
        email: user?.newEmail ? user.newEmail : user.email,
        oldEmail: email,
      });
    } catch (error) {
      // Handle email sending error
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    // Handle any general errors in sending activation code
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function createActivationToken
 * @description Generates a JWT activation token with a unique activation code for user email verification.
 *              The token has a short expiration time to ensure security.
 * @param {string} email - The email address of the user for whom the activation token is created.
 * @returns {Object} An object containing:
 *          - `token`: The JWT activation token.
 *          - `activationCode`: The unique activation code embedded in the token.
 */
export const createActivationToken = (email) => {
  // Generate a 4-digit random activation code
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  // Sign the activation token with the user's email and activation code, setting a 1-minute expiration
  const token = jwt.sign(
    {
      email,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    { expiresIn: "1m" } // Token expires in 1 minute for security
  );

  // Return the token and activation code
  return { token, activationCode };
};

/**
 * @function activateUser
 * @description Verifies the user's activation token and code, then updates the user's email verification status.
 *              If the token is expired or the code is invalid, appropriate error messages are returned.
 * @param {Object} req - The Express request object containing the activation token and code.
 * @param {Object} res - The Express response object to send the response.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const activateUser = catchAsyncError(async (req, res, next) => {
  try {
    // Destructure activation token and activation code from request body
    const { activation_token, activation_code } = req.body;

    // Decode the activation token to extract user information
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    // Compare the extracted activation code with the code provided by the user
    if (newUser.activationCode.toString() !== activation_code.toString()) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    // Find user by email and set emailVerifiedStatus to true
    const user = await userModel.findOneAndUpdate(
      { email: newUser.email.email },
      { emailVerifiedStatus: true },
      { new: true }
    );

    // Save updated user details to database
    user.save();

    // Send successful response with the verified user object
    res.status(201).json({
      user: user,
      success: true,
    });
  } catch (error) {
    // Handle specific error for expired JWT token
    if (error.message === "jwt expired") {
      return next(
        new ErrorHandler("OTP Expired, kindly resend to get a new one!", 400)
      );
    }
    // Handle general errors
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function getUserIpAddress
 * @description Fetches the user's IP address with fallback options.
 *              Checks the x-forwarded-for header (for reverse proxies),
 *              then falls back to req.ip and req.connection.remoteAddress if necessary.
 * @param {Object} req - The Express request object.
 * @returns {string} The user's IP address as a string.
 */
export const getUserIpAddress = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  let ipAddress = forwarded
    ? forwarded.split(",")[0]
    : req.ip || req.connection.remoteAddress;

  // Check if running locally and simulate an external IP if needed
  if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
    // console.log("Local environment detected. Using simulated external IP for testing.");
    ipAddress = "52.4.55.112"; // Example simulated external IP for testing (USA)
    // ipAddress = '182.191.89.107'; // my (zulqurnain) IP for testing
  }
  return ipAddress;
};

/**
 * @function loginUser
 * @description Authenticates a user based on email and password, updates login details,
 *              and captures IP address and location data if available.
 *              Sends a response with authentication token upon successful login.
 * @param {Object} req - The Express request object containing user credentials.
 * @param {Object} res - The Express response object to send responses.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const loginUser = catchAsyncError(async (req, res, next) => {
  try {
    // Destructure email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(new ErrorHandler("Please enter email & password", 400));
    }

    // Find user by email and include password field in selection
    const user = await userModel.findOne({ email }).select("+password");

    // If user does not exist, return error
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    // Decode base64 password from the request and compare with stored password
    const decodedPassword = Buffer.from(password, "base64").toString("utf-8");
    const isPasswordMatch = await user.comparePassword(decodedPassword);

    // If passwords do not match, return error
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    // Check email verification status if the user role is not Admin
    if (user.userRole !== "Admin" && !user.emailVerifiedStatus) {
      return next(new ErrorHandler("Account not Verified", 400));
    }

    // Check if user is approved by admin if the user role is not Admin
    if (user.userRole !== "Admin" && !user.approvedByAdmin) {
      return next(new ErrorHandler("User not approved by admin", 400));
    }

    if (!user.customerId) {
      let customerId;
      let isUnique = false;

      while (!isUnique) {
        customerId = Math.floor(100000 + Math.random() * 900000).toString();
        const existingUser = await userModel.findOne({ customerId });
        if (!existingUser) {
          isUnique = true;
        }
      }
      const encodedId = btoa(customerId + process.env.ENCODE_KEY);
      user.customerId = encodedId;
      await user.save();
    } else if (user?.customerId.length <= 6) {
      const encodedId = btoa(user?.customerId + process.env.ENCODE_KEY);
      user.customerId = encodedId;
      await user.save();
    }

    // Get user IP address using helper function with multiple fallbacks
    const ipAddress = getUserIpAddress(req);

    // Initialize location details
    let region = "",
      country = "";

    // If IP address is present and not a local IP (e.g., ::1 or 127.0.0.1)
    if (ipAddress && ipAddress !== "::1" && ipAddress !== "127.0.0.1") {
      try {
        /**
         * Fetches location data based on the IP address using the external IP location API (ipapi.co).
         * The API returns information about the region and country corresponding to the IP.
         *
         * @constant {Object} locationResponse - The response object from the IP location API call.
         * @property {string} locationResponse.data.region - The region (e.g., state or province) associated with the IP address.
         * @property {string} locationResponse.data.country_name - The country name associated with the IP address.
         */
        const locationResponse = await axios.get(
          `https://ipapi.co/${ipAddress}/json/`
        );

        // Extract region and country data from the API response, defaulting to empty strings if data is unavailable
        region = locationResponse.data.region || "";
        country = locationResponse.data.country_name || "";
      } catch (locationError) {
        /**
         * Error handling block for the IP location fetch request.
         * If there’s an error (e.g., network issue or API downtime), it logs the error message.
         * This ensures the function continues to execute even if the location data cannot be retrieved.
         *
         * @param {Error} locationError - The error object caught during the IP location fetch.
         */
        console.error("Error fetching location data:", locationError.message);
      }
    }

    // Update user record with last login time, isActive status, IP, and location details
    await userModel.findByIdAndUpdate(
      user._id,
      {
        lastLogin: new Date(),
        isActive: true,
        ipAddress,
        region,
        country,
      },
      { new: true, select: "lastLogin isActive region country" } // Optional: return only updated fields
    );

    // Log user activity
    await logActivity({
      userId: user._id,
      action: "Login",
      description: `User ${email} logged in from ${ipAddress} in ${country}`,
      metadata: {
        name: user.firstName,
        email: user.email,
        role: user.userRole,
      },
    });

    // Generate and send authentication token along with user details in response
    sendToken(user, 200, res);
  } catch (error) {
    // Pass error to next middleware for handling
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function logoutUser
 * @description Logs out the user by clearing authentication cookies, updating the user’s
 *              status to inactive, and sending a success response.
 * @param {Object} req - The Express request object, with `req.user` containing the authenticated user's details.
 * @param {Object} res - The Express response object to send the logout response.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const logoutUser = catchAsyncError(async (req, res, next) => {
  try {
    // Extract user ID from authenticated request
    const userId = req.user._id;

    // Ensure the request is authenticated
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 400));
    }

    // Clear cookies for access and refresh tokens
    res.cookie("access_token", "", { maxAge: 0 });
    res.cookie("refresh_token", "", { maxAge: 0 });

    // Clear NextAuth cookies (if applicable)
    res.cookie("next-auth.session-token", "", { maxAge: -1 });
    res.cookie("next-auth.csrf-token", "", { maxAge: -1 });

    // Update user’s isActive status to false in the database
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: false }
    );

    // Ensure user status update was successful
    if (!updatedUser) {
      return next(new ErrorHandler("Failed to update user status", 400));
    }

    // Log user activity
    await logActivity({
      userId: updatedUser?._id,
      action: "Logout",
      description: `User ${updatedUser?.customerId} logged out from account.`,
      metadata: {
        name: updatedUser?.firstName,
        email: updatedUser?.email,
        role: updatedUser?.userRole,
      },
    });

    // Send success response after successful logout
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    // Handle any errors during the logout process
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function updateAccessToken
 * @description Generates new access and refresh tokens if the refresh token is valid,
 *              allowing the user to continue their session.
 * @param {Object} req - The Express request object containing cookies with the refresh token.
 * @param {Object} res - The Express response object for sending tokens if required.
 * @param {Function} next - The Express next middleware function for handling errors.
 */
export const updateAccessToken = catchAsyncError(async (req, res, next) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return next(new ErrorHandler("Refresh token not provided", 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }

    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler("Invalid refresh token", 401));
  }
});

/**
 * @function verifyUser
 * @description Responds with success if the user is verified and authenticated.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send a success response.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const verifyUser = catchAsyncError(async (req, res, next) => {
  try {
    // Send success response for verified and authenticated user
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    // Handle errors during user verification
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function getUserInfo
 * @description Retrieves the authenticated user's information using the user ID from `req.user`.
 *              Calls `getUserById` function to handle the retrieval and response.
 * @param {Object} req - The Express request object, containing `req.user` with the authenticated user’s ID.
 * @param {Object} res - The Express response object to send the user information.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const getUserInfo = catchAsyncError(async (req, res, next) => {
  try {
    // Extract user ID from authenticated request
    const userId = req.user?._id;

    // Call helper function to get user details by ID
    getUserById(userId, res);
  } catch (error) {
    // Handle any errors in retrieving user information
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function getUserInfoById
 * @description Retrieves user information based on the user ID provided in the request parameters.
 * @param {Object} req - The Express request object containing the user ID in `req.params`.
 * @param {Object} res - The Express response object to send the user information.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const getUserInfoById = catchAsyncError(async (req, res, next) => {
  try {
    // Extract user ID from request parameters
    const { id } = req.params;

    // Find the user by ID in the database
    const user = await userModel.findById(id);

    // Send user information in response
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    // Handle errors in retrieving user by ID
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function updatePassword
 * @description Updates the authenticated user's password after verifying the old password.
 *              The new password is hashed before saving to the database.
 * @param {Object} req - The Express request object containing old and new passwords in `req.body`.
 * @param {Object} res - The Express response object to confirm password update.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const updatePassword = catchAsyncError(async (req, res, next) => {
  try {
    // Extract old and new passwords from request body
    const { oldPassword, newPassword } = req.body;

    // Validate that both old and new passwords are provided
    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Please enter old and new password", 400));
    }

    // Find the authenticated user by ID and include the password field
    const user = await userModel.findById(req.user?._id).select("+password");

    // Ensure user is valid
    if (user?.password === undefined) {
      return next(new ErrorHandler("Invalid user", 400));
    }

    // Compare provided old password with the user's current password
    const isPasswordMatch = await user?.comparePassword(oldPassword);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid old password", 400));
    }

    // Hash the new password and update the user's password
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    // Save the updated user record
    await user.save();

    // Send success response confirming password update
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    // Handle any errors during password update
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function updateEmail
 * @description Updates the authenticated user's email after verifying the password and new email.
 * @param {Object} req - The Express request object containing old and new passwords in `req.body`.
 * @param {Object} res - The Express response object to confirm password update.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const updateEmail = catchAsyncError(async (req, res, next) => {
  try {
    // Extract old and new passwords from request body
    const { currentEmail, currentPassword, newEmail } = req.body;

    // Find the authenticated user by email and include the password field
    const user = await userModel
      .findOne({ email: currentEmail })
      .select("+password");

    // Ensure user is valid
    if (!user) {
      return next(new ErrorHandler("Invalid user", 400));
    }

    // Check if new Email does not already exist
    const isEmailExist = await userModel.findOne({ email: newEmail });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    // Compare provided old password with the user's current password
    const decodedPassword = Buffer.from(currentPassword, "base64").toString(
      "utf-8"
    );
    const isPasswordMatch = await user.comparePassword(decodedPassword);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid Current password", 400));
    }

    sendActivationCode(req, res, next);
  } catch (error) {
    // Handle any errors during password update
    return next(new ErrorHandler(error.message, 400));
  }
});

export const verifyNewEmail = catchAsyncError(async (req, res, next) => {
  try {
    // Destructure activation token and activation code from request body
    const { activation_token, activation_code } = req.body;

    // Decode the activation token to extract user information
    const oldUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

    // Compare the extracted activation code with the code provided by the user
    if (oldUser.activationCode.toString() !== activation_code.toString()) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    // Find user by email and set emailVerifiedStatus to true
    const updatedUser = await userModel.findOneAndUpdate(
      {
        email: oldUser.email.email,
      },
      { email: oldUser.email.newEmail },
      {
        new: true,
        runValidators: true,
      }
    );

    await Invitation.updateMany(
      { doctorEmail: oldUser.email.email },
      { doctorEmail: oldUser.email.newEmail }
    );
    await PatientInvitation.updateMany(
      { patientEmail: oldUser.email.email },
      { patientEmail: oldUser.email.newEmail }
    );

    // Log user activity
    await logActivity({
      userId: oldUser._id,
      action: "Email Changed",
      description: `User ${req?.user?.customerId} changed email ${oldUser?.email?.email} to ${oldUser.email.newEmail}`,
      metadata: {
        name: oldUser.firstName,
        email: oldUser.email.email,
        role: oldUser.userRole,
      },
    });

    // Send successful response with the verified user object
    res.status(201).json({
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    // Handle specific error for expired JWT token
    if (error.message === "jwt expired") {
      return next(
        new ErrorHandler("OTP Expired, kindly resend to get a new one!", 400)
      );
    }
    // Handle general errors
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function updateUserInfo
 * @description Updates the authenticated user's information with new data provided in the request body.
 *              Supports updating basic information and avatar image. If a new avatar is uploaded,
 *              the existing one is removed from cloud storage.
 * @param {Object} req - The Express request object containing user update details in `req.body`
 *                       and the authenticated user's ID in `req.user`.
 * @param {Object} res - The Express response object to send the updated user information.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const updateUserInfo = catchAsyncError(async (req, res, next) => {
  try {
    // Extract update data from request body and user ID from authenticated request
    const data = req.body;
    const userId = req.user?._id;

    // Find user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Check for NPI number uniqueness if it is being updated
    if (data.npiNumber && data.npiNumber !== user.npiNumber) {
      const isNpiNumberExist = await userModel.findOne({
        npiNumber: data.npiNumber,
      });
      if (isNpiNumberExist) {
        return next(new ErrorHandler("License number already exists!", 400));
      }
    }

    // Define fields to update with fallback to current values if not provided
    const updateFields = {
      firstName: data.firstName || user.firstName,
      lastName: data.lastName || user.lastName,
      phoneNumber: data.phoneNumber || user.phoneNumber,
      address: data.address || user.address,
      city: data.city || user.city,
      state: data.state || user.state,
      timeZone: data.timeZone || user.timeZone,
      zipCode: data.zipCode || user.zipCode,
      npiNumber: data.npiNumber || user.npiNumber,
    };

    // Handle avatar update if a new avatar is provided
    if (data.avatar) {
      if (user.avatar && data.avatar !== user.avatar.url) {
        // If a different avatar is provided, delete the existing one from cloud storage
        if (user.avatar.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }

        // Upload new avatar if in base64 format
        if (data.avatar.startsWith("data:image")) {
          const myCloud = await cloudinary.v2.uploader.upload(data.avatar, {
            folder: "avatars",
            width: 150,
          });

          updateFields.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      } else {
        // If new avatar matches the current one, retain the existing avatar
        updateFields.avatar = user.avatar;
      }
    }

    // Update user information in the database
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    // If NPI number is updated, update it in the invitations model
    if (data.npiNumber && data.npiNumber !== user.npiNumber) {
      await invitationModel.updateMany(
        { npiNumber: user.npiNumber },
        { npiNumber: data.npiNumber }
      );
      await patientInvitationModel.updateMany(
        { npiNumber: user.npiNumber },
        { npiNumber: data.npiNumber }
      );
    }

    // Send response with the updated user information
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    // Handle errors in updating user information
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function getAllUsers
 * @description Retrieves a list of all users in the system. This endpoint is accessible only to admins.
 *              Calls `getAllUsersService` to handle retrieval and response.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send the list of users.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  try {
    // Call service function to retrieve all users
    getAllUsersService(res);
  } catch (error) {
    // Handle errors in retrieving users
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function updateUserRole
 * @description Updates a user's role based on the user ID and new role provided in the request body.
 *              This function is intended for admin use only.
 * @param {Object} req - The Express request object containing `id` and `role` in `req.body`.
 * @param {Object} res - The Express response object to send the response.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  try {
    // Extract user ID and new role from the request body
    const { id, role } = req.body;

    // Call service function to update user role
    updateUserRoleService(res, id, role);
  } catch (error) {
    // Handle errors in updating user role
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function resetPassword
 * @description Initiates a password reset process for a user by verifying the email, generating a reset token,
 *              and sending a reset link to the user's email.
 * @param {Object} req - The Express request object containing the user's email in `req.body`.
 * @param {Object} res - The Express response object to send the password reset response.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const resetPassword = catchAsyncError(async (req, res, next) => {
  try {
    // Extract email from the request body
    const { email } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("Email not found", 404));
    }

    // Generate a reset token with 5-minute expiration
    const token = jwt.sign({ email }, process.env.ACTIVATION_SECRET, {
      expiresIn: "5m",
    });

    // Construct reset password URL with the generated token
    const passwordurl = process.env.BASE_URL + "auth/new-password/" + token;
    const data = { name: user.firstName, token, passwordurl };

    try {
      // Send reset email to the user
      await sendMail({
        email: user.email,
        subject: "Reset Theryo.ai User Password",
        template: "reset-password-mail.ejs",
        data,
      });

      // Send response with confirmation and token information
      res.status(200).json({
        success: true,
        message: `Please check your email: ${user.email} to reset your password`,
        token: token,
      });
    } catch (error) {
      // Handle email sending errors
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    // Handle errors in password reset process
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function setPassword
 * @description Sets a new password for the user by verifying the reset token, checking password confirmation,
 *              hashing the new password, and saving it to the database.
 * @param {Object} req - The Express request object containing the new password details in `req.body`.
 * @param {Object} res - The Express response object to send the password reset confirmation.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const setPassword = catchAsyncError(async (req, res, next) => {
  try {
    // Extract password data and token from the request body
    const { data } = req.body;
    const { newPassword, confirmPassword, token } = data;

    // Verify the reset token
    const decoded = jwt.verify(token, process.env.ACTIVATION_SECRET);

    if (!decoded) {
      return next(
        new ErrorHandler(
          "Your Link has been expired, please generate a new link!",
          500
        )
      );
    }

    // Find the user by email from the decoded tokeFn
    const user = await userModel.findOne({ email: decoded.email });

    // Hash the new password and update user's password field
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    // Save the updated user record
    await user.save();

    // Send success response after password reset
    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.error(error);
    // Handle errors, including expired token
    return next(
      new ErrorHandler(
        "Your Link has been expired, please generate a new link!",
        500
      )
    );
  }
});

/**
 * @function addDoctor
 * @description Allows a patient to invite a doctor by sending an invitation email. Checks if the provider is already linked with the patient or if an invitation already exists. If the doctor is not registered, an invitation to sign up is sent.
 * @param {Object} req - The Express request object containing `providerId`, `doctorName`, and `doctorEmail` in `req.body`, and the authenticated user's ID in `req.user`.
 * @param {Object} res - The Express response object to send the invitation response.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const addDoctor = catchAsyncError(async (req, res, next) => {
  const { providerId, doctorName, doctorEmail } = req.body;
  const senderId = req.user?._id;

  const providerData = await userModel.findOne({
    customerId: providerId,
    email: doctorEmail,
    userRole: "Provider",
  });

  try {
    // Fetch the current user details
    const user = await userModel.findById(senderId);
    const userEmail = user.email.trim();
    let patientInvitations = [];

    if (providerData) {
      // Check if the patient's email is already linked with the provider
      patientInvitations = await patientInvitationModel.find({
        senderId: providerData._id,
        patientEmail: userEmail,
        // patientId: user.customerId, // Use providerData.customerId as patientId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Provider ID or Email not matched with provider.`,
      });
    }

    if (patientInvitations.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Your account is already linked with this provider.`,
      });
    }

    // Check if an invitation already exists
    const isEmailExist = await userModel.findOne({ email: doctorEmail });
    const isDuplicateInvitation = await invitationModel.findOne({
      senderId: senderId,
      doctorEmail: doctorEmail,
      // doctorId: providerId,
    });

    if (isDuplicateInvitation) {
      return res.status(200).json({
        success: false,
        message: `Invitation already exists for this provider against this sender.`,
      });
    } else {
      if (isEmailExist) {
        // Doctor already exists in the system
        const loginUrl = process.env.BASE_URL + "auth/login";
        const data = {
          user: {
            username: user.firstName,
            loginUrl,
            doctorName,
            doctorEmail,
          },
        };

        try {
          // Send invitation email to existing provider
          await sendMail({
            email: doctorEmail,
            subject: "Join Theryo.ai: Invitation for Healthcare Providers",
            template: "invitation-doctor-mail.ejs",
            data,
          });

          // Save the invitation to the database
          const newInvitation = await invitationModel.create({
            senderId,
            doctorId: isEmailExist.customerId, // Use isEmailExist.customerId as doctorId
            doctorName,
            doctorEmail,
          });

          await newInvitation.save();

          return res.status(201).json({
            success: true,
            message: `Invitation email sent to ${doctorName} at ${doctorEmail}`,
          });
        } catch (error) {
          return next(new ErrorHandler(error.message, 400));
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Provider email does not exist in the system.`,
        });
      }
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function getInvitedDoctors
 * @description Retrieves a list of doctors invited by the user and doctors who have invited the user.
 *              Merges data from both invitations sent by the user and received by the user.
 * @param {Object} req - The Express request object containing `patientId` as a route parameter.
 * @param {Object} res - The Express response object to send the invitation data.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const getInvitedDoctors = catchAsyncError(async (req, res, next) => {
  try {
    const { Types } = mongoose;
    const userIdFromSession = req.user?._id;
    const patientIdFromParams = req.params.patientId;
    const patientId =
      patientIdFromParams && patientIdFromParams.trim() !== ""
        ? new Types.ObjectId(patientIdFromParams)
        : null;

    const userId = patientId || userIdFromSession;

    if (!userId) {
      throw new Error(
        "Unauthorized access. Please login or provide a valid patient ID."
      );
    }

    // Fetch the user's email based on their ID
    const user = await userModel.findById(userId);
    const userEmail = user.email.trim();

    // Check if there are invitations linked to the user's email
    const patientInvitations = await patientInvitationModel.find({
      patientEmail: userEmail,
    });

    const invitations = await invitationModel.find({
      senderId: userId,
    });

    const doctorIds = invitations.map((invitation) => invitation.doctorEmail);
    const doctors = await userModel.find(
      { email: { $in: doctorIds } },
      { password: 0 }
    );

    // Map invitations to include doctor details
    const invitationData = invitations.map((invitation) => {
      const matchingDoctor = doctors.find(
        (doctor) => doctor.email === invitation.doctorEmail
      );
      return {
        invitationId: invitation._id,
        doctorName: invitation.doctorName,
        customerId: invitation.doctorId || matchingDoctor?.customerId,
        doctorEmail: invitation.doctorEmail,
        sentOn: invitation.sentOn,
        getInvited: "sendInvitation",
        invitationStatus: invitation.invitationStatus,
        doctor: matchingDoctor || null,
      };
    });

    // Map received invitations to include details of the inviting doctor
    const patientInvitationData = await Promise.all(
      patientInvitations.map(async (invitation) => {
        const doctor = await userModel.findById(invitation.senderId, {
          firstName: 1,
          lastName: 1,
          customerId: 1,
          email: 1,
        });

        return {
          patientInvitationId: invitation._id,
          doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "",
          customerId: doctor ? doctor.customerId : "",
          doctorEmail: doctor ? doctor.email : "",
          sentOn: invitation.sentOn,
          getInvited: "recieveInvitation",
          invitationStatus: invitation.invitationStatus,
        };
      })
    );

    // Merge both sent and received invitation data
    const allInvitationData = patientInvitationData.concat(invitationData);

    const validAllInvitationData = allInvitationData.filter(Boolean);

    res.status(200).json({
      success: true,
      data: validAllInvitationData,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @function updateInvitationStatusById
 * @description Updates the status of a provider invitation by the invitation ID. This function
 *              verifies the presence of both ID and new status before attempting an update.
 *              If the invitation is found and updated, the updated record is returned in the response.
 * @param {Object} req - The Express request object containing `id` and `newStatus` in `req.body`.
 * @param {Object} res - The Express response object to send the updated invitation status.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const updateInvitationStatusById = catchAsyncError(
  async (req, res, next) => {
    try {
      // Extract new status and invitation ID from the request body
      const { newStatus, id } = req.body;

      // Check if both ID and new status are provided
      if (!id || !newStatus) {
        throw new Error("Please provide the ID and new status.");
      }

      // Update the invitation status in the database
      const updatedInvitation = await patientInvitationModel.findByIdAndUpdate(
        id,
        { invitationStatus: newStatus },
        { new: true }
      );

      // If the invitation is not found, return a 404 error
      if (!updatedInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // Send response with the updated invitation
      res.status(200).json({
        success: true,
        updatedInvitation: updatedInvitation,
      });
    } catch (error) {
      // Handle errors using the custom error handler
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * @function getAllRecordOfPatient
 * @description Retrieves all relevant records associated with a specific patient, including basic
 *              user data and patient-specific goals. Useful for displaying a comprehensive profile view.
 * @param {Object} req - The Express request object containing `reportId` and `patientId` in `req.body`.
 * @param {Object} res - The Express response object to send the patient’s records.
 * @param {Function} next - The Express next middleware function for error handling.
 */
export const getAllRecordOfPatient = catchAsyncError(async (req, res, next) => {
  try {
    // Extract report ID and patient ID from the request body
    const { reportId, patientId } = req.body;

    // Retrieve user data for the specified patient ID
    const userData = await userModel.findById(patientId);

    // Retrieve goals for the specified patient ID
    const goals = await Goal.find({ userId: patientId });

    // You may want to structure the response with the retrieved data here
    res.status(200).json({
      success: true,
      userData,
      goals,
    });
  } catch (error) {
    // Handle errors using the custom error handler
    return next(new ErrorHandler(error.message, 400));
  }
});
