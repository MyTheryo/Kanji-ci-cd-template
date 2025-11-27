import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { catchAsyncError } from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import userModel from "../model/user.model.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Please login to access this resource", 400));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 400));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid", 400));
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    // Update only lastActivity field
    await userModel.findByIdAndUpdate(user._id, { lastActivity: new Date() });

    req.user = user;
   
    next();
  } catch (error) {
    return next(new ErrorHandler("Json web token is expired. Try again here", 400));
  }
});

// Validate user role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.userRole} is not allowed to access this resource`,
          400
        )
      );
    }

    next();
  };
};
