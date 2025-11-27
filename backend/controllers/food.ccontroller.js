import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import Food from "../model/food.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { uploadIconToCloudinary } from "../utils/uploadIcon.js";
// create Emotion
export const createFood = catchAsyncError(async (req, res, next) => {
  try {
    let { title, icon } = req.body;
    const userId = req.user?._id;
    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    // const cloundIcon = await uploadIconToCloudinary(icon);
    const newFood = new Food({
      title,
      icon,
      userId,
    });
    const savedFood = await newFood.save();
    res.status(200).json({
      success: true,
      savedFood,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// Get All emotions
export const getAllFoods = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const foods = await Food.find({ userId });
    res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// delete food
export const deleteFood = catchAsyncError(async (req, res, next) => {
  try {
    const id = req.body.id;
    await Food.findByIdAndDelete(id);
    res.status(201).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message));
  }
});
