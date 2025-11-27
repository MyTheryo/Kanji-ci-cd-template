import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import Emotion from "../model/emotion.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { uploadIconToCloudinary } from "../utils/uploadIcon.js";

// create Emotion
export const createEmotion = catchAsyncError(async (req, res, next) => {
  try {
    let { title, icon } = req.body;
    const userId = req.user?._id;

     title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    // const cloundIcon = await uploadIconToCloudinary(icon);

    const newEmotion = new Emotion({
      title,
      icon,
      userId
    });

    const savedEmotion = await newEmotion.save()

    res.status(200).json({
      success: true,
      savedEmotion,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get All emotions
export const getAllEmotions = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const emotions = await Emotion.find({userId});

    res.status(200).json({
      success: true,
      emotions,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const deleteEmotion = catchAsyncError(async (req, res, next) => {
  try {
    const id = req.body.id;
    await Emotion.findByIdAndDelete(id);
    res.status(201).json({
      success: true,
      message: "Emotion deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message));
  }
});
