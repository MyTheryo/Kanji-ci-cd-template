import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import Betterme from "../model/betterme.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { uploadIconToCloudinary } from "../utils/uploadIcon.js";
// create Emotion
export const createBetterme = catchAsyncError(async (req, res, next) => {
  try {
    let { title, icon } = req.body;
    const userId = req.user?._id;
    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    // const cloundIcon = await uploadIconToCloudinary(icon);
    // const cloundIcon = await uploadIconToCloudinary(icon);
    const newBetterme = new Betterme({
      title,
      icon,
      userId,
    });
    const savedBetterme = await newBetterme.save();
    res.status(200).json({
      success: true,
      savedBetterme,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// Get All emotions
export const getallBetterme = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const betterme = await Betterme.find({ userId });
    res.status(200).json({
      success: true,
      betterme,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// delete betterme
export const deleteBetterme = catchAsyncError(async (req, res, next) => {
  try {
    const id = req.body.id;
    await Betterme.findByIdAndDelete(id);
    res.status(201).json({
      success: true,
      message: "Betterme deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message));
  }
});
