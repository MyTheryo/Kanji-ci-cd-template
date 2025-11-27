import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import Productivity from "../model/productivity.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { uploadIconToCloudinary } from "../utils/uploadIcon.js";
// create Emotion
export const createProductivty = catchAsyncError(async (req, res, next) => {
  try {
    let { title, icon } = req.body;
    const userId = req.user?._id;
    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    // const cloundIcon = await uploadIconToCloudinary(icon);
    const newProductivity = new Productivity({
      title,
      icon,
      userId,
    });
    const savedProductivity = await newProductivity.save();
    res.status(200).json({
      success: true,
      savedProductivity,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// Get All emotions
export const getAllProductivity = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const productivity = await Productivity.find({ userId });
    res.status(200).json({
      success: true,
      productivity,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// delete productivity
export const deleteProductivity = catchAsyncError(async (req, res, next) => {
  try {
    const id = req.body.id;
    await Productivity.findByIdAndDelete(id);
    res.status(201).json({
      success: true,
      message: "Productivity deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message));
  }
});
